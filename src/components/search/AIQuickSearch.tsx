import { Sparkles, ArrowRight } from "lucide-react";
import { AI_EXAMPLES } from "./utils";

export function AIQuickSearch({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-4 shadow-sm">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative">
        <div className="mb-2 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Cari dengan AI</h3>
            <p className="text-[11px] text-muted-foreground">
              Gunakan bahasa natural untuk menemukan arsip lebih cepat.
            </p>
          </div>
          <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            Beta
          </span>
        </div>
        {AI_EXAMPLES.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Belum ada contoh pencarian. Ketik pertanyaan Anda pada kolom pencarian untuk mulai.
          </p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {AI_EXAMPLES.map((ex) => (
              <li key={ex}>
                <button
                  onClick={() => onPick(ex)}
                  className="group flex w-full items-center justify-between gap-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-left text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="truncate italic text-muted-foreground group-hover:text-foreground">
                    "{ex}"
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
