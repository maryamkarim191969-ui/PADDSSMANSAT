import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BarChart3,
  Brain,
  CheckCircle2,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import {
  AI_CAPABILITIES,
  getAiStatistics,
  type AiStatisticsOverview,
} from "@/lib/ai-statistik.functions";

export const Route = createFileRoute("/_authenticated/ai-statistik")({
  head: () => ({
    meta: [
      { title: "AI Statistics — PADDS SMANSAT" },
      {
        name: "description",
        content:
          "Pusat pemantauan aktivitas Artificial Intelligence pada platform PADDS SMANSAT.",
      },
    ],
  }),
  component: AiStatistikPage,
});

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "danger"
        ? "bg-destructive/10 text-destructive"
        : "bg-primary/10 text-primary";
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {hint ? (
            <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function AiStatistikPage() {
  const fn = useServerFn(getAiStatistics);
  const { data, isLoading } = useQuery<AiStatisticsOverview>({
    queryKey: ["ai-statistik", "overview"],
    queryFn: () => fn(),
    staleTime: 30_000,
  });

  const s = data;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              AI Statistics
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Pusat pemantauan aktivitas Artificial Intelligence pada platform
              PADDS SMANSAT selama {s?.windowDays ?? 30} hari terakhir.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Brain}
          label="Total Pemanggilan AI"
          value={isLoading ? "…" : (s?.totalCalls ?? 0).toLocaleString("id-ID")}
          hint="Seluruh kapabilitas AI"
        />
        <StatCard
          icon={CheckCircle2}
          label="Berhasil"
          value={isLoading ? "…" : (s?.successCount ?? 0).toLocaleString("id-ID")}
          tone="success"
        />
        <StatCard
          icon={XCircle}
          label="Gagal"
          value={isLoading ? "…" : (s?.failCount ?? 0).toLocaleString("id-ID")}
          tone="danger"
        />
        <StatCard
          icon={Users}
          label="Pengguna Aktif"
          value={isLoading ? "…" : (s?.activeUsers ?? 0).toLocaleString("id-ID")}
          hint="Menggunakan fitur AI"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <header className="mb-3">
            <h2 className="text-sm font-semibold text-foreground">
              Tren Aktivitas AI (30 hari)
            </h2>
            <p className="text-xs text-muted-foreground">
              Jumlah pemanggilan AI per hari.
            </p>
          </header>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={s?.trend ?? []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v: string) => v.slice(5)}
                  fontSize={11}
                />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <header className="mb-3">
            <h2 className="text-sm font-semibold text-foreground">
              Pengguna Teraktif
            </h2>
            <p className="text-xs text-muted-foreground">
              Top 8 pengguna dengan pemanggilan AI terbanyak.
            </p>
          </header>
          {(s?.topUsers.length ?? 0) === 0 ? (
            <p className="text-xs text-muted-foreground">
              Belum ada aktivitas AI pada periode ini.
            </p>
          ) : (
            <ul className="space-y-2">
              {s?.topUsers.map((u) => (
                <li
                  key={u.user}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-xs"
                >
                  <span className="truncate text-foreground">{u.user}</span>
                  <span className="font-semibold text-primary">{u.total}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <header className="mb-3">
          <h2 className="text-sm font-semibold text-foreground">
            Ringkasan per Kapabilitas AI
          </h2>
          <p className="text-xs text-muted-foreground">
            Total pemanggilan setiap fitur AI selama {s?.windowDays ?? 30} hari
            terakhir.
          </p>
        </header>
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={s?.perCapability ?? []}
                layout="vertical"
                margin={{ left: 24, right: 12 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" fontSize={11} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  fontSize={11}
                  width={160}
                />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2">
            {AI_CAPABILITIES.map((c) => {
              const row = s?.perCapability.find((r) => r.key === c.key);
              return (
                <li
                  key={c.key}
                  className="rounded-lg border border-border px-3 py-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-foreground">
                      {c.label}
                    </span>
                    <span className="text-primary font-semibold">
                      {row?.total ?? 0}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {c.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <header className="mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Peristiwa AI Terbaru
          </h2>
        </header>
        {(s?.recentEvents.length ?? 0) === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background/40 p-6 text-center">
            <Sparkles className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Belum ada aktivitas AI. Jalankan analisis metadata, pengecekan
              nomor surat, pencarian AI, atau AI Assistant untuk mulai
              memantau.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Waktu</th>
                  <th className="px-3 py-2 text-left">Pengguna</th>
                  <th className="px-3 py-2 text-left">Kapabilitas</th>
                  <th className="px-3 py-2 text-left">Detail</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {s?.recentEvents.map((e) => (
                  <tr key={e.id} className="border-t border-border align-top">
                    <td className="px-3 py-2 text-muted-foreground">
                      {new Date(e.at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-3 py-2 text-foreground">{e.user}</td>
                    <td className="px-3 py-2 text-foreground">{e.action}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      <p className="line-clamp-2">{e.detail}</p>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium " +
                          (e.status === "Gagal"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-emerald-50 text-emerald-700")
                        }
                      >
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}