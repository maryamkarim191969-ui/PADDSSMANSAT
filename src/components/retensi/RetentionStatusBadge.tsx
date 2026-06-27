import type { RetensiStatus } from "@/lib/retensi-data";

const STYLE: Record<RetensiStatus, string> = {
  "Aman": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Mendekati Retensi": "bg-amber-50 text-amber-700 ring-amber-200",
  "Kadaluarsa": "bg-rose-50 text-rose-700 ring-rose-200",
};

export function RetentionStatusBadge({ status }: { status: RetensiStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLE[status]}`}>
      {status}
    </span>
  );
}