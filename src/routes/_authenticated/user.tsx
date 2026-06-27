import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Users } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { UserSummary } from "@/components/user/UserSummary";
import { UserSearch } from "@/components/user/UserSearch";
import { UserFilter, type RoleFilter, type StatusFilter } from "@/components/user/UserFilter";
import { UserTable } from "@/components/user/UserTable";
import { UserEmptyState } from "@/components/user/UserEmptyState";
import { UserDialog } from "@/components/user/UserDialog";
import { UserForm, type UserFormValue } from "@/components/user/UserForm";
import { UserDetail } from "@/components/user/UserDetail";
import { UserActivityList } from "@/components/user/UserActivity";
import type { AppUser } from "@/lib/user-data";
import { listManagedUsers, type ManagedUser } from "@/lib/current-user.functions";
import {
  deleteManagedUser,
  resetUserPassword,
  updateManagedUser,
} from "@/lib/user-admin.functions";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/user")({
  head: () => ({ meta: [{ title: "Manajemen User — SIPASTERA" }] }),
  component: UserPage,
});

type DialogKind = "create" | "edit" | "detail" | "delete" | "reset" | null;

function toAppUser(m: ManagedUser): AppUser {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    role: m.role,
    status: (m.status === "Aktif" || m.status === "Nonaktif" ? m.status : "Aktif") as AppUser["status"],
    lastLogin: m.lastLogin
      ? new Date(m.lastLogin).toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Belum pernah",
    createdAt: m.createdAt
      ? new Date(m.createdAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-",
  };
}

