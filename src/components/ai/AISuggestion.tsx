import { Sparkles } from "lucide-react";
import { suggestedPrompts } from "@/lib/ai-data";

type Props = { onPick: (prompt: string) => void };

export function AISuggestion({ onPick }: Props) {
  return (
    <div className="space-y-3 px-1">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Saran Pertanyaan
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {suggestedPrompts.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="group rounded-xl border border-border bg-card px-3 py-2.5 text-left text-sm text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <span className="line-clamp-1">{p}</span>
          </button>
        ))}
      </div>
    </div>
  );
}