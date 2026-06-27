import { CheckCircle2, AlertCircle, Clock, FileText } from "lucide-react";
import { formatMs } from "./utils";
import type { WorkspaceSummary } from "../types";

export function UploadSummary({ summary }: { summary: WorkspaceSummary }) {
  const cards = [
    {
      label: "Total File",
      value: summary.total,
      icon: FileText,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Berhasil",
      value: summary.berhasil,
      icon: CheckCircle2,
      tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Gagal",
      value: summary.gagal,
      icon: AlertCircle,
      tone: "bg-destructive/15 text-destructive",
    },
    {
      label: "Perlu Review",
      value: summary.perluReview,
      icon: AlertCircle,
      tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    },
  ];

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Ringkasan Sesi Upload
        </h3>
      </header>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-border bg-background p-3"
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${c.tone}`}
              >
                <c.icon className="h-3.5 w-3.5" />
              </span>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {c.label}
              </p>
            </div>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {c.value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Durasi Analisis: {formatMs(summary.durasiAnalisisMs)}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Durasi Upload: {formatMs(summary.durasiUploadMs)}
        </div>
      </div>
    </section>
  );
}
