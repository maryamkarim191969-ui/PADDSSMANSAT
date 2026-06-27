import type { UserRole, UserStatus } from "@/lib/user-data";

export type RoleFilter = "all" | UserRole;
export type StatusFilter = "all" | UserStatus;

type Props = {
  role: RoleFilter;
  status: StatusFilter;
  onRole: (r: RoleFilter) => void;
  onStatus: (s: StatusFilter) => void;
};

const ROLES: { label: string; value: RoleFilter }[] = [
  { label: "Semua Role", value: "all" },
  { label: "Admin", value: "Admin" },
  { label: "Staff TU", value: "Staff TU" },
  { label: "Viewer", value: "Viewer" },
];

const STATUS: { label: string; value: StatusFilter }[] = [
  { label: "Semua Status", value: "all" },
  { label: "Aktif", value: "Aktif" },
  { label: "Nonaktif", value: "Nonaktif" },
];

export function UserFilter({ role, status, onRole, onStatus }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={role}
        onChange={(e) => onRole(e.target.value as RoleFilter)}
        className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <select
        value={status}
        onChange={(e) => onStatus(e.target.value as StatusFilter)}
        className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
      >
        {STATUS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}