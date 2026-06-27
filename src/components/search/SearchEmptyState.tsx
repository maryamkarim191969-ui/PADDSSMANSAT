import { SearchX } from "lucide-react";

export function SearchEmptyState({
  query,
  onReset,
}: {
  query: string;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-muted">
        <SearchX className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">
        {query ? `Tidak ada arsip untuk "${query}"` : "Belum ada hasil"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Coba gunakan kata kunci lain, periksa ejaan, atau atur ulang filter Anda.
      </p>
      <button
        onClick={onReset}
        className="mt-4 inline-flex h-9 items-center rounded-lg border border-border bg-background px-4 text-xs font-medium hover:bg-muted"
      >
        Reset Pencarian
      </button>
    </div>
  );
}
