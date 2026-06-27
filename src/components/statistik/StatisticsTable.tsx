import { FileBarChart } from "lucide-react";

type Row = {
  tahun: number;
  total: number;
  aktif: number;
  retensi: number;
  status: "Sehat" | "Perlu Tinjauan";
};

export function StatisticsTable({ rows }: { rows: Row[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-center gap-2 border-b border-border px-5 py-4">
        <FileBarChart className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Laporan Per Tahun</h3>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Tahun</th>
              <th className="px-5 py-3">Total Arsip</th>
              <th className="px-5 py-3">Arsip Aktif</th>
              <th className="px-5 py-3">Arsip Retensi</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.tahun} className="border-t border-border transition-colors hover:bg-muted/30">
                <td className="px-5 py-3 font-medium text-foreground">{r.tahun}</td>
                <td className="px-5 py-3 text-foreground/80">{r.total}</td>
                <td className="px-5 py-3 text-foreground/80">{r.aktif}</td>
                <td className="px-5 py-3 text-foreground/80">{r.retensi}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      r.status === "Sehat"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}