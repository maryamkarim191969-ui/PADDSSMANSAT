import { Pencil, Trash2 } from "lucide-react";
import { formatBytes, type ImportItem } from "./types";

export function ImportTable({
  items,
  onEdit,
  onRemove,
}: {
  items: ImportItem[];
  onEdit: (item: ImportItem) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3">Nama File</th>
            <th className="px-3 py-3">Nomor Surat</th>
            <th className="px-3 py-3">Judul</th>
            <th className="px-3 py-3">Kategori</th>
            <th className="px-3 py-3">Tahun</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr
              key={it.id}
              className="border-b border-border/70 transition-colors hover:bg-muted/30"
            >
              <td className="px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">
                    {it.fileName}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatBytes(it.size)} • {it.format}
                  </p>
                </div>
              </td>
              <td className="px-3 py-3 text-xs text-foreground">{it.nomorSurat}</td>
              <td className="px-3 py-3">
                <p className="line-clamp-2 max-w-[260px] text-xs text-foreground">
                  {it.judul}
                </p>
              </td>
              <td className="px-3 py-3 text-xs text-foreground">{it.kategori}</td>
              <td className="px-3 py-3 text-xs text-foreground">{it.tahun}</td>
              <td className="px-3 py-3">
                <StatusBadge status={it.status} error={it.error} />
              </td>
              <td className="px-3 py-3">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => onEdit(it)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Edit metadata"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onRemove(it.id)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-destructive/20 bg-destructive/5 text-destructive transition-colors hover:bg-destructive/10"
                    aria-label="Hapus dari antrian"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status, error }: { status: ImportItem["status"]; error?: string }) {
  const map = {
    valid: { label: "Valid", cls: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
    invalid: {
      label: error ?? "Invalid",
      cls: "bg-rose-50 text-rose-700 ring-rose-100",
    },
    imported: {
      label: "Imported",
      cls: "bg-blue-50 text-blue-700 ring-blue-100",
    },
  } as const;
  const m = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${m.cls}`}
    >
      {m.label}
    </span>
  );
}
