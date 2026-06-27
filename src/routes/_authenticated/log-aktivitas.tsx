import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ActivitySummary,
  ActivityTimeline,
  ActivityTable,
  ActivityFilter,
  ActivitySearch,
  ActivityDetail,
  ActivityLoading,
  ActivityEmptyState,
  type ActivityFilterValue,
} from "@/components/log";
import { getLogSummary, type LogEntry } from "@/lib/log-data";
import { listActivityLog } from "@/lib/log-aktivitas.functions";

export const Route = createFileRoute("/_authenticated/log-aktivitas")({
  head: () => ({
    meta: [
      { title: "Log Aktivitas — SIPASTERA" },
      { name: "description", content: "Riwayat aktivitas pengguna di dalam sistem arsip." },
    ],
  }),
  component: LogPage,
});

function LogPage() {
  const [filter, setFilter] = useState<ActivityFilterValue>({});
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<LogEntry | null>(null);
  const fetchLog = useServerFn(listActivityLog);
  const logQuery = useQuery({
    queryKey: ["activity-log"],
    queryFn: () => fetchLog(),
    refetchOnWindowFocus: true,
  });
  const data = useMemo<LogEntry[]>(
    () => (logQuery.data ?? []) as LogEntry[],
    [logQuery.data],
  );
  const loading = logQuery.isLoading;

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((r) => {
      if (filter.user && r.user !== filter.user) return false;
      if (filter.modul && r.modul !== filter.modul) return false;
      if (filter.jenis && r.jenis !== filter.jenis) return false;
      if (filter.tanggal && !r.waktu.startsWith(filter.tanggal)) return false;
      if (q) {
        const hay = `${r.user} ${r.modul} ${r.aktivitas} ${r.jenis}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [filter, search, data]);

  const summary = useMemo(() => getLogSummary(data), [data]);
  const timeline = useMemo(
    () => [...data].sort((a, b) => b.waktu.localeCompare(a.waktu)).slice(0, 6),
    [data],
  );

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-600">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Log Aktivitas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Riwayat aktivitas pengguna di dalam sistem arsip digital.
          </p>
        </div>
      </header>

      {loading ? (
        <ActivityLoading />
      ) : (
        <>
          <ActivitySummary data={summary} />
          <ActivityTimeline items={timeline} />
          <ActivityFilter value={filter} onChange={setFilter} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ActivitySearch value={search} onChange={setSearch} />
            <p className="text-xs text-muted-foreground">{rows.length} aktivitas ditampilkan</p>
          </div>
          {rows.length === 0 ? (
            <ActivityEmptyState />
          ) : (
            <ActivityTable rows={rows} onView={setDetail} />
          )}
          <ActivityDetail row={detail} open={!!detail} onOpenChange={(v) => !v && setDetail(null)} />
        </>
      )}
    </div>
  );
}