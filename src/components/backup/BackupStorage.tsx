import { HardDrive } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getStorageStats } from "@/lib/system.functions";

function fmt(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function BackupStorage() {
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
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white">
          <HardDrive className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Storage Monitoring</p>
          <p className="text-xs text-muted-foreground">
            {q.data ? `${q.data.objectCount} objek pada ${q.data.bucket}` : "Memuat data R2..."}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Digunakan</span>
          <span className="font-medium text-foreground">
            {fmt(used)} / {fmt(total)}
          </span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-600 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{pct}% terpakai</span>
          <span>{fmt(remaining)} tersisa</span>
        </div>
      </div>
    </div>
  );
}
