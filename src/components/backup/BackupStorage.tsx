import { HardDrive } from "lucide-react";
import { storageInfo } from "@/lib/backup-data";

export function BackupStorage() {
  const pct = storageInfo.total > 0 ? Math.round((storageInfo.used / storageInfo.total) * 100) : 0;
  const remaining = Math.max(0, storageInfo.total - storageInfo.used);
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white">
          <HardDrive className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Storage Monitoring</p>
          <p className="text-xs text-muted-foreground">Kapasitas penyimpanan backup</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Digunakan</span>
          <span className="font-medium text-foreground">
            {storageInfo.used} {storageInfo.unit} / {storageInfo.total} {storageInfo.unit}
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
          <span>{remaining.toFixed(1)} {storageInfo.unit} tersisa</span>
        </div>
      </div>
    </div>
  );
}
