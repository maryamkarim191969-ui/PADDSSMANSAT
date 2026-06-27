import { Clock } from "lucide-react";
import type { LogEntry } from "@/lib/log-data";
import { formatWaktu } from "@/lib/log-data";
import { JenisBadge } from "./ActivityStatusBadge";

export function ActivityTimeline({ items }: { items: LogEntry[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <header className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Aktivitas Terkini</h3>
      </header>
      <ol className="mt-4 space-y-4">
        {items.map((it, idx) => (
          <li key={it.id} className="relative pl-7">
            <span className="absolute left-2 top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-primary/15" />
            {idx !== items.length - 1 && (
              <span className="absolute left-2.5 top-4 h-full w-px bg-border" />
            )}
            <div className="flex flex-wrap items-center gap-2">
              <JenisBadge jenis={it.jenis} />
              <p className="text-sm font-medium text-foreground">{it.aktivitas}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {it.user} • {it.modul} • {formatWaktu(it.waktu)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}