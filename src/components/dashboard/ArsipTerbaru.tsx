import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, FolderSearch, Plus } from "lucide-react";
import type { Arsip } from "@/lib/arsip-data";
import { cn } from "@/lib/utils";

export function ArsipTerbaru({ items = [] }: { items?: Arsip[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="truncate text-sm font-semibold text-foreground">Arsip Terbaru</h3>
        </div>
        <Link to="/arsip" className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline">
          Lihat semua <ArrowRight className="h-3 w-3" />
        </Link>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-muted">
            <FolderSearch className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">Belum ada arsip</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Arsip terbaru akan tampil di sini setelah Anda menambahkan dokumen.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Dokumen</th>
                <th className="px-3 py-3">Jenis</th>
                <th className="px-3 py-3">Tahun</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-muted/50">
                  <td className="max-w-[260px] px-5 py-3">
                    <p className="truncate font-medium text-foreground">{row.judul}</p>
                    <p className="truncate text-xs text-muted-foreground">{row.nomorSurat}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium",
                        row.jenis === "Surat Keluar"
                          ? "bg-blue-50 text-blue-700"
                          : row.jenis === "Surat Masuk"
                            ? "bg-violet-50 text-violet-700"
                            : "bg-muted text-foreground/70",
                      )}
                    >
                      {row.jenis}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{row.tahun}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t border-border px-5 py-4">
        <Link to="/upload" className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <Plus className="h-4 w-4" /> Tambah Arsip Baru
        </Link>
      </div>
    </section>
  );
}
