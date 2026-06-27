import { useCallback, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { analyzeDocument } from "@/lib/document-intelligence.functions";
import { createArsip } from "@/lib/upload-arsip.functions";
import { requestUploadUrl } from "@/lib/storage.functions";
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

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
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

/** Upload a Blob to a presigned PUT URL with bounded retry + exponential backoff. */
async function putWithRetry(
  url: string,
  file: File,
  opts: { maxAttempts?: number; onProgress?: (pct: number) => void } = {},
): Promise<void> {
  const max = opts.maxAttempts ?? 3;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= max; attempt++) {
    try {
      const res = await fetch(url, {
        method: "PUT",
        body: file,
        headers: file.type ? { "Content-Type": file.type } : undefined,
      });
      if (!res.ok) {
        throw new Error(`R2 upload gagal (HTTP ${res.status})`);
      }
      opts.onProgress?.(70);
      return;
    } catch (e) {
      lastErr = e;
      if (attempt < max) {
        const backoff = 400 * 2 ** (attempt - 1);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error("Upload ke storage gagal setelah beberapa percobaan.");
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
  }, []);

  const clear = useCallback(() => {
    setQueue([]);
    setRejected([]);
    setSummary(null);
  }, []);

  const dismissRejection = useCallback((index: number) => {
    setRejected((cur) => cur.filter((_, i) => i !== index));
  }, []);

  const updateForm = useCallback(
    (id: string, patch: Partial<ArsipFormValues>) => {
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
          const textPreview = await readAsTextSafe(q.file);
          const isImageOrScan =
            q.file.type.startsWith("image/") ||
            q.file.type === "application/pdf";
          if (isImageOrScan) update(q.id, { status: "ocr" });
          const base64 = await fileToBase64(q.file);
          update(q.id, { status: "ekstraksi" });
          const result = await analyzeDocument({
            data: {
              mime: q.file.type || "application/octet-stream",
              base64,
              textPreview,
              sizeBytes: q.file.size,
            },
          });
          const meta = metadataFromResponse(result.metadata);
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

        // 1) Ask the Storage Adapter for a short-lived presigned PUT URL.
        const presigned = await requestUploadUrl({
          data: {
            fileName: target.file.name,
            mimeType: mime,
            size: target.file.size,
            tahun,
          },
        });

        update(id, { progress: 20 });

        // 2) Upload the file straight to Cloudflare R2 with retry.
        await putWithRetry(presigned.uploadUrl, target.file, {
          maxAttempts: 3,
          onProgress: (p) => update(id, { progress: p }),
        });

        update(id, { progress: 80 });

        // 3) Commit metadata. If this fails the server deletes the R2 object.
        const jenisFromMeta =
          (target.metadata?.jenis.value as string | null) ?? "Internal";

        const created = await createArsip({
          data: {
            nomorSurat: form.nomorSurat.trim(),
            judul: form.judul.trim(),
            kategori: form.kategori.trim(),
            jenis: jenisFromMeta,
            tahun,
            lokasiFisik: form.lokasiFisik || null,
            status: form.status,
            deskripsi: form.deskripsi || null,
            storageProvider: "r2",
            bucketName: presigned.bucket,
            storagePath: presigned.storagePath,
            fileName: target.file.name,
            mimeType: mime,
            fileSize: target.file.size,
          },
        });

        update(id, {
          status: "berhasil",
          progress: 100,
          arsipId: created.id,
          error: undefined,
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
    enqueue,
    remove,
    clear,
    dismissRejection,
    analyseAll,
    uploadOne,
    uploadAll,
    updateForm,
    validateSingleFile,
  };
}

// Kept exported for unused-warning compatibility.
export type { ExtractedMetadata };
