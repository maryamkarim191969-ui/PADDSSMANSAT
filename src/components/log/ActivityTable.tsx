import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LogEntry } from "@/lib/log-data";
import { formatWaktu } from "@/lib/log-data";
import { JenisBadge, StatusBadge } from "./ActivityStatusBadge";

export function ActivityTable({
  rows, onView, onDelete,
}: {
  rows: LogEntry[];
  onView: (row: LogEntry) => void;
  onDelete?: (row: LogEntry) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Aktivitas</th>
              <th className="px-5 py-3">Modul</th>
              <th className="px-5 py-3">Waktu</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border transition-colors hover:bg-muted/30">
                <td className="px-5 py-3">
                  <p className="font-medium text-foreground">{r.user}</p>
                  <p className="text-xs text-muted-foreground">{r.role}</p>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <JenisBadge jenis={r.jenis} />
                    <span className="text-foreground/90">{r.aktivitas}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-foreground/80">{r.modul}</td>
                <td className="px-5 py-3 text-foreground/80">{formatWaktu(r.waktu)}</td>
                <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-5 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => onView(r)}>
                    <Eye className="mr-1.5 h-4 w-4" /> Detail
                  </Button>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(r)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}