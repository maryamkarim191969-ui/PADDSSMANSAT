import { TrendingUp } from "lucide-react";
import { POPULAR_SEARCHES } from "./utils";

export function PopularSearch({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Pencarian Populer</h3>
      </div>
      {POPULAR_SEARCHES.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Belum ada pencarian populer. Riwayat pencarian akan muncul di sini.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_SEARCHES.map((q, i) => (
            <button
              key={q}
              onClick={() => onPick(q)}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <span className="text-[10px] font-bold text-muted-foreground">
                #{i + 1}
              </span>
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
