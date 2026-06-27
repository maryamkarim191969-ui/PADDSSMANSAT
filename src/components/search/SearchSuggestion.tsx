import { Search } from "lucide-react";

export function SearchSuggestion({
  items,
  onPick,
}: {
  items: string[];
  onPick: (q: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
      <p className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Saran pencarian
      </p>
      <ul className="py-1">
        {items.map((s) => (
          <li key={s}>
            <button
              type="button"
              onMouseDown={(e) => {
                // mousedown so it fires before input blur
                e.preventDefault();
                onPick(s);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
            >
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="truncate">{s}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
