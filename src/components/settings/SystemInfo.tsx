import { Info } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { systemInfo } from "@/lib/settings-data";

export function SystemInfo() {
  const items = [
    { label: "Versi Sistem", value: systemInfo.version },
    { label: "Build Version", value: systemInfo.build },
    { label: "Last Update", value: systemInfo.lastUpdate },
  ];
  return (
    <SectionCard title="Informasi Sistem" subtitle="Versi dan build aplikasi." icon={Info} tone="from-slate-500 to-slate-700">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map((i) => (
          <div key={i.label} className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{i.label}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{i.value}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export function SettingsLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/60" />
      ))}
    </div>
  );
}
