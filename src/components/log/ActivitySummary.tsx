import { Activity, LogIn, Upload, Pencil, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Tone = "blue" | "violet" | "green" | "amber" | "rose";

const TONE: Record<Tone, { bar: string; icon: string; ring: string }> = {
  blue: { bar: "bg-blue-500", icon: "bg-blue-50 text-blue-600", ring: "ring-blue-100" },
  violet: { bar: "bg-violet-500", icon: "bg-violet-50 text-violet-600", ring: "ring-violet-100" },
  green: { bar: "bg-emerald-500", icon: "bg-emerald-50 text-emerald-600", ring: "ring-emerald-100" },
  amber: { bar: "bg-amber-500", icon: "bg-amber-50 text-amber-600", ring: "ring-amber-100" },
  rose: { bar: "bg-rose-500", icon: "bg-rose-50 text-rose-600", ring: "ring-rose-100" },
};

export type ActivitySummaryData = {
  total: number;
  login: number;
  upload: number;
  edit: number;
  hapus: number;
};

export function ActivitySummary({ data }: { data: ActivitySummaryData }) {
  const cards: { label: string; value: number; tone: Tone; icon: LucideIcon }[] = [
    { label: "Total Aktivitas", value: data.total, tone: "blue", icon: Activity },
    { label: "Login", value: data.login, tone: "violet", icon: LogIn },
    { label: "Upload", value: data.upload, tone: "green", icon: Upload },
    { label: "Edit", value: data.edit, tone: "amber", icon: Pencil },
    { label: "Hapus", value: data.hapus, tone: "rose", icon: Trash2 },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {cards.map((c) => {
        const t = TONE[c.tone];
        const Icon = c.icon;
        return (
          <div key={c.label} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
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