/**
 * Client-safe role/permission matrix shared across the app.
 *
 * The server-side AI permission file (`ai-permission.server.ts`) keeps its
 * own copy because it imports server-only Supabase clients; this module is
 * the canonical source for UI gating.
 */

export type AppRole = "Admin" | "Staff TU" | "Viewer";

export const ROLE_DB_TO_APP: Record<string, AppRole> = {
  admin: "Admin",
  staff_tu: "Staff TU",
  viewer: "Viewer",
};

export type Permission =
  | "read.arsip"
  | "read.kategori"
  | "read.qr"
  | "read.user"
  | "read.log"
  | "read.statistik"
  | "read.backup"
  | "write.arsip"
  | "write.kategori"
  | "write.qr"
  | "delete.arsip"
  | "delete.kategori"
  | "delete.user"
  | "create.user"
  | "update.user.role"
  | "system.backup"
  | "system.restore";

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  Admin: [
    "read.arsip", "read.kategori", "read.qr", "read.user", "read.log",
    "read.statistik", "read.backup",
    "write.arsip", "write.kategori", "write.qr",
    "delete.arsip", "delete.kategori", "delete.user",
    "create.user", "update.user.role",
    "system.backup", "system.restore",
  ],
  "Staff TU": [
    "read.arsip", "read.kategori", "read.qr", "read.user", "read.log",
    "read.statistik",
    "write.arsip", "write.kategori", "write.qr",
  ],
  Viewer: ["read.arsip", "read.kategori", "read.qr", "read.statistik"],
};

export function permissionsFor(role: AppRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: AppRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
