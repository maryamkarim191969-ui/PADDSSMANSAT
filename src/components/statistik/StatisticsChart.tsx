import { useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Range = "harian" | "bulanan" | "tahunan";

type Props = {
  daily: { label: string; value: number }[];
  monthly: { label: string; value: number }[];
  yearly: { label: string; value: number }[];
};

export function StatisticsChart({ daily, monthly, yearly }: Props) {
  const [range, setRange] = useState<Range>("bulanan");
  const data = range === "harian" ? daily : range === "tahunan" ? yearly : monthly;
  const tabs: { key: Range; label: string }[] = [
    { key: "harian", label: "Harian" },
    { key: "bulanan", label: "Bulanan" },
    { key: "tahunan", label: "Tahunan" },
  ];
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Pertumbuhan Arsip</h3>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-muted p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setRange(t.key)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                range === t.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.55 0.20 255)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="oklch(0.55 0.20 255)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="oklch(0.92 0.01 250)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "oklch(0.50 0.02 250)" }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "oklch(0.50 0.02 250)" }} width={36} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 250)", fontSize: 12 }} />
            <Area type="monotone" dataKey="value" stroke="oklch(0.55 0.20 255)" strokeWidth={2} fill="url(#growthGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}