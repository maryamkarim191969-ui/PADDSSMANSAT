import { BookOpen, Compass, FileText, HelpCircle, LifeBuoy, Lightbulb, ListChecks, Sparkles, type LucideIcon } from "lucide-react";
import { quickActions, type QuickActionIcon } from "@/lib/ai-data";

type Props = { onPick: (prompt: string) => void };

const ICONS: Record<QuickActionIcon, LucideIcon> = {
  intro: Sparkles,
  modules: Compass,
  upload: FileText,
  search: BookOpen,
  workflow: ListChecks,
  faq: HelpCircle,
  terms: Lightbulb,
  support: LifeBuoy,
};

export function AIQuickActions({ onPick }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {quickActions.map((a) => {
        const Icon = ICONS[a.icon];
        return (
          <button
            key={a.key}
            onClick={() => onPick(a.prompt)}
            className="group flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500/15 to-violet-500/10 text-blue-600">
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{a.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
