import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import {
  RetentionSummary,
  RetentionTable,
  RetentionFilter,
  RetentionSearch,
  RetentionDetail,
  RetentionLoading,
  RetentionEmptyState,
  type RetentionFilterValue,
} from "@/components/retensi";
import type { RetensiRow } from "@/lib/retensi.functions";
import { useRetensiList } from "@/hooks/use-retensi";
import { useArsipFacets } from "@/hooks/use-arsip";

export const Route = createFileRoute("/_authenticated/retensi")({
  head: () => ({
    meta: [
      { title: "Retensi Dokumen — PADDS SMANSAT" },
      { name: "description", content: "Pantau masa simpan dan jadwal retensi dokumen arsip." },
    ],
  }),
  component: RetensiPage,
});

function RetensiPage() {
  const [filter, setFilter] = useState<RetentionFilterValue>({});
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<RetensiRow | null>(null);

  const input = useMemo(
    () => ({
      tahun: filter.tahun,
      kategori: filter.kategori,
      status: filter.status,
      search,
    }),
    [filter, search],
  );

  const query = useRetensiList(input);
  const facets = useArsipFacets();
  const rows = query.data?.rows ?? [];
  const summary = query.data?.summary ?? { total: 0, mendekati: 0, kadaluarsa: 0, aktif: 0 };

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Retensi Dokumen</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pantau arsip yang mendekati masa retensi atau telah melewati masa retensi.
          </p>
        </div>
      </header>

      {query.error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Gagal memuat retensi: {(query.error as Error).message}
        </div>
      ) : query.isLoading ? (
        <RetentionLoading />
      ) : (
        <>
          <RetentionSummary data={summary} />
          <RetentionFilter
            value={filter}
            onChange={setFilter}
            tahunList={facets.data?.tahun ?? []}
            kategoriList={facets.data?.kategori ?? []}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <RetentionSearch value={search} onChange={setSearch} />
            <p className="text-xs text-muted-foreground">{rows.length} arsip ditampilkan</p>
          </div>
          {rows.length === 0 ? (
            <RetentionEmptyState />
          ) : (
            <RetentionTable rows={rows} onView={setDetail} />
          )}
          <RetentionDetail row={detail} open={!!detail} onOpenChange={(v) => !v && setDetail(null)} />
        </>
      )}
    </div>
  );
}
