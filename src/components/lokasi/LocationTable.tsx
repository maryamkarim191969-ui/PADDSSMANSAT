import { Eye, Pencil, Trash2 } from "lucide-react";
import type { Lokasi } from "@/lib/lokasi-data";
import { cn } from "@/lib/utils";

export function statusTone(status: Lokasi["status"]) {
  return status === "Aktif"
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
    : "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
}

export function statusLabel(status: Lokasi["status"]) {
  return status === "Aktif" ? "Aktif" : "Tidak Aktif";
}

export function LocationTable({
  data,
  onView,
  onEdit,
  onDelete,
}: {
  data: Lokasi[];
  onView: (l: Lokasi) => void;
  onEdit: (l: Lokasi) => void;
  onDelete: (l: Lokasi) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] text-sm">
        <thead>
          <tr className="bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3">Nama Lokasi</th>
            <th className="px-3 py-3">Kode</th>
            <th className="px-3 py-3">Ruangan</th>
            <th className="px-3 py-3">Rak / Lemari</th>
            <th className="px-3 py-3">Jumlah Arsip</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row) => (
            <tr key={row.id} className={cn("transition-colors hover:bg-muted/40")}>
              <td className="px-4 py-3 align-top">
                <button
                  onClick={() => onView(row)}
                  className="text-left font-medium text-foreground hover:text-primary hover:underline"
                >
                  {row.nama}
                </button>
              </td>
              <td className="px-3 py-3 align-top">
                <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                  {row.kode}
                </code>
              </td>
              <td className="px-3 py-3 align-top text-foreground">{row.ruangan}</td>
              <td className="px-3 py-3 align-top text-muted-foreground">{row.rak}</td>
              <td className="px-3 py-3 align-top">
                <span className="inline-flex h-6 min-w-[2rem] items-center justify-center rounded-md bg-primary/10 px-2 text-xs font-semibold text-primary">
                  {row.jumlahArsip}
                </span>
              </td>
              <td className="px-3 py-3 align-top">
                <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${statusTone(row.status)}`}>
                  {statusLabel(row.status)}
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
          ))}
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
