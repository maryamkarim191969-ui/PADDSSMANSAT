import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Activity, Trash2, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { purgeActivityLogs, deleteActivityLog } from "@/lib/system.functions";
import { useCurrentUser } from "@/hooks/use-current-user";

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
  const { user } = useCurrentUser();
  const isAdmin = user?.role === "Admin";
  const [filter, setFilter] = useState<ActivityFilterValue>({});
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<LogEntry | null>(null);
  const fetchLog = useServerFn(listActivityLog);
  const purgeFn = useServerFn(purgeActivityLogs);
  const delFn = useServerFn(deleteActivityLog);
  const qc = useQueryClient();
  const logQuery = useQuery({
    queryKey: ["activity-log"],
    queryFn: () => fetchLog(),
    refetchOnWindowFocus: true,
  });

  const purgeMut = useMutation({
    mutationFn: (days: number) => purgeFn({ data: { olderThanDays: days } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activity-log"] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activity-log"] }),
  });

  const handlePurge = (days: number, label: string) => {
    if (!window.confirm(`Hapus log ${label}? Tindakan ini tidak dapat dibatalkan.`)) return;
    purgeMut.mutate(days);
  };
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
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-600">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Log Aktivitas</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Riwayat aktivitas pengguna di dalam sistem arsip digital.
            </p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handlePurge(90, "lebih lama dari 90 hari")}
              disabled={purgeMut.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
            >
              {purgeMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Bersihkan &gt; 90 hari
            </button>
            <button
              onClick={() => handlePurge(30, "lebih lama dari 30 hari")}
              disabled={purgeMut.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" /> Bersihkan &gt; 30 hari
            </button>
            <button
              onClick={() => handlePurge(0, "SELURUH log")}
              disabled={purgeMut.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" /> Bersihkan semua
            </button>
          </div>
        )}
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
            <ActivityTable
              rows={rows}
              onView={setDetail}
              onDelete={isAdmin ? (r) => deleteMut.mutate(r.id) : undefined}
            />
          )}
          <ActivityDetail row={detail} open={!!detail} onOpenChange={(v) => !v && setDetail(null)} />
        </>
      )}
    </div>
  );
}