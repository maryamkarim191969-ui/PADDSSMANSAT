import { Eye, Pencil, KeyRound, Trash2, ShieldCheck, UserCog } from "lucide-react";
import type { AppUser } from "@/lib/user-data";

type Props = {
  data: AppUser[];
  onView: (u: AppUser) => void;
  onEdit: (u: AppUser) => void;
  onReset: (u: AppUser) => void;
  onDelete: (u: AppUser) => void;
};

function roleBadge(role: AppUser["role"]) {
  if (role === "Admin")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700 ring-1 ring-violet-100">
        <ShieldCheck className="h-3 w-3" /> Admin
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-blue-100">
      <UserCog className="h-3 w-3" /> Staff TU
    </span>
  );
}

function statusBadge(s: AppUser["status"]) {
  if (s === "Aktif")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Aktif
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" /> Nonaktif
    </span>
  );
}

export function UserTable({ data, onView, onEdit, onReset, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3">Nama</th>
            <th className="px-3 py-3">Email</th>
            <th className="px-3 py-3">Role</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Terakhir Login</th>
            <th className="px-3 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((u) => (
            <tr key={u.id} className="transition-colors hover:bg-accent/40">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-semibold text-white">
                    {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{u.name}</p>
                    <p className="text-[11px] text-muted-foreground">ID: {u.id}</p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 text-muted-foreground">{u.email}</td>
              <td className="px-3 py-3">{roleBadge(u.role)}</td>
              <td className="px-3 py-3">{statusBadge(u.status)}</td>
              <td className="px-3 py-3 text-muted-foreground">{u.lastLogin}</td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-end gap-1">
                  <IconBtn label="Detail" onClick={() => onView(u)}>
                    <Eye className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn label="Edit" onClick={() => onEdit(u)}>
                    <Pencil className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn label="Reset Password" onClick={() => onReset(u)}>
                    <KeyRound className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn label="Hapus" tone="danger" onClick={() => onDelete(u)}>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IconBtn({
  children,
  label,
  tone,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  tone?: "danger";
  onClick: () => void;
}) {
  const cls =
    tone === "danger"
      ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      : "text-muted-foreground hover:bg-accent hover:text-foreground";
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${cls}`}
    >
      {children}
    </button>
  );
}