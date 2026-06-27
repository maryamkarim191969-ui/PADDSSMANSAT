import { HardDrive } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { storageInfo } from "@/lib/backup-data";

export function StorageSetting() {
  const pct = storageInfo.total > 0 ? Math.round((storageInfo.used / storageInfo.total) * 100) : 0;
  const remaining = Math.max(0, storageInfo.total - storageInfo.used);
  return (
    <SectionCard title="Pengaturan Storage" subtitle="Pantau penggunaan penyimpanan." icon={HardDrive} tone="from-violet-500 to-purple-600">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Kapasitas Total" value={`${storageInfo.total} ${storageInfo.unit}`} />
        <Stat label="Digunakan" value={`${storageInfo.used} ${storageInfo.unit}`} />
        <Stat label="Tersisa" value={`${remaining.toFixed(1)} ${storageInfo.unit}`} />
      </div>
      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600" style={{ width: `${pct}%` }} />
      </div>
    </SectionCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}
