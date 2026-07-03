import { useState } from "react";
import {
  Brain,
  Upload as UploadIcon,
  X,
  Sparkles,
  ScanSearch,
  CheckCircle2,
  Loader2,
  FileText,
  Search as SearchIcon,
  CircleCheckBig,
} from "lucide-react";
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

        {/* Alur kerja Upload Arsip — stepper horizontal dengan konektor. */}
        <ol className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-0">
          {stages.map((s, i) => {
            const isLast = i === stages.length - 1;
            const isDone = s.state === "done";
            const isActive = s.state === "active";
            return (
              <li
                key={s.key}
                className="flex flex-1 items-start gap-3 lg:min-w-0"
              >
                <div className="flex flex-1 items-start gap-3">
                  <span
                    className={
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ring-1 " +
                      (isDone
                        ? "bg-primary text-primary-foreground ring-primary"
                        : isActive
                          ? "bg-primary text-primary-foreground ring-primary shadow-sm"
                          : "bg-muted text-muted-foreground ring-border")
                    }
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isActive && (s.key === "meta" || s.key === "nomor" || s.key === "upload") ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={
                        "text-sm font-semibold leading-tight " +
                        (isActive
                          ? "text-primary"
                          : isDone
                            ? "text-foreground"
                            : "text-muted-foreground")
                      }
                    >
                      {s.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {s.hint}
                    </p>
                  </div>
                </div>
                {!isLast ? (
                  <div
                    aria-hidden
                    className="mt-4 hidden flex-1 items-center px-2 lg:flex"
                  >
                    <div className="relative h-px w-full">
                      <div className="absolute inset-0 border-t border-dashed border-border" />
                      <div
                        className={
                          "absolute inset-0 border-t transition-all " +
                          (isDone ? "border-primary" : "border-transparent")
                        }
                      />
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
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
        </div>

        <aside className="space-y-5 lg:col-span-1">
          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <h2 className="text-sm font-semibold text-foreground">
              Ringkasan Upload
            </h2>
            <dl className="mt-4 space-y-2.5">
              <SummaryRow
                icon={FileText}
                tint="bg-primary/10 text-primary"
                label="Total File"
                value={`${q.queue.length} / ${MAX_FILES}`}
              />
              <SummaryRow
                icon={CircleCheckBig}
                tint="bg-emerald-50 text-emerald-600"
                label="Sudah Dianalisis"
                value={String(analysed)}
              />
              <SummaryRow
                icon={SearchIcon}
                tint="bg-amber-50 text-amber-600"
                label="Siap Diperiksa"
                value={String(eligibleForNomor)}
              />
              <SummaryRow
                icon={UploadIcon}
                tint="bg-violet-50 text-violet-600"
                label="Siap Diupload"
                value={String(readyToUpload)}
              />
            </dl>
          </section>
          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <h2 className="text-sm font-semibold text-foreground">
              Panduan Tahapan
            </h2>
            <ol className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>1. Unggah dokumen melalui area intake.</li>
              <li>2. Jalankan AI Analisis Metadata untuk mengisi form.</li>
              <li>3. Jalankan AI Pengecekan Nomor Surat pada tahap tersendiri.</li>
              <li>4. Tinjau form arsip lalu Upload Semua.</li>
            </ol>
          </section>
        </aside>
      </div>

      {q.queue.length > 0 ? (
        <NomorCheckPanel
          queue={q.queue}
          nomorCheck={q.nomorCheck}
          nomorChecking={q.nomorChecking}
          running={q.nomorBatchRunning}
          progress={q.nomorBatchProgress}
          onRun={() => void q.runNomorCheckAll()}
          onOpenForm={(id) => setReviewId(id)}
          onDismiss={(id) => q.dismissNomorCheck(id)}
        />
      ) : null}

      {q.summary ? <UploadSummaryCard summary={q.summary} /> : null}

      <ArsipFormSheet
        item={reviewItem}
        masters={{ kategori: masters.kategori, lokasi: masters.lokasi }}
        onClose={() => setReviewId(null)}
        onChange={q.updateForm}
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

function SummaryRow({
  icon: Icon,
  tint,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tint}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] text-muted-foreground">{label}</dt>
        <dd className="text-base font-bold leading-tight text-foreground">{value}</dd>
      </div>
    </div>
  );
}
