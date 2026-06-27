import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Activity } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Aktif: "oklch(0.65 0.18 160)",
  Inaktif: "oklch(0.55 0.02 250)",
  Retensi: "oklch(0.75 0.16 80)",
};

export function StatusDistribution({ data }: { data: { name: string; value: number }[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <header className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Distribusi Status Arsip</h3>
      </header>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
              {data.map((d) => (
                <Cell key={d.name} fill={STATUS_COLORS[d.name] ?? "oklch(0.55 0.02 250)"} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 250)", fontSize: 12 }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}