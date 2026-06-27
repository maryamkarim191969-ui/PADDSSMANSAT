import { Cloud, CheckCircle2, Plug } from "lucide-react";

type Props = { connected: boolean; onToggle: () => void };

export function BackupGoogleDrive({ connected, onToggle }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white">
            <Cloud className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Google Drive Backup</p>
            <p className="text-xs text-muted-foreground">Sinkronkan backup ke Google Drive secara otomatis.</p>
            <div className="mt-2">
              {connected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                  <CheckCircle2 className="h-3 w-3" /> Terhubung
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border">
                  Belum Terhubung
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          <Plug className="h-3.5 w-3.5" />
          {connected ? "Putuskan" : "Hubungkan"}
        </button>
      </div>
    </div>
  );
}
