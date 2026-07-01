import { useCallback, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { analyzeDocument } from "@/lib/document-intelligence.functions";
import { uploadAndCreateArsip } from "@/lib/upload-arsip.functions";
import {
  checkNomorSurat,
  type NomorSuratCheckResult,
} from "@/lib/nomor-check.functions";
import { createKategori } from "@/lib/kategori.functions";
import { ARSIP_DEPENDENT_KEYS } from "@/lib/query-keys";
import { validateBatch, validateSingleFile } from "../services/validation";
import { buildField, emptyMetadata, needsReview } from "../services/metadataNormalizer";
import {
  DEFAULT_FORM,
  buildFormFromMetadata,
  validateForm,
} from "../services/formMapping";
import type {
  ArsipFormValues,
  ExtractedMetadata,
  MasterOption,
  QueuedFile,
  WorkspaceSummary,
} from "../types";
import { MAX_FILES, MAX_FILE_SIZE_BYTES } from "../constants";

function newId() {
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + CHUNK)),
    );
  }
  return btoa(binary);
}

/**
 * For photo documents captured by phone cameras, downscale the long edge
 * to 2200px and re-encode as JPEG before sending to the AI gateway and R2.
 * Keeps payloads under the 5 MB limit while preserving OCR quality. PDFs
 * and small images pass through untouched.
 */
async function normalizeImageIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.size <= 1.5 * 1024 * 1024) return file;
  if (typeof document === "undefined") return file;
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error ?? new Error("read fail"));
      r.readAsDataURL(file);
    });
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("decode fail"));
      i.src = dataUrl;
    });
    const MAX_EDGE = 2200;
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.86),
    );
    if (!blob) return file;
    const ext = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${ext}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

async function fileToBase64(file: File): Promise<string> {
  return blobToBase64(file);
}

