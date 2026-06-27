import { FileCheck2, FileWarning, FolderInput, HardDrive } from "lucide-react";
import { formatBytes, type ImportItem } from "./types";

export function ImportSummary({ items }: { items: ImportItem[] }) {
  const valid = items.filter((i) => i.status === "valid").length;
  const invalid = items.filter((i) => i.status === "invalid").length;
  const total = items.reduce((acc, i) => acc + i.size, 0);

  const stats = [
    {
      label: "File Ditemukan",
      value: String(items.length),
      icon: FolderInput,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      label: "File Valid",
      value: String(valid),
      icon: FileCheck2,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "File Gagal",
      value: String(invalid),
      icon: FileWarning,
      tone: "bg-rose-50 text-rose-700",
    },
    {
      label: "Total Ukuran",
      value: formatBytes(total),
      icon: HardDrive,
      tone: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-2">
            <div className={`grid h-8 w-8 place-items-center rounded-lg ${s.tone}`}>
              <s.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <p className="truncate text-sm font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
