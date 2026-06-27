import { FileSearch, Brain, Network, Zap, type LucideIcon } from "lucide-react";
import { aiCapabilities, type AICapability } from "@/lib/ai-data";

const ICONS: Record<AICapability["icon"], LucideIcon> = {
  doc: FileSearch,
  search: Network,
  knowledge: Brain,
  action: Zap,
};

const STATUS_TONE: Record<AICapability["status"], string> = {
  Siap: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Persiapan: "border-amber-200 bg-amber-50 text-amber-700",
  Roadmap: "border-slate-200 bg-slate-50 text-slate-600",
};

export function AICapabilities() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3">
        <p className="text-sm font-semibold text-foreground">AI Core Capabilities</p>
        <p className="text-xs text-muted-foreground">
          Fondasi kecerdasan SIPASTERA — siap untuk integrasi penuh berikutnya.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {aiCapabilities.map((c) => {
          const Icon = ICONS[c.icon];
          return (
            <div
              key={c.key}
              className="rounded-xl border border-border bg-background/60 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-blue-500/15 to-violet-500/10 text-blue-600">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.summary}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_TONE[c.status]}`}
                >
                  {c.status}
                </span>
              </div>
              <ul className="mt-3 grid grid-cols-1 gap-1 text-[11.5px] text-muted-foreground sm:grid-cols-2">
                {c.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-primary/50" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