async function readAsTextSafe(file: File): Promise<string | undefined> {
  const lower = file.name.toLowerCase();
  const isPlainText =
    file.type.startsWith("text/") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".csv");
  if (isPlainText) {
    try {
      return (await file.text()).slice(0, 60_000);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function metadataFromResponse(
  data: Awaited<ReturnType<typeof analyzeDocument>>["metadata"],
): ExtractedMetadata {
  return {
    judul: buildField(data.judul.value, data.judul.confidence),
    nomorSurat: buildField(data.nomor_surat.value, data.nomor_surat.confidence),
    tanggalSurat: buildField(data.tanggal_surat.value, data.tanggal_surat.confidence),
    tanggalDokumen: buildField(
      data.tanggal_dokumen.value,
      data.tanggal_dokumen.confidence,
    ),
    pengirim: buildField(data.pengirim.value, data.pengirim.confidence),
    penerima: buildField(data.penerima.value, data.penerima.confidence),
    instansi: buildField(data.instansi.value, data.instansi.confidence),
    perihal: buildField(data.perihal.value, data.perihal.confidence),
    jenis: buildField(data.jenis.value, data.jenis.confidence),
    kategori: buildField(data.kategori.value, data.kategori.confidence),
    lokasiFisik: buildField(data.lokasi_fisik.value, data.lokasi_fisik.confidence),
    ringkasan: buildField(data.ringkasan.value, data.ringkasan.confidence),
    keywords: buildField(data.keywords.value, data.keywords.confidence),
  };
}

export function useUploadQueue(masters: {
  kategori: MasterOption[];
  lokasi: MasterOption[];
}) {
  const queryClient = useQueryClient();
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [rejected, setRejected] = useState<
    Array<{ name: string; reason: string }>
  >([]);
  const [isAnalysing, setAnalysing] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [summary, setSummary] = useState<WorkspaceSummary | null>(null);
  /** Hasil AI Pengecekan Nomor Surat per item. */
  const [nomorCheck, setNomorCheck] = useState<
    Record<string, NomorSuratCheckResult>
  >({});
  /** Item mana yang sedang menjalankan AI Pengecekan Nomor Surat. */
  const [nomorChecking, setNomorChecking] = useState<Record<string, boolean>>(
    {},
  );
  /** Usulan kategori baru dari AI per item (belum disetujui admin). */
  const [categoryProposals, setCategoryProposals] = useState<
    Record<string, { value: string; alasan: string }>
  >({});
  /** Sedang memproses persetujuan kategori baru. */
  const [approvingCategory, setApprovingCategory] = useState<
    Record<string, boolean>
  >({});
  const seq = useRef(0);
  // Use a ref for masters so the analyse closure always sees the latest list
  // without forcing re-creation of all callbacks.
  const mastersRef = useRef(masters);
  mastersRef.current = masters;

  const update = useCallback(
    (id: string, patch: Partial<QueuedFile>) =>
      setQueue((cur) =>
        cur.map((q) => (q.id === id ? { ...q, ...patch } : q)),
      ),
    [],
  );

  const enqueue = useCallback((files: File[]) => {
    setQueue((cur) => {
      const { accepted, rejected: rej } = validateBatch(files, cur.length);
      if (rej.length) {
        setRejected((r) => [
          ...r,
          ...rej.map((x) => ({ name: x.file.name, reason: x.reason })),
        ]);
      }
      const items: QueuedFile[] = accepted.map((f) => ({
        id: newId(),
        file: f,
        status: "menunggu",
        progress: 0,
        form: { ...DEFAULT_FORM },
        aiFilled: {},
      }));
      return [...cur, ...items];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setQueue((cur) => cur.filter((q) => q.id !== id));
    setNomorCheck((d) => {
      const { [id]: _, ...rest } = d;
      return rest;
    });
    setNomorChecking((d) => {
      const { [id]: _, ...rest } = d;
      return rest;
    });
    setCategoryProposals((d) => {
      const { [id]: _, ...rest } = d;
      return rest;
    });
  }, []);

  const clear = useCallback(() => {
    setQueue([]);
    setRejected([]);
    setSummary(null);
    setNomorCheck({});
    setNomorChecking({});
    setCategoryProposals({});
    setApprovingCategory({});
  }, []);

  const dismissRejection = useCallback((index: number) => {
    setRejected((cur) => cur.filter((_, i) => i !== index));
  }, []);

  const updateForm = useCallback(
    (id: string, patch: Partial<ArsipFormValues>) => {
      // Editing nomor surat invalidates the previous nomor-check result so
      // the administrator sees a fresh check after any edit.
      if (patch.nomorSurat !== undefined) {
        setNomorCheck((d) => {
          if (!d[id]) return d;
          const { [id]: _, ...rest } = d;
          return rest;
        });
      }
      setQueue((cur) =>
        cur.map((q) => {
          if (q.id !== id) return q;
          const nextForm = { ...(q.form ?? DEFAULT_FORM), ...patch };
          // Operator edits invalidate the AI-filled flag for that field.
          const nextFlags = { ...(q.aiFilled ?? {}) };
          for (const k of Object.keys(patch) as Array<keyof ArsipFormValues>) {
            nextFlags[k] = false;
          }
          // After edits, re-evaluate readiness. If required fields are now
          // complete and metadata was previously borderline, mark siap_upload.
          const reqOk =
            nextForm.nomorSurat.trim() &&
            nextForm.judul.trim() &&
            nextForm.kategori.trim();
          let nextStatus = q.status;
          if (
            (q.status === "perlu_review" || q.status === "siap_upload") &&
            reqOk
          ) {
            nextStatus = "siap_upload";
          } else if (
            (q.status === "perlu_review" || q.status === "siap_upload") &&
            !reqOk
          ) {
            nextStatus = "perlu_review";
          }
          return { ...q, form: nextForm, aiFilled: nextFlags, status: nextStatus };
        }),
      );
    },
    [],
  );

  const analyseAll = useCallback(async () => {
    const targets = queue.filter(
      (q) => q.status === "menunggu" || q.status === "gagal",
    );
    if (targets.length === 0) return;
    const runId = ++seq.current;
    setAnalysing(true);
    setSummary(null);

    await Promise.all(
      targets.map(async (q) => {
        if (seq.current !== runId) return;
        try {
          update(q.id, { status: "dianalisis", error: undefined });
          const normalized = await normalizeImageIfNeeded(q.file);
          if (normalized !== q.file) {
            update(q.id, { file: normalized });
          }
          const workFile = normalized;
          const textPreview = await readAsTextSafe(workFile);
          const isImageOrScan =
            workFile.type.startsWith("image/") ||
            workFile.type === "application/pdf";
          if (isImageOrScan) update(q.id, { status: "ocr" });
          const base64 = await fileToBase64(workFile);
          update(q.id, { status: "ekstraksi" });
          const availableCategories = mastersRef.current.kategori
            .map((k) => k.nama)
            .filter((n) => n && n.trim().length > 0);
          const result = await analyzeDocument({
            data: {
              mime: workFile.type || "application/octet-stream",
              base64,
              textPreview,
              sizeBytes: workFile.size,
              availableCategories,
            },
          });
          const meta = metadataFromResponse(result.metadata);
          // AI Smart Category Recognition — jika AI mengusulkan kategori baru
          // simpan sebagai proposal (tidak auto-create) untuk ditinjau admin.
          const proposedRaw = (result.metadata as unknown as {
            kategori_saran_baru?: { value: string | null; alasan: string | null };
          }).kategori_saran_baru;
          const proposedName = (proposedRaw?.value ?? "").trim();
          if (proposedName && !meta.kategori.value) {
            const already = mastersRef.current.kategori.some(
              (k) => k.nama.trim().toLowerCase() === proposedName.toLowerCase(),
            );
            if (!already) {
              setCategoryProposals((cur) => ({
                ...cur,
                [q.id]: {
                  value: proposedName,
                  alasan: (proposedRaw?.alasan ?? "").trim(),
                },
              }));
            }
          }
          const { form, aiFilled } = buildFormFromMetadata(
            meta,
            mastersRef.current,
          );
          // Preserve any prior operator edits on the form.
          setQueue((cur) =>
            cur.map((item) => {
              if (item.id !== q.id) return item;
              const prevForm = item.form ?? DEFAULT_FORM;
              const merged: ArsipFormValues = { ...form };
              // Keep operator-entered values when present.
              (
                Object.keys(prevForm) as Array<keyof ArsipFormValues>
              ).forEach((k) => {
                const prev = prevForm[k];
                const wasAi = item.aiFilled?.[k];
                if (!wasAi && prev && prev !== DEFAULT_FORM[k]) {
                  (merged as Record<string, unknown>)[k as string] = prev;
                }
              });
              const reqOk =
                merged.nomorSurat.trim() &&
                merged.judul.trim() &&
                merged.kategori.trim();
              return {
                ...item,
                metadata: meta,
                form: merged,
                aiFilled,
                durations: result.durations,
                status: reqOk && !needsReview(meta) ? "siap_upload" : "perlu_review",
              };
            }),
          );
        } catch (e) {
          update(q.id, {
            status: "gagal",
            error: (e as Error).message ?? "Gagal menganalisis dokumen.",
          });
        }
      }),
    );

    if (seq.current === runId) setAnalysing(false);
  }, [queue, update]);

  /**
   * AI Pengecekan Nomor Surat — fitur AI terpisah yang dijalankan admin
   * setelah AI Analisis Metadata selesai. Tidak membatalkan upload; hanya
   * memberi tahu bila nomor surat sudah pernah dipakai.
   */
  const checkNomorForItem = useCallback(
    async (id: string) => {
      const target = queue.find((q) => q.id === id);
      const nomor = target?.form?.nomorSurat?.trim() ?? "";
      if (!nomor) return;
      setNomorChecking((cur) => ({ ...cur, [id]: true }));
      try {
        const result = await checkNomorSurat({ data: { nomorSurat: nomor } });
        setNomorCheck((cur) => ({ ...cur, [id]: result }));
      } catch (err) {
        console.warn("[nomor-check] failed", err);
        setNomorCheck((cur) => ({
          ...cur,
          [id]: {
            nomorSurat: nomor,
            found: false,
            matches: [],
            checkedAt: new Date().toISOString(),
          },
        }));
      } finally {
        setNomorChecking((cur) => ({ ...cur, [id]: false }));
      }
    },
    [queue],
  );

  /**
   * Persetujuan usulan kategori baru — membuat kategori pada Manajemen
   * Kategori (satu sumber data) lalu memasangnya ke form arsip terkait.
   */
  const approveCategoryProposal = useCallback(
    async (id: string) => {
      const proposal = categoryProposals[id];
      if (!proposal) return;
      setApprovingCategory((cur) => ({ ...cur, [id]: true }));
      try {
        const nama = proposal.value.trim();
        // Kode sederhana dari huruf pertama tiap kata, uppercase, max 8 char.
        const kode = (
          nama
            .split(/\s+/)
            .map((w) => w[0] ?? "")
            .join("")
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "") || "KAT"
        ).slice(0, 8);
        await createKategori({
          data: {
            nama,
            kode,
            deskripsi: proposal.alasan
              ? `Diusulkan AI: ${proposal.alasan}`
              : "Diusulkan AI dari analisis metadata dokumen.",
            status: "Aktif",
          },
        });
        // Refresh master data agar dropdown Kategori di form menampilkan
        // kategori baru dan modul lain ikut sinkron.
        await queryClient.invalidateQueries({ queryKey: ["kategori"] });
        // Pasangkan kategori baru ke form item terkait.
        setQueue((cur) =>
          cur.map((q) =>
            q.id === id
              ? {
                  ...q,
                  form: { ...(q.form ?? DEFAULT_FORM), kategori: nama },
                  aiFilled: { ...(q.aiFilled ?? {}), kategori: true },
                }
              : q,
          ),
        );
        setCategoryProposals((cur) => {
          const { [id]: _, ...rest } = cur;
          return rest;
        });
      } catch (err) {
        console.warn("[category-proposal] approve failed", err);
      } finally {
        setApprovingCategory((cur) => ({ ...cur, [id]: false }));
      }
    },
    [categoryProposals, queryClient],
  );

  const dismissCategoryProposal = useCallback((id: string) => {
    setCategoryProposals((cur) => {
      const { [id]: _, ...rest } = cur;
      return rest;
    });
  }, []);

  const uploadOne = useCallback(
    async (id: string) => {
      const target = queue.find((q) => q.id === id);
      if (!target) return false;
      if (target.status === "berhasil") return true;
      if (
        target.status !== "siap_upload" &&
        target.status !== "perlu_review"
      ) {
        return false;
      }
      const form = target.form ?? DEFAULT_FORM;
      const errs = validateForm(form);
      if (Object.keys(errs).length > 0) {
        const firstErr = Object.values(errs)[0] ?? "Lengkapi form terlebih dulu.";
        update(id, { status: "perlu_review", error: firstErr });
        return false;
      }

      update(id, { status: "sedang_upload", progress: 5, error: undefined });

      try {
        const mime = target.file.type || "application/octet-stream";
        const tahun = Number(form.tahun) || new Date().getFullYear();
        // Encode file bytes for the single-call server upload. This avoids
        // direct browser→R2 PUTs (which require R2 bucket CORS) and the
        // associated "Failed to fetch" failures at the network edge.
        const fileBase64 = await fileToBase64(target.file);
        update(id, { progress: 30 });

        const created = await uploadAndCreateArsip({
          data: {
            nomorSurat: form.nomorSurat.trim(),
            judul: form.judul.trim(),
            kategori: form.kategori.trim(),
            jenis: form.jenis,
            tahun,
            lokasiFisik: form.lokasiFisik || null,
            status: form.status,
            deskripsi: form.deskripsi || null,
            fileName: target.file.name,
            mimeType: mime,
            fileSize: target.file.size,
            fileBase64,
          },
        });
        update(id, { progress: 90 });

        update(id, {
          status: "berhasil",
          progress: 100,
          arsipId: created.id,
          error: undefined,
        });
        setNomorCheck((d) => {
          const { [id]: _, ...rest } = d;
          return rest;
        });
        // Sync all consumer-layer queries: Manajemen, Cari, Dashboard,
        // Statistik, Retensi, and activity feed.
        for (const key of ARSIP_DEPENDENT_KEYS) {
          void queryClient.invalidateQueries({ queryKey: key });
        }
        return true;
      } catch (e) {
        update(id, {
          status: "gagal",
          progress: 0,
          error: (e as Error).message ?? "Gagal mengunggah arsip.",
        });
        return false;
      }
    },
    [queue, update, queryClient],
  );

  const uploadAll = useCallback(async () => {
    const targets = queue.filter((q) => q.status === "siap_upload");
    if (targets.length === 0) return;
    setUploading(true);
    const startedAt = Date.now();
    for (const t of targets) {
      await uploadOne(t.id);
    }
    setUploading(false);

    setSummary((prev) => {
      const snap = queue;
      const sum = snap.reduce(
        (acc, q) => {
          acc.total += 1;
          if (q.status === "berhasil") acc.berhasil += 1;
          if (q.status === "gagal") acc.gagal += 1;
          if (q.status === "perlu_review") acc.perluReview += 1;
          if (q.durations) acc.durasiAnalisisMs += q.durations.total;
          return acc;
        },
        {
          total: 0,
          berhasil: 0,
          gagal: 0,
          perluReview: 0,
          durasiAnalisisMs: 0,
          durasiUploadMs: prev?.durasiUploadMs ?? 0,
        } as WorkspaceSummary,
      );
      sum.durasiUploadMs = Date.now() - startedAt;
      return sum;
    });
  }, [queue, uploadOne]);

  const stats = useMemo(
    () => ({
      total: queue.length,
      siap: queue.filter((q) => q.status === "siap_upload").length,
      perluReview: queue.filter((q) => q.status === "perlu_review").length,
      berhasil: queue.filter((q) => q.status === "berhasil").length,
      gagal: queue.filter((q) => q.status === "gagal").length,
      maxFiles: MAX_FILES,
      maxSizeBytes: MAX_FILE_SIZE_BYTES,
    }),
    [queue],
  );

  return {
    queue,
    rejected,
    isAnalysing,
    isUploading,
    summary,
    stats,
    nomorCheck,
    nomorChecking,
    categoryProposals,
    approvingCategory,
    enqueue,
    remove,
    clear,
    dismissRejection,
    analyseAll,
    uploadOne,
    uploadAll,
    updateForm,
    checkNomorForItem,
    approveCategoryProposal,
    dismissCategoryProposal,
    validateSingleFile,
  };
}

// Kept exported for unused-warning compatibility.
export type { ExtractedMetadata };
