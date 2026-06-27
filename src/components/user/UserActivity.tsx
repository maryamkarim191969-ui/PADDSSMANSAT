import { Activity } from "lucide-react";
import { userActivities, type AppUser } from "@/lib/user-data";

export function UserActivityList({ user }: { user: AppUser }) {
  const items = userActivities.filter((a) => a.userId === user.id);
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-xs text-muted-foreground">
        Belum ada aktivitas tercatat untuk user ini.
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((a) => (
        <li
          key={a.id}
          className="flex items-start gap-3 rounded-xl border border-border bg-card p-3"
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
            <Activity className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{a.action}</p>
            <p className="truncate text-xs text-muted-foreground">{a.detail}</p>
          </div>
          <span className="shrink-0 text-[11px] text-muted-foreground">{a.at}</span>
        </li>
      ))}
    </ul>
  );
}