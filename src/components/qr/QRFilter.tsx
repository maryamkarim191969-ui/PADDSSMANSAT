import { cn } from "@/lib/utils";

export type QRFilterValue = "all" | "aktif" | "nonaktif" | "banyak" | "belum";
export type QRSortValue = "terbaru" | "terlama" | "scan-banyak" | "scan-sedikit";

const filters: { v: QRFilterValue; label: string }[] = [
  { v: "all", label: "Semua" },
  { v: "aktif", label: "Aktif" },
  { v: "nonaktif", label: "Nonaktif" },
  { v: "banyak", label: "Banyak Scan" },
  { v: "belum", label: "Belum Discan" },
];

export function QRFilter({
  value,
  onChange,
  sort,
  onSortChange,
}: {
  value: QRFilterValue;
  onChange: (v: QRFilterValue) => void;
  sort: QRSortValue;
  onSortChange: (v: QRSortValue) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card p-1">
        {filters.map((f) => (
          <button
            key={f.v}
            onClick={() => onChange(f.v)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              value === f.v
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as QRSortValue)}
        className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="terbaru">Urutkan: Terbaru</option>
        <option value="terlama">Urutkan: Terlama</option>
        <option value="scan-banyak">Scan Terbanyak</option>
        <option value="scan-sedikit">Scan Tersedikit</option>
      </select>
    </div>
  );
}
