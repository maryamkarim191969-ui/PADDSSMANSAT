import { Download, Power, PowerOff, X } from "lucide-react";

export function QRBulkAction({
  count,
  onClear,
  onActivate,
  onDeactivate,
  onDownload,
}: {
  count: number;
  onClear: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onDownload: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="sticky bottom-3 z-20 mx-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-2xl border border-border bg-card/95 p-2.5 pl-4 shadow-lg backdrop-blur animate-in fade-in-0 slide-in-from-bottom-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="grid h-7 min-w-7 place-items-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground">
          {count}
        </span>
        <span className="text-muted-foreground">QR dipilih</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onDownload}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          <Download className="h-3.5 w-3.5" /> Download
        </button>
        <button
          onClick={onActivate}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
        >
          <Power className="h-3.5 w-3.5" /> Aktifkan
        </button>
        <button
          onClick={onDeactivate}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          <PowerOff className="h-3.5 w-3.5" /> Nonaktifkan
        </button>
        <button
          onClick={onClear}
          className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Batalkan"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
