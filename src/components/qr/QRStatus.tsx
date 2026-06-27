import { cn } from "@/lib/utils";
import type { QRStatus as QRStatusT } from "@/lib/qr-data";

export function QRStatus({ status }: { status: QRStatusT }) {
  const aktif = status === "Aktif";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1",
        aktif
          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
          : "bg-slate-100 text-slate-600 ring-slate-200",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          aktif ? "bg-emerald-500 animate-pulse" : "bg-slate-400",
        )}
      />
      {status}
    </span>
  );
}
