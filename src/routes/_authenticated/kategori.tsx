import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, RefreshCcw, AlertTriangle } from "lucide-react";
import type { Kategori } from "@/lib/kategori-data";
import {
  listKategori,
  createKategori,
  updateKategori,
  deleteKategori,
  type KategoriRow,
} from "@/lib/kategori.functions";
import { CategorySummary } from "@/components/kategori/CategorySummary";
import { CategorySearch } from "@/components/kategori/CategorySearch";
import {
  CategoryFilter,
  type CategorySortKey,
} from "@/components/kategori/CategoryFilter";
import { CategoryTable } from "@/components/kategori/CategoryTable";
import { CategoryCard } from "@/components/kategori/CategoryCard";
import { CategoryLoading } from "@/components/kategori/CategoryLoading";
import { CategoryEmptyState } from "@/components/kategori/CategoryEmptyState";
import { CategoryDetail } from "@/components/kategori/CategoryDetail";
import { CategoryDialog } from "@/components/kategori/CategoryDialog";
import type { CategoryFormValues } from "@/components/kategori/CategoryForm";
import { DeleteDialog } from "@/components/arsip/DeleteDialog";

export const Route = createFileRoute("/_authenticated/kategori")({
  head: () => ({
    meta: [
      { title: "Kategori Arsip — SIPASTERA" },
      {
        name: "description",
        content:
          "Kelola kategori arsip agar proses pengarsipan dokumen sekolah lebih terstruktur.",
      },
    ],
  }),
  component: KategoriPage,
});

function KategoriPage() {
  const queryClient = useQueryClient();
  const fetchList = useServerFn(listKategori);
  const createFn = useServerFn(createKategori);
  const updateFn = useServerFn(updateKategori);
  const deleteFn = useServerFn(deleteKategori);

  const query = useQuery({
    queryKey: ["kategori"],
    queryFn: () => fetchList(),
  });
  const data: Kategori[] = useMemo(
    () =>
      (query.data ?? []).map((r: KategoriRow) => ({
        id: r.id,
        nama: r.nama,
        kode: r.kode,
        deskripsi: r.deskripsi,
        jumlahArsip: r.jumlahArsip,
        status: r.status,
        createdAt: r.createdAt,
      })),
    [query.data],
  );
  const loading = query.isLoading;
  const error = query.error ? (query.error as Error).message : null;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["kategori"] });
  };

  const createMut = useMutation({
    mutationFn: (values: CategoryFormValues) => createFn({ data: values }),
    onSuccess: () => {
      toast.success("Kategori berhasil ditambahkan");
      invalidate();
      setIsCreating(false);
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menambahkan kategori"),
  });
  const updateMut = useMutation({
    mutationFn: (input: { id: string; values: CategoryFormValues }) =>
      updateFn({ data: { id: input.id, ...input.values } }),
    onSuccess: () => {
      toast.success("Perubahan kategori tersimpan");
      invalidate();
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menyimpan perubahan"),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Kategori dihapus");
      invalidate();
      setToDelete(null);
    },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus kategori"),
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<CategorySortKey>("newest");

  const [detail, setDetail] = useState<Kategori | null>(null);
  const [editing, setEditing] = useState<Kategori | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Kategori | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = data.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!q) return true;
      return (
        r.nama.toLowerCase().includes(q) || r.kode.toLowerCase().includes(q)
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
      nonaktif: data.filter((d) => d.status === "Nonaktif").length,
    }),
    [data],
  );

  const isFiltered = search !== "" || status !== "all";

  function handleCreate(values: CategoryFormValues) {
    createMut.mutate(values);
  }

  function handleUpdate(values: CategoryFormValues) {
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
      <CategorySummary
        total={totals.total}
        aktif={totals.aktif}
        nonaktif={totals.nonaktif}
      />

      {/* Header card */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Daftar Kategori</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {loading
                ? "Memuat kategori..."
                : `${filtered.length} kategori ${isFiltered ? "ditemukan" : "tersedia"}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Tambah Kategori
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <CategorySearch value={search} onChange={setSearch} />
            <CategoryFilter
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
            <h3 className="text-sm font-semibold text-foreground">Gagal memuat kategori</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error}</p>
            <button
              onClick={retry}
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-4 text-xs font-medium hover:bg-muted"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> Coba lagi
            </button>
          </div>
        ) : loading ? (
          <CategoryLoading rows={6} />
        ) : filtered.length === 0 ? (
          <CategoryEmptyState
            title={isFiltered ? "Tidak ada kategori ditemukan" : "Belum ada kategori"}
            description={
              isFiltered
                ? "Coba ubah kata kunci atau filter status."
                : "Tambahkan kategori pertama Anda untuk mulai mengelompokkan arsip."
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
                  <Plus className="h-3.5 w-3.5" /> Tambah Kategori
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="hidden sm:block">
              <CategoryTable
                data={filtered}
                onView={setDetail}
                onEdit={setEditing}
                onDelete={setToDelete}
              />
            </div>
            <div className="sm:hidden">
              <CategoryCard
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
      <CategoryDetail
        kategori={detail}
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
      <CategoryDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        initial={null}
        onSubmit={handleCreate}
      />

      {/* Edit */}
      <CategoryDialog
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
        title="Hapus Kategori?"
        description="Tindakan ini tidak dapat dibatalkan. Kategori akan dihapus secara permanen dari sistem."
        itemLabel={toDelete ? `${toDelete.kode} — ${toDelete.nama}` : undefined}
      />
    </div>
  );
}