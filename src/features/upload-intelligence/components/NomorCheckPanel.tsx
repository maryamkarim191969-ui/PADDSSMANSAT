import { AlertTriangle, CheckCircle2, ExternalLink, FileText, Loader2, ScanSearch, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { QueuedFile } from "../types";
import type { NomorSuratCheckResult } from "@/lib/nomor-check.functions";

type Props = {
  queue: QueuedFile[];
  nomorCheck: Record<string, NomorSuratCheckResult>;
  nomorChecking: Record<string, boolean>;
  running: boolean;
  progress: { done: number; total: number } | null;
  onRun: () => void;
  onOpenForm: (id: string) => void;
  onDismiss: (id: string) => void;
};

/**
 * AI Pengecekan Nomor Surat — panel batch. Menampilkan seluruh temuan
 * duplikasi nomor surat pada satu tempat sehingga administrator dapat
 * meninjau tanpa membuka setiap form satu per satu.
 */
export function NomorCheckPanel({
  queue,
  nomorCheck,
  nomorChecking,
  running,
  progress,
  onRun,
  onOpenForm,
  onDismiss,
}: Props) {
  const eligible = queue.filter(
    (q) => (q.form?.nomorSurat?.trim().length ?? 0) > 0 && q.status !== "berhasil",
  );
  const checkedIds = Object.keys(nomorCheck);
  const findings = queue.filter(
    (q) => nomorCheck[q.id]?.found && nomorCheck[q.id]!.matches.length > 0,
  );
  const cleanCount = checkedIds.filter((id) => nomorCheck[id]?.found === false).length;
  const busy = running || Object.values(nomorChecking).some(Boolean);

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <ScanSearch className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              AI Pengecekan Nomor Surat
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Setelah AI Analisis Metadata selesai, jalankan pengecekan pada
              seluruh dokumen untuk memverifikasi nomor surat terhadap arsip
              yang telah tersimpan. Proses ini tidak membatalkan upload.
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={onRun}
          disabled={busy || eligible.length === 0}
        >
          {running ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <ScanSearch className="mr-1 h-3.5 w-3.5" />
          )}
          {running
            ? `Memeriksa ${progress?.done ?? 0}/${progress?.total ?? 0}`
            : checkedIds.length > 0
              ? "Jalankan Ulang"
              : "Cek Semua Nomor Surat"}
        </Button>
      </header>

      {running && progress ? (
        <Progress
          value={progress.total ? (progress.done / progress.total) * 100 : 0}
          className="mb-3 h-1.5"
        />
      ) : null}

      {checkedIds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background/40 p-6 text-center">
          <p className="text-xs text-muted-foreground">
            Belum ada pengecekan. {eligible.length} dokumen memiliki nomor
            surat dan siap diperiksa.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-800">
              <CheckCircle2 className="h-3 w-3" /> {cleanCount} aman
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-amber-800">
              <AlertTriangle className="h-3 w-3" /> {findings.length} temuan
            </span>
            <span className="text-muted-foreground">
              dari {checkedIds.length} dokumen diperiksa
            </span>
          </div>

          {findings.length === 0 ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-xs text-emerald-900">
              Seluruh nomor surat pada antrian belum pernah tercatat pada
              database. Aman untuk dilanjutkan ke tahap Upload.
            </div>
          ) : (
            <ul className="space-y-3">
              {findings.map((item) => {
                const res = nomorCheck[item.id]!;
                const nomor = res.nomorSurat;
                return (
                  <li
                    key={item.id}
                    className="rounded-xl border border-amber-300 bg-amber-50/40 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-2">
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {item.form?.judul || item.file.name}
                          </p>
                          <p className="text-[11px] text-amber-900">
                            Nomor{" "}
                            <span className="font-semibold">{nomor}</span>{" "}
                            sudah tercatat pada {res.matches.length} arsip
                            tersimpan.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onOpenForm(item.id)}
                        >
                          Buka Form
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => onDismiss(item.id)}
                          aria-label="Abaikan temuan"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 overflow-hidden rounded-lg border border-border bg-background">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/50 text-[10px] uppercase tracking-wide text-muted-foreground">
                          <tr>
                            <th className="px-2 py-1.5 text-left">Nomor Surat</th>
                            <th className="px-2 py-1.5 text-left">Judul</th>
                            <th className="px-2 py-1.5 text-left">Kategori</th>
                            <th className="px-2 py-1.5 text-left">Tahun</th>
                            <th className="px-2 py-1.5 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {res.matches.map((m) => {
                            const similarity =
                              m.nomorSurat.trim().toLowerCase() ===
                              nomor.trim().toLowerCase()
                                ? 100
                                : 90;
                            return (
                              <tr
                                key={m.id}
                                className="border-t border-border align-top"
                              >
                                <td className="px-2 py-1.5">
                                  <p className="font-medium text-foreground">
                                    {m.nomorSurat}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    Kecocokan {similarity}%
                                  </p>
                                </td>
                                <td className="px-2 py-1.5">
                                  <p className="line-clamp-2 text-foreground">
                                    {m.judul}
                                  </p>
                                </td>
                                <td className="px-2 py-1.5 text-muted-foreground">
                                  {m.kategori}
                                </td>
                                <td className="px-2 py-1.5 text-muted-foreground">
                                  {m.tahun}
                                </td>
                                <td className="px-2 py-1.5 text-right">
                                  <Link
                                    to="/arsip"
                                    className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground hover:bg-accent"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Manajemen Arsip
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}