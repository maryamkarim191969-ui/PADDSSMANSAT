import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  StatisticsSummary,
  StatisticsChart,
  CategoryDistribution,
  StatusDistribution,
  TopCategoryChart,
  TopLocationChart,
  StatisticsFilter,
  StatisticsTable,
  StatisticsExport,
  StatisticsLoading,
  StatisticsEmptyState,
} from "@/components/statistik";
import type { StatistikFilter } from "@/lib/statistik-data";
import { useStatistikOverview } from "@/hooks/use-statistik";
import { useArsipFacets } from "@/hooks/use-arsip";

export const Route = createFileRoute("/_authenticated/statistik")({
  head: () => ({
    meta: [
      { title: "Statistik & Laporan — SIPASTERA" },
      { name: "description", content: "Visualisasi data arsip sekolah secara profesional." },
    ],
  }),
  component: StatistikPage,
});

function StatistikPage() {
  const [filter, setFilter] = useState<StatistikFilter>({});
  const facets = useArsipFacets();
  const overview = useStatistikOverview(filter);
  const data = overview.data;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Statistik & Laporan</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Visualisasi data arsip sekolah untuk pemantauan dan pelaporan.
            </p>
          </div>
        </div>
        <StatisticsExport />
      </header>

      <StatisticsFilter
        value={filter}
        onChange={setFilter}
        tahunList={facets.data?.tahun ?? []}
        kategoriList={facets.data?.kategori ?? []}
      />

      {overview.error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Gagal memuat statistik: {(overview.error as Error).message}
        </div>
      ) : overview.isLoading || !data ? (
        <StatisticsLoading />
      ) : data.isEmpty ? (
        <StatisticsEmptyState />
      ) : (
        <>
          <StatisticsSummary data={data.summary} />
          <StatisticsChart daily={data.daily} monthly={data.monthly} yearly={data.yearly} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CategoryDistribution data={data.categoryDistribution} />
            <StatusDistribution data={data.statusDistribution} />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TopCategoryChart data={data.topCategory} />
            <TopLocationChart data={data.topLocation} />
          </div>
          <StatisticsTable rows={data.yearlyReport} />
        </>
      )}
    </div>
  );
}
