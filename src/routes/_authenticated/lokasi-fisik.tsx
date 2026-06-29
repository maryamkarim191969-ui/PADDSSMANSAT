import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, RefreshCcw, AlertTriangle } from "lucide-react";
import type { Lokasi } from "@/lib/lokasi-data";
import {
  listLokasi,
  createLokasi,
  updateLokasi,
  deleteLokasi,
  type LokasiRow,
} from "@/lib/lokasi.functions";
import { LocationSummary } from "@/components/lokasi/LocationSummary";
import { LocationSearch } from "@/components/lokasi/LocationSearch";
import {
  LocationFilter,
  type LocationSortKey,
} from "@/components/lokasi/LocationFilter";
import { LocationTable } from "@/components/lokasi/LocationTable";
import { LocationCard } from "@/components/lokasi/LocationCard";
import { LocationLoading } from "@/components/lokasi/LocationLoading";
import { LocationEmptyState } from "@/components/lokasi/LocationEmptyState";
import { LocationDetail } from "@/components/lokasi/LocationDetail";
import { LocationDialog } from "@/components/lokasi/LocationDialog";
import type { LocationFormValues } from "@/components/lokasi/LocationForm";
import { DeleteDialog } from "@/components/arsip/DeleteDialog";

export const Route = createFileRoute("/_authenticated/lokasi-fisik")({
  head: () => ({
    meta: [
      { title: "Lokasi Fisik Arsip — PADDS SMANSAT" },
      {
        name: "description",
        content:
          "Petakan lokasi penyimpanan fisik arsip agar file digital dan fisik mudah ditemukan.",
      },
    ],
  }),
  component: LokasiFisikPage,
});

function LokasiFisikPage() {
  const queryClient = useQueryClient();
  const fetchList = useServerFn(listLokasi);
  const createFn = useServerFn(createLokasi);
  const updateFn = useServerFn(updateLokasi);
  const deleteFn = useServerFn(deleteLokasi);

  const query = useQuery({
    queryKey: ["lokasi"],
    queryFn: () => fetchList(),
  });
  const data: Lokasi[] = useMemo(
    () =>
      (query.data ?? []).map((r: LokasiRow) => ({
        id: r.id,
        nama: r.nama,
        kode: r.kode,
        ruangan: r.ruangan,
        rak: r.rak,
        deskripsi: r.deskripsi,
        jumlahArsip: r.jumlahArsip,
        status: r.status,
        createdAt: r.createdAt,
      })),
    [query.data],
  );
  const loading = query.isLoading;
  const error = query.error ? (query.error as Error).message : null;
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["lokasi"] });

  const createMut = useMutation({
    mutationFn: (values: LocationFormValues) => createFn({ data: values }),
    onSuccess: () => {
      toast.success("Lokasi berhasil ditambahkan");
      invalidate();
      setIsCreating(false);
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan lokasi"),
  });
  const updateMut = useMutation({
    mutationFn: (input: { id: string; values: LocationFormValues }) =>
      updateFn({ data: { id: input.id, ...input.values } }),
    onSuccess: () => {
      toast.success("Perubahan lokasi tersimpan");
      invalidate();
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menyimpan perubahan"),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Lokasi dihapus");
      invalidate();
      setToDelete(null);
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus lokasi"),
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<LocationSortKey>("newest");

  const [detail, setDetail] = useState<Lokasi | null>(null);
  const [editing, setEditing] = useState<Lokasi | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Lokasi | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = data.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!q) return true;
      return (
        r.nama.toLowerCase().includes(q) ||
        r.kode.toLowerCase().includes(q) ||
        r.ruangan.toLowerCase().includes(q)
      );
    });
    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return +new Date(a.createdAt) - +new Date(b.createdAt);
        case "az":
          return a.nama.localeCompare(b.nama);
        case "za":
          return b.nama.localeCompare(a.nama);
        case "newest":
        default:
          return +new Date(b.createdAt) - +new Date(a.createdAt);
      }
    });
    return rows;
  }, [data, search, status, sort]);

  const totals = useMemo(
    () => ({
      total: data.length,
      aktif: data.filter((d) => d.status === "Aktif").length,
      totalArsip: data.reduce((sum, d) => sum + d.jumlahArsip, 0),
    }),
    [data],
  );

  const isFiltered = search !== "" || status !== "all";

  function handleCreate(values: LocationFormValues) {
    createMut.mutate(values);
  }

  function handleUpdate(values: LocationFormValues) {
    if (!editing) return;
    updateMut.mutate({ id: editing.id, values });
  }

  function confirmDelete() {
    if (!toDelete) return;
    deleteMut.mutate(toDelete.id);
  }

  function resetFilters() {
    setSearch("");
    setStatus("all");
    setSort("newest");
  }

  function retry() {
    query.refetch();
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Summary */}
      <LocationSummary
        total={totals.total}
        aktif={totals.aktif}
        totalArsip={totals.totalArsip}
      />

      {/* Header card */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Daftar Lokasi Fisik</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {loading
                ? "Memuat lokasi..."
                : `${filtered.length} lokasi ${isFiltered ? "ditemukan" : "tersedia"}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Tambah Lokasi
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <LocationSearch value={search} onChange={setSearch} />
            <LocationFilter
              status={status}
              setStatus={setStatus}
              sort={sort}
              setSort={setSort}
            />
          </div>
        </div>
      </section>

      {/* Table / list card */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {error ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Gagal memuat lokasi</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error}</p>
            <button
              onClick={retry}
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-4 text-xs font-medium hover:bg-muted"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> Coba lagi
            </button>
          </div>
        ) : loading ? (
          <LocationLoading rows={6} />
        ) : filtered.length === 0 ? (
          <LocationEmptyState
            title={isFiltered ? "Tidak ada lokasi ditemukan" : "Belum ada lokasi"}
            description={
              isFiltered
                ? "Coba ubah kata kunci atau filter status."
                : "Tambahkan lokasi pertama Anda untuk mulai memetakan arsip fisik."
            }
            action={
              isFiltered ? (
                <button
                  onClick={resetFilters}
                  className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-4 text-xs font-medium hover:bg-muted"
                >
                  Reset filter
                </button>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Lokasi
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="hidden sm:block">
              <LocationTable
                data={filtered}
                onView={setDetail}
                onEdit={setEditing}
                onDelete={setToDelete}
              />
            </div>
            <div className="sm:hidden">
              <LocationCard
                data={filtered}
                onView={setDetail}
                onEdit={setEditing}
                onDelete={setToDelete}
              />
            </div>
          </>
        )}
      </section>

      {/* Detail */}
      <LocationDetail
        lokasi={detail}
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        onEdit={() => {
          if (detail) {
            setEditing(detail);
            setDetail(null);
          }
        }}
      />

      {/* Create */}
      <LocationDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        initial={null}
        onSubmit={handleCreate}
      />

      {/* Edit */}
      <LocationDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        initial={editing}
        onSubmit={handleUpdate}
      />

      {/* Delete */}
      <DeleteDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        onConfirm={confirmDelete}
        title="Hapus Lokasi?"
        description="Tindakan ini tidak dapat dibatalkan. Lokasi akan dihapus secara permanen dari sistem."
        itemLabel={toDelete ? `${toDelete.kode} — ${toDelete.nama}` : undefined}
      />
    </div>
  );
}
