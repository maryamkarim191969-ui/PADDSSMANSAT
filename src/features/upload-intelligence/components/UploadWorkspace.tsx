import { useState } from "react";
import { Brain, Upload as UploadIcon, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropZone } from "./DropZone";
import { UploadQueue } from "./UploadQueue";
import { ArsipFormSheet } from "./ArsipFormSheet";
import { UploadSummary as UploadSummaryCard } from "./UploadSummary";
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
              AI membaca isi dokumen dan mengisi otomatis Form Arsip. Anda
              cukup meninjau, melengkapi, lalu menyimpan. Maksimal {MAX_FILES}{" "}
              file per sesi.
            </p>
          </div>
        </div>
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

      {q.summary ? <UploadSummaryCard summary={q.summary} /> : null}

      <ArsipFormSheet
        item={reviewItem}
        masters={{ kategori: masters.kategori, lokasi: masters.lokasi }}
        onClose={() => setReviewId(null)}
        onChange={q.updateForm}
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
