import { Command } from "lucide-react";
import { suggestedCommands } from "@/lib/ai-data";

type Props = { onPick: (prompt: string) => void };

const GROUP_TONE: Record<string, string> = {
  Pencarian: "border-blue-200 bg-blue-50 text-blue-700",
  Analisis: "border-amber-200 bg-amber-50 text-amber-700",
  Dokumen: "border-violet-200 bg-violet-50 text-violet-700",
  Sistem: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function AISuggestedCommands({ onPick }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Command className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-semibold text-foreground">Suggested Commands</p>
        <span className="ml-auto text-[11px] text-muted-foreground">
          Klik untuk menjalankan
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestedCommands.map((c) => (
          <button
            key={c.prompt}
            onClick={() => onPick(c.prompt)}
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <span
              className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${GROUP_TONE[c.group] ?? ""}`}
            >
              {c.group}
            </span>
            <span className="line-clamp-1 max-w-[26ch]">{c.prompt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
