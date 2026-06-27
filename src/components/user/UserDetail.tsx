import { Mail, Calendar, Clock, ShieldCheck, UserCog } from "lucide-react";
import type { AppUser } from "@/lib/user-data";

export function UserDetail({ user }: { user: AppUser }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-muted/30 p-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-semibold text-white">
          {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-foreground">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Row icon={user.role === "Admin" ? ShieldCheck : UserCog} label="Role" value={user.role} />
        <Row
          icon={Clock}
          label="Status"
          value={user.status}
          valueClass={user.status === "Aktif" ? "text-emerald-600" : "text-muted-foreground"}
        />
        <Row icon={Mail} label="Email" value={user.email} />
        <Row icon={Calendar} label="Dibuat" value={user.createdAt} />
        <Row icon={Clock} label="Login Terakhir" value={user.lastLogin} />
      </dl>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className={`mt-1 truncate text-sm font-medium ${valueClass ?? "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}