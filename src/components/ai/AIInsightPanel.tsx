import { Archive, AlarmClock, QrCode, Users, HardDrive, type LucideIcon } from "lucide-react";
import { getAIInsightMetrics, type AIInsightMetric } from "@/lib/ai-data";

const ICONS: Record<AIInsightMetric["key"] | string, LucideIcon> = {
  arsip: Archive,
  retensi: AlarmClock,
  qr: QrCode,
  user: Users,
  storage: HardDrive,
};

const TONES: Record<AIInsightMetric["tone"], string> = {
  blue: "from-blue-500/15 to-blue-500/5 text-blue-600",
  violet: "from-violet-500/15 to-violet-500/5 text-violet-600",
  emerald: "from-emerald-500/15 to-emerald-500/5 text-emerald-600",
  amber: "from-amber-500/15 to-amber-500/5 text-amber-600",
  rose: "from-rose-500/15 to-rose-500/5 text-rose-600",
};

export function AIInsightPanel() {
  const metrics = getAIInsightMetrics();
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">AI Insight</p>
          <p className="text-xs text-muted-foreground">Sinyal sistem yang dipantau AI Core</p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
          Live
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map((m) => {
          const Icon = ICONS[m.key] ?? Archive;
          return (
            <div
              key={m.key}
              className="rounded-xl border border-border/70 bg-background/60 p-3"
            >
              <div
                className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${TONES[m.tone]}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-2 text-lg font-bold text-foreground">{m.value}</p>
              <p className="text-xs font-medium text-foreground">{m.label}</p>
              <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{m.hint}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
