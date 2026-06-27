import { Eye, Pencil, Trash2 } from "lucide-react";
import type { Arsip } from "@/lib/arsip-data";
import { formatDate, jenisTone, statusTone } from "./utils";
import { cn } from "@/lib/utils";

export function ArsipTable({
  data,
  selected,
  onToggle,
  onToggleAll,
  onView,
  onEdit,
  onDelete,
}: {
  data: Arsip[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onView: (a: Arsip) => void;
  onEdit: (a: Arsip) => void;
  onDelete: (a: Arsip) => void;
}) {
  const allChecked = data.length > 0 && data.every((d) => selected.has(d.id));
  const someChecked = !allChecked && data.some((d) => selected.has(d.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] text-sm">
        <thead>
          <tr className="bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                aria-label="Pilih semua"
                checked={allChecked}
                ref={(el) => {
                  if (el) el.indeterminate = someChecked;
                }}
                onChange={(e) => onToggleAll(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-input accent-primary"
              />
            </th>
            <th className="px-3 py-3">Nomor Surat</th>
            <th className="px-3 py-3">Judul</th>
            <th className="px-3 py-3">Kategori</th>
            <th className="px-3 py-3">Jenis</th>
            <th className="px-3 py-3">Tahun</th>
            <th className="px-3 py-3">Lokasi</th>
            <th className="px-3 py-3">Upload</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row) => {
            const checked = selected.has(row.id);
            return (
              <tr
                key={row.id}
                className={cn(
                  "transition-colors hover:bg-muted/40",
                  checked && "bg-primary/5",
                )}
              >
                <td className="px-4 py-3 align-top">
                  <input
                    type="checkbox"
                    aria-label={`Pilih ${row.nomorSurat}`}
                    checked={checked}
                    onChange={() => onToggle(row.id)}
                    className="h-4 w-4 cursor-pointer rounded border-input accent-primary"
                  />
                </td>
                <td className="px-3 py-3 align-top">
                  <code className="font-mono text-xs text-foreground">{row.nomorSurat}</code>
                </td>
                <td className="max-w-[280px] px-3 py-3 align-top">
                  <button
                    onClick={() => onView(row)}
                    className="line-clamp-2 text-left font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {row.judul}
                  </button>
                </td>
                <td className="px-3 py-3 align-top text-muted-foreground">{row.kategori}</td>
                <td className="px-3 py-3 align-top">
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${jenisTone(row.jenis)}`}>
                    {row.jenis}
                  </span>
                </td>
                <td className="px-3 py-3 align-top text-muted-foreground">{row.tahun}</td>
                <td className="px-3 py-3 align-top text-muted-foreground">{row.lokasiFisik}</td>
                <td className="px-3 py-3 align-top text-muted-foreground">{formatDate(row.tanggalUpload)}</td>
                <td className="px-3 py-3 align-top">
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${statusTone(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-3 py-3 align-top">
                  <div className="flex items-center justify-end gap-1">
                    <ActionBtn label="Lihat detail" onClick={() => onView(row)} tone="primary">
                      <Eye className="h-4 w-4" />
                    </ActionBtn>
                    <ActionBtn label="Edit" onClick={() => onEdit(row)} tone="amber">
                      <Pencil className="h-4 w-4" />
                    </ActionBtn>
                    <ActionBtn label="Hapus" onClick={() => onDelete(row)} tone="destructive">
                      <Trash2 className="h-4 w-4" />
                    </ActionBtn>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  label,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  tone: "primary" | "amber" | "destructive";
}) {
  const toneCls =
    tone === "primary"
      ? "text-primary hover:bg-primary/10"
      : tone === "amber"
        ? "text-amber-600 hover:bg-amber-500/10"
        : "text-destructive hover:bg-destructive/10";
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${toneCls}`}
    >
      {children}
    </button>
  );
}
