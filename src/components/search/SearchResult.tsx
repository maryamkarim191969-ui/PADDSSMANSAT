import { LayoutGrid, List } from "lucide-react";
import type { Arsip } from "@/lib/arsip-data";
import { SearchCard, type SearchActions } from "./SearchCard";
import { SearchTable } from "./SearchTable";

export type ViewMode = "grid" | "table";

export function SearchResult({
  data,
  actions,
  view,
  onView,
  total,
  query,
}: {
  data: Arsip[];
  actions: SearchActions;
  view: ViewMode;
  onView: (v: ViewMode) => void;
  total: number;
  query: string;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Menampilkan <span className="font-semibold text-foreground">{total}</span>{" "}
          hasil
          {query && (
            <>
              {" "}untuk <span className="font-semibold text-foreground">"{query}"</span>
            </>
          )}
        </p>
        <div className="inline-flex rounded-lg bg-muted p-1">
          <ViewBtn active={view === "grid"} onClick={() => onView("grid")}>
            <LayoutGrid className="h-3.5 w-3.5" /> Grid
          </ViewBtn>
          <ViewBtn active={view === "table"} onClick={() => onView("table")}>
            <List className="h-3.5 w-3.5" /> Tabel
          </ViewBtn>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.map((r) => (
            <SearchCard key={r.id} arsip={r} actions={actions} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <SearchTable data={data} actions={actions} />
        </div>
      )}
    </section>
  );
}

function ViewBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-colors ${
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
