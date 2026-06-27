import { ArrowUpRight, Folder, CheckCircle2, Tag, QrCode } from "lucide-react";

type Tone = "blue" | "green" | "amber" | "violet";

const TONE: Record<Tone, { bar: string; icon: string; ring: string }> = {
  blue: { bar: "bg-blue-500", icon: "bg-blue-50 text-blue-600", ring: "ring-blue-100" },
  green: { bar: "bg-emerald-500", icon: "bg-emerald-50 text-emerald-600", ring: "ring-emerald-100" },
  amber: { bar: "bg-amber-500", icon: "bg-amber-50 text-amber-600", ring: "ring-amber-100" },
  violet: { bar: "bg-violet-500", icon: "bg-violet-50 text-violet-600", ring: "ring-violet-100" },
};

const ICONS = { folder: Folder, check: CheckCircle2, tag: Tag, qr: QrCode };

type Props = {
  label: string;
  value: number | string;
  hint?: string;
  tone: Tone;
  icon: keyof typeof ICONS;
};

export function StatCard({ label, value, hint, tone, icon }: Props) {
  const t = TONE[tone];
  const Icon = ICONS[icon];
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <span className={`absolute left-0 top-0 h-full w-1 ${t.bar}`} />
      <div className="flex items-start justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${t.icon} ring-4 ${t.ring}`}>
          <Icon className="h-5 w-5" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm font-medium text-foreground/80">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}