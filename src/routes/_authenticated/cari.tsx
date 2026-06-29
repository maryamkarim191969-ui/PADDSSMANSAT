import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

import type { Arsip } from "@/lib/arsip-data";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchFilter } from "@/components/search/SearchFilter";
import { SearchSuggestion } from "@/components/search/SearchSuggestion";
import { SearchResult, type ViewMode } from "@/components/search/SearchResult";
import { SearchLoading } from "@/components/search/SearchLoading";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { SearchError } from "@/components/search/SearchError";
import { RecentSearch } from "@/components/search/RecentSearch";
import { PopularSearch } from "@/components/search/PopularSearch";
import { AIQuickSearch } from "@/components/search/AIQuickSearch";
import { AISearchPanel } from "@/components/search/AISearchPanel";
import { ArsipDetail } from "@/components/arsip/ArsipDetail";
import { ArsipPreview } from "@/components/arsip/ArsipPreview";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  clearRecent,
  loadRecent,
  saveRecent,
  type SearchSort,
} from "@/components/search/utils";
import { publicLinkFor } from "@/components/arsip/utils";
import { useArsipFacets, useArsipList } from "@/hooks/use-arsip";
import { getDownloadUrl } from "@/lib/storage.functions";

export const Route = createFileRoute("/_authenticated/cari")({
  head: () => ({
    meta: [
      { title: "Cari Arsip — PADDS SMANSAT" },
      {
        name: "description",
        content:
          "Cari arsip sekolah berdasarkan nomor surat, judul, kategori, tahun, dan lokasi.",
      },
    ],
  }),
  component: CariPage,
});

