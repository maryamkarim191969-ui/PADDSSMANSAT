import {
  Plus,
  Download,
  ScanLine,
  PowerOff,
  Power,
  RotateCw,
  type LucideIcon,
} from "lucide-react";
import { formatDateID, type QRHistoryAction, type QRHistoryItem } from "@/lib/qr-data";

const iconMap: Record<QRHistoryAction, LucideIcon> = {
  Dibuat: Plus,
  Diunduh: Download,
  Discan: ScanLine,
  Dinonaktifkan: PowerOff,
  Diaktifkan: Power,
  Regenerasi: RotateCw,
};

const toneMap: Record<QRHistoryAction, string> = {
  Dibuat: "bg-blue-50 text-blue-700 ring-blue-100",
  Diunduh: "bg-violet-50 text-violet-700 ring-violet-100",
  Discan: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Dinonaktifkan: "bg-slate-100 text-slate-700 ring-slate-200",
  Diaktifkan: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Regenerasi: "bg-amber-50 text-amber-700 ring-amber-100",
};

export function QRHistory({ items }: { items: QRHistoryItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
        Belum ada aktivitas.
      </p>
    );
  }
  const sorted = [...items].sort((a, b) => +new Date(b.at) - +new Date(a.at));
  return (
    <ol className="relative space-y-3 border-l border-border pl-5">
      {sorted.map((h) => {
        const Icon = iconMap[h.action];
        return (
          <li key={h.id} className="relative">
            <span
              className={`absolute -left-[27px] grid h-6 w-6 place-items-center rounded-full ring-2 ring-card ${toneMap[h.action]}`}
            >
              <Icon className="h-3 w-3" />
            </span>
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{h.action}</p>
                <span className="text-[11px] text-muted-foreground">{formatDateID(h.at)}</span>
              </div>
              {(h.by || h.note) && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {h.by && <span>oleh {h.by}</span>}
                  {h.by && h.note && <span> · </span>}
                  {h.note}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
