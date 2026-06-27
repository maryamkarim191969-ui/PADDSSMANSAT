import { Eye, Pencil, Trash2 } from "lucide-react";
import type { Kategori } from "@/lib/kategori-data";
import { statusTone } from "./CategoryTable";

export function CategoryCard({
  data,
  onView,
  onEdit,
  onDelete,
}: {
  data: Kategori[];
  onView: (k: Kategori) => void;
  onEdit: (k: Kategori) => void;
  onDelete: (k: Kategori) => void;
}) {
  return (
    <ul className="divide-y divide-border">
      {data.map((row) => (
        <li key={row.id} className="p-4 transition-colors hover:bg-muted/30">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <button
                onClick={() => onView(row)}
                className="text-left text-sm font-semibold text-foreground hover:text-primary hover:underline"
              >
                {row.nama}
              </button>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                  {row.kode}
                </code>
                <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${statusTone(row.status)}`}>
                  {row.status}
                </span>
                <span className="inline-flex h-5 items-center rounded-md bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
                  {row.jumlahArsip} arsip
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{row.deskripsi}</p>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                onClick={() => onView(row)}
                aria-label="Lihat detail"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/10"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEdit(row)}
                aria-label="Edit"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-amber-600 transition-colors hover:bg-amber-500/10"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(row)}
                aria-label="Hapus"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}