import { Folder, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Tone = "blue" | "amber" | "rose" | "green";

const TONE: Record<Tone, { bar: string; icon: string; ring: string }> = {
  blue: { bar: "bg-blue-500", icon: "bg-blue-50 text-blue-600", ring: "ring-blue-100" },
  amber: { bar: "bg-amber-500", icon: "bg-amber-50 text-amber-600", ring: "ring-amber-100" },
  rose: { bar: "bg-rose-500", icon: "bg-rose-50 text-rose-600", ring: "ring-rose-100" },
  green: { bar: "bg-emerald-500", icon: "bg-emerald-50 text-emerald-600", ring: "ring-emerald-100" },
};

export type RetentionSummaryData = {
  total: number;
  mendekati: number;
  kadaluarsa: number;
  aktif: number;
};

export function RetentionSummary({ data }: { data: RetentionSummaryData }) {
  const cards: { label: string; value: number; tone: Tone; icon: LucideIcon }[] = [
    { label: "Total Arsip", value: data.total, tone: "blue", icon: Folder },
    { label: "Mendekati Retensi", value: data.mendekati, tone: "amber", icon: AlertTriangle },
    { label: "Kadaluarsa", value: data.kadaluarsa, tone: "rose", icon: XCircle },
    { label: "Arsip Aktif", value: data.aktif, tone: "green", icon: CheckCircle2 },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const t = TONE[c.tone];
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md"
          >
            <span className={`absolute left-0 top-0 h-full w-1 ${t.bar}`} />
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${t.icon} ring-4 ${t.ring}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">{c.value}</p>
            <p className="mt-1 text-sm font-medium text-foreground/80">{c.label}</p>
          </div>
        );
      })}
    </div>
  );
}