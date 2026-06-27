import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { LayoutList } from "lucide-react";

export function TopCategoryChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <header className="flex items-center gap-2">
        <LayoutList className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Top Kategori</h3>
      </header>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid stroke="oklch(0.92 0.01 250)" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "oklch(0.50 0.02 250)" }} />
            <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "oklch(0.30 0.02 250)" }} width={130} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 250)", fontSize: 12 }} />
            <Bar dataKey="value" fill="oklch(0.55 0.20 255)" radius={[0, 6, 6, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}