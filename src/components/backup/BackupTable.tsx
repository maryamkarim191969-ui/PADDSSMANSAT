import { Download, Trash2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { BackupItem } from "@/lib/backup-data";

type Props = {
  data: BackupItem[];
  onDownload: (b: BackupItem) => void;
  onDelete: (b: BackupItem) => void;
};

function statusBadge(s: BackupItem["status"]) {
  if (s === "Berhasil")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
        <CheckCircle2 className="h-3 w-3" /> Berhasil
      </span>
    );
  if (s === "Gagal")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 ring-1 ring-rose-100">
        <XCircle className="h-3 w-3" /> Gagal
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-blue-100">
      <Loader2 className="h-3 w-3 animate-spin" /> Proses
    </span>
  );
}

export function BackupTable({ data, onDownload, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3">Nama Backup</th>
            <th className="px-3 py-3">Tanggal</th>
            <th className="px-3 py-3">Ukuran</th>
            <th className="px-3 py-3">Tipe</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((b) => (
            <tr key={b.id} className="transition-colors hover:bg-accent/40">
              <td className="px-4 py-3 font-medium text-foreground">{b.name}</td>
              <td className="px-3 py-3 text-muted-foreground">{b.date}</td>
              <td className="px-3 py-3 text-muted-foreground">{b.size}</td>
              <td className="px-3 py-3 text-muted-foreground">{b.type}</td>
              <td className="px-3 py-3">{statusBadge(b.status)}</td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onDownload(b)}
                    title="Download"
                    aria-label="Download"
                    className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(b)}
                    title="Hapus"
                    aria-label="Hapus"
                    className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
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