function CariPage() {
  const [mode, setMode] = useState<"standard" | "ai">("standard");
  const [query, setQuery] = useState("");
  const [committed, setCommitted] = useState("");
  const [kategori, setKategori] = useState("all");
  const [tahun, setTahun] = useState("all");
  const [status, setStatus] = useState("all");
  const [lokasi, setLokasi] = useState("all");
  const [sort, setSort] = useState<SearchSort>("newest");

  const [view, setView] = useState<ViewMode>("grid");
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  const [detail, setDetail] = useState<Arsip | null>(null);
  const [preview, setPreview] = useState<Arsip | null>(null);
  const [qr, setQr] = useState<Arsip | null>(null);
  const [toast, setLocalToast] = useState<string | null>(null);

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  const facetsQuery = useArsipFacets();

  const hasFilter =
    kategori !== "all" || tahun !== "all" || status !== "all" || lokasi !== "all";
  const isActive = !!committed.trim() || hasFilter;

  const listInput = useMemo(
    () => ({
      search: committed,
      kategori,
      tahun,
      status,
      lokasi,
      sort,
      page: 1,
      pageSize: 60,
    }),
    [committed, kategori, tahun, status, lokasi, sort],
  );

  const listQuery = useArsipList(listInput);
  const enabledResults = isActive ? listQuery.data?.rows ?? [] : [];

  // Suggestions from the same dataset (cheap: first 6 unique titles/nomor)
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !listQuery.data) return [];
    const out = new Set<string>();
    for (const r of listQuery.data.rows) {
      if (out.size >= 6) break;
      if (r.judul.toLowerCase().includes(q)) out.add(r.judul);
    }
    for (const r of listQuery.data.rows) {
      if (out.size >= 6) break;
      if (r.nomorSurat.toLowerCase().includes(q)) out.add(r.nomorSurat);
    }
    return Array.from(out);
  }, [query, listQuery.data]);

  function commitSearch(q?: string) {
    const next = (q ?? query).trim();
    setQuery(next);
    setCommitted(next);
    setFocused(false);
    if (next) setRecent(saveRecent(next));
  }

  function resetAll() {
    setQuery("");
    setCommitted("");
    setKategori("all");
    setTahun("all");
    setStatus("all");
    setLokasi("all");
    setSort("newest");
  }

  function copyLink(a: Arsip) {
    const link = publicLinkFor(a.id);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => {});
    }
    setLocalToast(`Link disalin: ${a.nomorSurat}`);
    setTimeout(() => setLocalToast(null), 1800);
  }

  async function download(a: Arsip) {
    try {
      const r = await getDownloadUrl({ data: { arsipId: a.id } });
      window.open(r.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      showToast.error?.("Gagal mengunduh.", { description: (e as Error).message });
    }
  }

  const actions = {
    onView: setDetail,
    onPreview: setPreview,
    onDownload: download,
    onCopyLink: copyLink,
    onQr: setQr,
  };

  const error = listQuery.error ? (listQuery.error as Error).message : null;
  const loading = isActive && listQuery.isLoading;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="inline-flex rounded-xl border border-border bg-card p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setMode("standard")}
          className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors ${
            mode === "standard"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="h-3.5 w-3.5" /> Pencarian Standar
        </button>
        <button
          type="button"
          onClick={() => setMode("ai")}
          className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors ${
            mode === "ai"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" /> AI Document Search
        </button>
      </div>

      {mode === "ai" ? (
        <AISearchPanel actions={actions} />
      ) : (
      <>
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Search className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-foreground">Cari Arsip</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Pencarian berbasis ILIKE pada nomor surat, judul, kategori, lokasi, dan deskripsi.
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={() => commitSearch()}
            onFocus={() => setFocused(true)}
          />
          {focused && suggestions.length > 0 && (
            <SearchSuggestion items={suggestions} onPick={(s) => commitSearch(s)} />
          )}
        </div>

        <div className="mt-4">
          <SearchFilter
            kategori={kategori}
            setKategori={setKategori}
            tahun={tahun}
            setTahun={setTahun}
            status={status}
            setStatus={setStatus}
            lokasi={lokasi}
            setLokasi={setLokasi}
            sort={sort}
            setSort={setSort}
            kategoriList={facetsQuery.data?.kategori ?? []}
            tahunList={facetsQuery.data?.tahun ?? []}
            lokasiList={facetsQuery.data?.lokasi ?? []}
          />
        </div>
      </section>

      {!isActive && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <RecentSearch
              items={recent}
              onPick={(q) => commitSearch(q)}
              onClear={() => setRecent(clearRecent())}
            />
            <PopularSearch onPick={(q) => commitSearch(q)} />
          </div>
          <AIQuickSearch onPick={(q) => commitSearch(q)} />
        </div>
      )}

      {isActive && (
        <>
          {error ? (
            <section className="rounded-2xl border border-border bg-card shadow-sm">
              <SearchError onRetry={() => listQuery.refetch()} message={error} />
            </section>
          ) : loading ? (
            <SearchLoading />
          ) : enabledResults.length === 0 ? (
            <section className="rounded-2xl border border-border bg-card shadow-sm">
              <SearchEmptyState query={committed} onReset={resetAll} />
            </section>
          ) : (
            <SearchResult
              data={enabledResults}
              actions={actions}
              view={view}
              onView={setView}
              total={enabledResults.length}
              query={committed}
            />
          )}
        </>
      )}
      </>
      )}

      <ArsipDetail
        arsip={detail}
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        onPreview={() => {
          if (detail) {
            setPreview(detail);
            setDetail(null);
          }
        }}
      />
      <ArsipPreview
        arsip={preview}
        open={!!preview}
        onOpenChange={(o) => !o && setPreview(null)}
      />
      <Dialog open={!!qr} onOpenChange={(o) => !o && setQr(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code Arsip</DialogTitle>
          </DialogHeader>
          {qr && (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=4&data=${encodeURIComponent(publicLinkFor(qr.id))}`}
                  alt={`QR ${qr.nomorSurat}`}
                  width={240}
                  height={240}
                />
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Pindai untuk membuka{" "}
                <span className="font-medium text-foreground">{qr.nomorSurat}</span>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-foreground px-4 py-2 text-xs font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  );
}

// Lazy access to sonner without forcing an import that might collide with the
// local `toast` UI flag above.
const showToast: { error?: (msg: string, opts?: { description?: string }) => void } = {
  error: (msg, opts) =>
    import("sonner").then(({ toast }) => toast.error(msg, opts)).catch(() => {}),
};