function UserPage() {
  const { user: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const fetchUsers = useServerFn(listManagedUsers);
  const usersQuery = useQuery({
    queryKey: ["managed-users"],
    queryFn: () => fetchUsers(),
  });
  const callUpdate = useServerFn(updateManagedUser);
  const callDelete = useServerFn(deleteManagedUser);
  const callReset = useServerFn(resetUserPassword);

  const invalidateUsers = () =>
    queryClient.invalidateQueries({ queryKey: ["managed-users"] });

  const updateMutation = useMutation({
    mutationFn: (vars: {
      userId: string;
      role?: "Admin" | "Staff TU" | "Viewer";
      status?: "Aktif" | "Nonaktif";
      name?: string;
    }) => callUpdate({ data: vars }),
    onSuccess: () => {
      toast.success("Perubahan pengguna tersimpan.");
      void invalidateUsers();
      void queryClient.invalidateQueries({ queryKey: ["activity-log"] });
      close();
    },
    onError: (e: Error) => toast.error(e.message ?? "Gagal memperbarui user."),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => callDelete({ data: { userId } }),
    onSuccess: () => {
      toast.success("User berhasil dihapus.");
      void invalidateUsers();
      void queryClient.invalidateQueries({ queryKey: ["activity-log"] });
      close();
    },
    onError: (e: Error) => toast.error(e.message ?? "Gagal menghapus user."),
  });

  const resetMutation = useMutation({
    mutationFn: (userId: string) => callReset({ data: { userId } }),
    onSuccess: (res) => {
      toast.success(`Link reset password dikirim ke ${res.email}.`);
      void queryClient.invalidateQueries({ queryKey: ["activity-log"] });
      close();
    },
    onError: (e: Error) => toast.error(e.message ?? "Gagal mengirim link reset."),
  });
  const users: AppUser[] = useMemo(
    () => (usersQuery.data ?? []).map(toAppUser),
    [usersQuery.data],
  );

  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [target, setTarget] = useState<AppUser | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (role !== "all" && u.role !== role) return false;
      if (status !== "all" && u.status !== status) return false;
      if (!q) return true;
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });
  }, [users, query, role, status]);

  const summary = useMemo(
    () => ({
      total: users.length,
      admin: users.filter((u) => u.role === "Admin").length,
      staff: users.filter((u) => u.role === "Staff TU").length,
      active: users.filter((u) => u.status === "Aktif").length,
    }),
    [users],
  );

  const close = () => {
    setDialog(null);
    setTarget(null);
  };

  // Creating brand-new accounts is intentionally handled via the public
  // sign-up flow (email/password or Google/Microsoft via Lovable Cloud).
  const handleCreate = (_v: UserFormValue) => {
    toast.info(
      "Penambahan akun baru dilakukan melalui halaman pendaftaran resmi.",
    );
    close();
  };

  const handleEdit = (v: UserFormValue) => {
    if (!target) return;
    updateMutation.mutate({
      userId: target.id,
      role: v.role as "Admin" | "Staff TU" | "Viewer",
      status: v.status as "Aktif" | "Nonaktif",
      name: v.name,
    });
  };

  const handleDelete = () => {
    if (!target) return;
    deleteMutation.mutate(target.id);
  };

  const handleReset = () => {
    if (!target) return;
    resetMutation.mutate(target.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-sm shadow-blue-500/20">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Manajemen User</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Kelola seluruh akun pengguna SIPASTERA, role, dan status aksesnya.
              {currentUser?.role !== "Admin" && (
                <span className="ml-1 text-xs italic text-muted-foreground/80">
                  (Hanya Admin yang dapat melihat seluruh pengguna.)
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setTarget(null);
            setDialog("create");
          }}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Tambah User
        </button>
      </div>

      <UserSummary {...summary} />

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <UserSearch value={query} onChange={setQuery} />
          <UserFilter role={role} status={status} onRole={setRole} onStatus={setStatus} />
        </div>
        {usersQuery.isLoading ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            Memuat daftar pengguna…
          </div>
        ) : filtered.length === 0 ? (
          <UserEmptyState />
        ) : (
          <UserTable
            data={filtered}
            onView={(u) => {
              setTarget(u);
              setDialog("detail");
            }}
            onEdit={(u) => {
              setTarget(u);
              setDialog("edit");
            }}
            onReset={(u) => {
              setTarget(u);
              setDialog("reset");
            }}
            onDelete={(u) => {
              setTarget(u);
              setDialog("delete");
            }}
          />
        )}
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span>
            Menampilkan {filtered.length} dari {users.length} user
          </span>
        </div>
      </div>

      <UserDialog
        open={dialog === "create"}
        title="Tambah User"
        subtitle="Buat akun baru untuk Admin atau Staff TU."
        onClose={close}
      >
        <UserForm mode="create" onSubmit={handleCreate} onCancel={close} />
      </UserDialog>

      <UserDialog
        open={dialog === "edit"}
        title="Edit User"
        subtitle="Perbarui informasi akun pengguna."
        onClose={close}
      >
        <UserForm mode="edit" initial={target} onSubmit={handleEdit} onCancel={close} />
      </UserDialog>

      <UserDialog
        open={dialog === "detail"}
        title="Detail User"
        subtitle="Informasi lengkap dan aktivitas pengguna."
        size="lg"
        onClose={close}
      >
        {target && (
          <div className="space-y-5">
            <UserDetail user={target} />
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Aktivitas Terbaru
              </p>
              <UserActivityList user={target} />
            </div>
          </div>
        )}
      </UserDialog>

      <UserDialog
        open={dialog === "delete"}
        title="Hapus User"
        subtitle="Tindakan ini tidak dapat dibatalkan."
        size="sm"
        onClose={close}
      >
        <p className="text-sm text-foreground">
          Apakah Anda yakin ingin menghapus user{" "}
          <span className="font-semibold">{target?.name}</span>? Seluruh akses akan dicabut.
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={close}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90"
          >
            Hapus User
          </button>
        </div>
      </UserDialog>

      <UserDialog
        open={dialog === "reset"}
        title="Reset Password"
        subtitle="Kirim link reset password ke email pengguna."
        size="sm"
        onClose={close}
      >
        <p className="text-sm text-foreground">
          Reset password untuk <span className="font-semibold">{target?.name}</span>?
          Link reset akan dikirim ke <span className="font-medium">{target?.email}</span>.
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={close}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Batal
          </button>
          <button
            onClick={handleReset}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Kirim Link Reset
          </button>
        </div>
      </UserDialog>
    </div>
  );
}
