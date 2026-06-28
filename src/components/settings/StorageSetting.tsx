import { HardDrive } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SectionCard } from "./SectionCard";
import { getStorageStats } from "@/lib/system.functions";

function fmt(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function StorageSetting() {
  const fetcher = useServerFn(getStorageStats);
  const q = useQuery({
    queryKey: ["storage-stats"],
    queryFn: () => fetcher(),
    staleTime: 30_000,
  });
  const used = q.data?.usedBytes ?? 0;
  const total = q.data?.totalBytes ?? 0;
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  const remaining = Math.max(0, total - used);
  return (
    <SectionCard title="Pengaturan Storage" subtitle="Pantau penggunaan penyimpanan." icon={HardDrive} tone="from-violet-500 to-purple-600">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Kapasitas Total" value={fmt(total)} />
        <Stat label="Digunakan" value={fmt(used)} />
        <Stat label="Tersisa" value={fmt(remaining)} />
      </div>
      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {q.data
          ? `${q.data.objectCount} objek pada bucket ${q.data.bucket}.`
          : "Memuat statistik storage..."}
      </p>
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
