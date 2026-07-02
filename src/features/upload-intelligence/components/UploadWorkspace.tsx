import { useState } from "react";
import { Brain, Upload as UploadIcon, X, Sparkles, ScanSearch, CheckCircle2, Loader2, FileStack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropZone } from "./DropZone";
import { UploadQueue } from "./UploadQueue";
import { ArsipFormSheet } from "./ArsipFormSheet";
import { UploadSummary as UploadSummaryCard } from "./UploadSummary";
import { NomorCheckPanel } from "./NomorCheckPanel";
import { useUploadQueue } from "../hooks/useUploadQueue";
import { useMasterData } from "../hooks/useMasterData";
import { MAX_FILES } from "../constants";

export function UploadWorkspace() {
  const masters = useMasterData();
  const q = useUploadQueue({
    kategori: masters.kategori,
    lokasi: masters.lokasi,
  });
  const [reviewId, setReviewId] = useState<string | null>(null);
  const reviewItem = reviewId
    ? q.queue.find((x) => x.id === reviewId) ?? null
    : null;

  const pending = q.queue.filter(
    (x) => x.status === "menunggu" || x.status === "gagal",
  ).length;
  const readyToUpload = q.queue.filter((x) => x.status === "siap_upload").length;
  const needsReview = q.queue.filter((x) => x.status === "perlu_review").length;
  const busy = q.isAnalysing || q.isUploading;
  const analysed = q.queue.filter(
    (x) => x.status !== "menunggu" && x.status !== "gagal",
  ).length;
  const eligibleForNomor = q.queue.filter(
    (x) => (x.form?.nomorSurat?.trim().length ?? 0) > 0 && x.status !== "berhasil",
  ).length;
  const nomorChecked = Object.keys(q.nomorCheck).length;
  const succeeded = q.queue.filter((x) => x.status === "berhasil").length;

  // Pipeline stages surfaced sebagai stepper visual (bukan perubahan
  // workflow — hanya menampilkan tahapan yang sudah berjalan).
  const stages = [
    {
      key: "intake",
      label: "Intake",
      hint: `${q.queue.length}/${MAX_FILES} file`,
      state:
        q.queue.length === 0
          ? "pending"
          : analysed === q.queue.length
            ? "done"
            : "active",
    },
    {
      key: "meta",
      label: "AI Analisis Metadata",
      hint: `${analysed} dianalisis · ${pending} menunggu`,
      state: q.isAnalysing
        ? "active"
        : q.queue.length > 0 && analysed === q.queue.length
          ? "done"
          : analysed > 0
            ? "active"
            : "pending",
    },
    {
      key: "nomor",
      label: "AI Pengecekan Nomor Surat",
      hint: `${nomorChecked}/${eligibleForNomor} diperiksa`,
      state: q.nomorBatchRunning
        ? "active"
        : nomorChecked > 0 && nomorChecked >= eligibleForNomor && eligibleForNomor > 0
          ? "done"
          : nomorChecked > 0
            ? "active"
            : "pending",
    },
    {
      key: "upload",
      label: "Upload",
      hint: `${succeeded}/${q.queue.length} berhasil`,
      state: q.isUploading
        ? "active"
        : succeeded > 0 && succeeded === q.queue.length
          ? "done"
          : succeeded > 0
            ? "active"
            : "pending",
    },
  ] as const;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-foreground">
              Upload Arsip
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Dua tahap AI membantu proses upload: (1) AI Analisis Metadata
              membaca isi dokumen dan mengisi otomatis Form Arsip, kemudian
              (2) AI Pengecekan Nomor Surat memverifikasi nomor terhadap
              database sebelum arsip disimpan. Maksimal {MAX_FILES} file per
              sesi.
            </p>
          </div>
        </div>

        {/* Pipeline stepper — hanya visualisasi tahapan, tidak mengubah workflow */}
        <ol className="mt-4 grid gap-2 sm:grid-cols-4">
          {stages.map((s, i) => (
            <li
              key={s.key}
              className={
                "flex items-start gap-2 rounded-xl border px-3 py-2.5 " +
                (s.state === "active"
                  ? "border-primary/40 bg-primary/5"
                  : s.state === "done"
                    ? "border-emerald-300 bg-emerald-50/40"
                    : "border-border bg-background/40")
              }
            >
              <div className="mt-0.5">
                {s.state === "done" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : s.state === "active" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <div className="grid h-4 w-4 place-items-center rounded-full border-2 border-border text-[9px] font-bold text-muted-foreground">
                    {i + 1}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">
                  {s.label}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {s.hint}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <DropZone
          onFiles={q.enqueue}
          remainingSlots={Math.max(0, MAX_FILES - q.queue.length)}
        />
        {q.rejected.length > 0 ? (
          <div className="mt-3 space-y-1.5">
            {q.rejected.map((r, i) => (
              <div
                key={`${r.name}_${i}`}
                className="flex items-start justify-between gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-destructive">
                    {r.name}
                  </p>
                  <p className="text-destructive/80">{r.reason}</p>
                </div>
                <button
                  type="button"
                  onClick={() => q.dismissRejection(i)}
                  className="text-destructive/70 hover:text-destructive"
                  aria-label="Tutup"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <header className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">
              Antrian Dokumen
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {q.queue.length} dari {MAX_FILES} file • {readyToUpload} siap
              upload • {needsReview} perlu review • {pending} menunggu analisis
            </p>
          </div>
          <div className="col-span-2 flex flex-wrap items-center gap-2 sm:col-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={q.clear}
              disabled={busy || q.queue.length === 0}
            >
              Kosongkan
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={q.analyseAll}
              disabled={busy || pending === 0 || masters.loading}
            >
              <Brain className="mr-1 h-4 w-4" />
              {q.isAnalysing ? "Menganalisis…" : "Analisis Dokumen"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={q.runNomorCheckAll}
              disabled={
                busy || q.nomorBatchRunning || eligibleForNomor === 0
              }
            >
              <ScanSearch className="mr-1 h-4 w-4" />
              {q.nomorBatchRunning
                ? `Cek Nomor ${q.nomorBatchProgress?.done ?? 0}/${q.nomorBatchProgress?.total ?? 0}`
                : "Cek Nomor Surat"}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={q.uploadAll}
              disabled={busy || readyToUpload === 0}
            >
              <UploadIcon className="mr-1 h-4 w-4" />
              {q.isUploading ? "Mengunggah…" : "Upload Semua"}
            </Button>
          </div>
        </header>

        {masters.error ? (
          <p className="mb-3 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            Gagal memuat data master: {masters.error}
          </p>
        ) : null}

        <UploadQueue
          items={q.queue}
          onRemove={q.remove}
          onReview={(id) => setReviewId(id)}
          onUpload={(id) => void q.uploadOne(id)}
          busy={busy}
        />
      </section>

      {q.queue.length > 0 ? (
        <NomorCheckPanel
          queue={q.queue}
          nomorCheck={q.nomorCheck}
          nomorChecking={q.nomorChecking}
          running={q.nomorBatchRunning}
          progress={q.nomorBatchProgress}
          onRun={() => void q.runNomorCheckAll()}
          onOpenForm={(id) => setReviewId(id)}
          onDismiss={(id) => {
            // Menghilangkan hasil temuan spesifik agar operator dapat
            // fokus pada temuan yang tersisa. Aksi ini tidak menghapus
            // arsip apa pun; hanya membersihkan hasil review.
            const { [id]: _, ...rest } = q.nomorCheck;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (q as any).nomorCheck = rest;
          }}
        />
      ) : null}

      {q.summary ? <UploadSummaryCard summary={q.summary} /> : null}

      <ArsipFormSheet
        item={reviewItem}
        masters={{ kategori: masters.kategori, lokasi: masters.lokasi }}
        onClose={() => setReviewId(null)}
        onChange={q.updateForm}
        nomorCheck={reviewItem ? q.nomorCheck[reviewItem.id] ?? null : null}
        nomorChecking={
          reviewItem ? !!q.nomorChecking[reviewItem.id] : false
        }
        onCheckNomor={(id: string) => void q.checkNomorForItem(id)}
        categoryProposal={
          reviewItem ? q.categoryProposals[reviewItem.id] ?? null : null
        }
        approvingCategory={
          reviewItem ? !!q.approvingCategory[reviewItem.id] : false
        }
        onApproveCategory={(id: string) => void q.approveCategoryProposal(id)}
        onDismissCategoryProposal={(id: string) =>
          q.dismissCategoryProposal(id)
        }
        onUpload={(id) => {
          void q.uploadOne(id).then((ok) => {
            if (ok) setReviewId(null);
          });
        }}
        busy={busy}
      />
    </div>
  );
}
