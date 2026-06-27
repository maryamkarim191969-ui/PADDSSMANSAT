import { ArrowRight, BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type GrowthDatum = { month: string; value: number };

export function GrowthChart({ data = [] }: { data?: GrowthDatum[] }) {
  const hasData = data.some((d) => d.value > 0);
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h3 className="truncate text-sm font-semibold text-foreground">
            Pertumbuhan Arsip (6 Bulan Terakhir)
          </h3>
        </div>
        <button className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline">
          Detail <ArrowRight className="h-3 w-3" />
        </button>
      </header>
      {hasData ? (
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="oklch(0.92 0.01 250)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "oklch(0.50 0.02 250)" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "oklch(0.50 0.02 250)" }} width={36} />
              <Tooltip cursor={{ fill: "oklch(0.95 0.02 255 / 0.5)" }} contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 250)", fontSize: 12 }} />
              <Bar dataKey="value" fill="oklch(0.55 0.20 255)" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-4 flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-muted">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">Belum ada data statistik</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Grafik pertumbuhan akan muncul setelah arsip pertama ditambahkan.
          </p>
        </div>
      )}
    </section>
  );
}
