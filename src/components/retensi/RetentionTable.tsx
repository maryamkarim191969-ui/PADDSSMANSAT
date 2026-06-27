import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RetensiRow } from "@/lib/retensi-data";
import { RetentionStatusBadge } from "./RetentionStatusBadge";

function formatDate(iso: string) {
  const d = new Date(iso);
  const bln = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${d.getUTCDate()} ${bln[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function RetentionTable({
  rows,
  onView,
}: {
  rows: RetensiRow[];
  onView: (row: RetensiRow) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Nomor Surat</th>
              <th className="px-5 py-3">Judul Arsip</th>
              <th className="px-5 py-3">Kategori</th>
              <th className="px-5 py-3">Tahun</th>
              <th className="px-5 py-3">Tanggal Retensi</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border transition-colors hover:bg-muted/30">
                <td className="px-5 py-3 font-mono text-xs text-foreground/80">{r.nomorSurat}</td>
                <td className="px-5 py-3 font-medium text-foreground">
                  <span className="line-clamp-1 max-w-md">{r.judul}</span>
                </td>
                <td className="px-5 py-3 text-foreground/80">{r.kategori}</td>
                <td className="px-5 py-3 text-foreground/80">{r.tahun}</td>
                <td className="px-5 py-3 text-foreground/80">{formatDate(r.tanggalRetensi)}</td>
                <td className="px-5 py-3"><RetentionStatusBadge status={r.retensiStatus} /></td>
                <td className="px-5 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => onView(r)}>
                    <Eye className="mr-1.5 h-4 w-4" /> Detail
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}