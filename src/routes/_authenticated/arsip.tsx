import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";

import {
  STATUS_LIST,
  JENIS_LIST,
  type Arsip,
} from "@/lib/arsip-data";
import { ArsipTable } from "@/components/arsip/ArsipTable";
import { ArsipSearch } from "@/components/arsip/ArsipSearch";
import { ArsipFilter } from "@/components/arsip/ArsipFilter";
import { ArsipSort, type SortKey } from "@/components/arsip/ArsipSort";
import { ArsipPagination } from "@/components/arsip/ArsipPagination";
import { ArsipDetail } from "@/components/arsip/ArsipDetail";
import { ArsipPreview } from "@/components/arsip/ArsipPreview";
import { EditMetadataDialog } from "@/components/arsip/EditMetadataDialog";
import { DeleteDialog } from "@/components/arsip/DeleteDialog";
import { EmptyState } from "@/components/arsip/EmptyState";
import { LoadingSkeleton } from "@/components/arsip/LoadingSkeleton";
import {
  useArsipFacets,
  useArsipList,
  useDeleteArsip,
} from "@/hooks/use-arsip";

export const Route = createFileRoute("/_authenticated/arsip")({
  head: () => ({
    meta: [
      { title: "Manajemen Arsip — PADDS SMANSAT" },
      {
        name: "description",
        content:
          "Kelola seluruh dokumen arsip sekolah secara terpusat di PADDS SMANSAT.",
      },
    ],
  }),
  component: ArsipPage,
});

function ArsipPage() {
  const [search, setSearch] = useState("");
  const [tahun, setTahun] = useState("all");
  const [kategori, setKategori] = useState("all");
  const [jenis, setJenis] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [detail, setDetail] = useState<Arsip | null>(null);
  const [preview, setPreview] = useState<Arsip | null>(null);
  const [edit, setEdit] = useState<Arsip | null>(null);
  const [toDelete, setToDelete] = useState<Arsip | null>(null);
  const [bulkDelete, setBulkDelete] = useState(false);

  // Reset to page 1 on filter / search / sort / pageSize changes.
  useEffect(() => {
    setPage(1);
  }, [search, tahun, kategori, jenis, status, sort, pageSize]);

  const listInput = useMemo(
    () => ({ search, tahun, kategori, jenis, status, sort, page, pageSize }),
    [search, tahun, kategori, jenis, status, sort, page, pageSize],
  );

  const listQuery = useArsipList(listInput);
  const facetsQuery = useArsipFacets();
  const deleteMutation = useDeleteArsip();

  const rows = listQuery.data?.rows ?? [];
  const total = listQuery.data?.total ?? 0;
  const loading = listQuery.isLoading;
  const error = listQuery.error ? (listQuery.error as Error).message : null;

  // Facet lists with sensible fallback: include the currently-selected value
  // so the Select never shows a blank.
  const tahunList = useMemo(() => {
    const set = new Set<number>(facetsQuery.data?.tahun ?? []);
    if (tahun !== "all") set.add(Number(tahun));
    return Array.from(set).sort((a, b) => b - a);
  }, [facetsQuery.data, tahun]);
  const kategoriList = useMemo(() => {
    const set = new Set<string>(facetsQuery.data?.kategori ?? []);
    if (kategori !== "all") set.add(kategori);
    return Array.from(set).sort();
  }, [facetsQuery.data, kategori]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleAll(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) rows.forEach((r) => next.add(r.id));
      else rows.forEach((r) => next.delete(r.id));
      return next;
    });
  }

  async function confirmDelete() {
    if (!toDelete) return;
    const target = toDelete;
    setToDelete(null);
    try {
      await deleteMutation.mutateAsync(target.id);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(target.id);
        return next;
      });
      toast.success("Arsip dihapus.", {
        description: `${target.nomorSurat} — ${target.judul}`,
      });
    } catch (e) {
      toast.error("Gagal menghapus arsip.", {
        description: (e as Error).message,
      });
    }
  }

  async function confirmBulk() {
    setBulkDelete(false);
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    let ok = 0;
    let fail = 0;
    for (const id of ids) {
      try {
        await deleteMutation.mutateAsync(id);
        ok++;
      } catch {
        fail++;
      }
    }
    setSelected(new Set());
    if (fail === 0) toast.success(`${ok} arsip dihapus.`);
    else toast.warning(`${ok} berhasil, ${fail} gagal.`);
  }

  const resetFilters = () => {
    setSearch("");
    setTahun("all");
    setKategori("all");
    setJenis("all");
    setStatus("all");
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Daftar Arsip</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {loading
                ? "Memuat dokumen..."
                : `${total} dokumen ${
                    search ||
                    tahun !== "all" ||
                    kategori !== "all" ||
                    jenis !== "all" ||
                    status !== "all"
                      ? "ditemukan"
                      : "tersedia"
                  }`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selected.size > 0 && (
              <button
                onClick={() => setBulkDelete(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" /> Hapus Terpilih ({selected.size})
              </button>
            )}
            <Link
              to="/upload"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Upload className="h-4 w-4" /> Upload Arsip
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <ArsipSearch value={search} onChange={setSearch} />
            <ArsipFilter
              tahun={tahun}
              setTahun={setTahun}
              kategori={kategori}
              setKategori={setKategori}
              jenis={jenis}
              setJenis={setJenis}
              status={status}
              setStatus={setStatus}
              tahunList={tahunList}
              kategoriList={kategoriList}
              jenisList={JENIS_LIST}
              statusList={STATUS_LIST}
            />
            <ArsipSort value={sort} onChange={setSort} />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {error ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <button
              onClick={() => listQuery.refetch()}
              className="mt-3 inline-flex h-9 items-center rounded-lg border border-border bg-background px-4 text-xs font-medium hover:bg-muted"
            >
              Coba lagi
            </button>
          </div>
        ) : loading ? (
          <LoadingSkeleton rows={pageSize} />
        ) : total === 0 ? (
          <EmptyState
            action={
              <button
                onClick={resetFilters}
                className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-4 text-xs font-medium hover:bg-muted"
              >
                Reset filter
              </button>
            }
          />
        ) : (
          <>
            <ArsipTable
              data={rows}
              selected={selected}
              onToggle={toggle}
              onToggleAll={toggleAll}
              onView={setDetail}
              onEdit={setEdit}
              onDelete={setToDelete}
            />
            <ArsipPagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </section>

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
      <EditMetadataDialog
        arsip={edit}
        open={!!edit}
        onOpenChange={(o) => !o && setEdit(null)}
        onSaved={() => setEdit(null)}
        kategoriList={kategoriList}
        tahunList={tahunList}
        lokasiList={facetsQuery.data?.lokasi ?? []}
      />
      <DeleteDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        onConfirm={confirmDelete}
        itemLabel={toDelete ? `${toDelete.nomorSurat} — ${toDelete.judul}` : undefined}
      />
      <DeleteDialog
        open={bulkDelete}
        onOpenChange={setBulkDelete}
        onConfirm={confirmBulk}
        title={`Hapus ${selected.size} Arsip?`}
        description="Semua arsip yang Anda pilih akan dihapus secara permanen dari sistem dan dari Cloudflare R2."
      />
    </div>
  );
}
