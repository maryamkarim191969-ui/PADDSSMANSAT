import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  ROLE_DB_TO_APP,
  ROLE_PERMISSIONS,
  type AppRole,
  type Permission,
} from "@/lib/permissions";

export type CurrentUser = {
  userId: string;
  name: string;
  email: string;
  role: AppRole;
  permissions: Permission[];
  status: string;
  lastLogin: string | null;
  createdAt: string | null;
};

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  status: string;
  lastLogin: string | null;
  createdAt: string | null;
};

/**
 * Returns the single source of truth for the currently-signed-in user.
 * Profile + role come from `public.profiles` and the `get_user_role` RPC.
 */
export const getCurrentUser = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CurrentUser> => {
    const { supabase, userId, claims } = context;

    // Profile row is auto-created by the `handle_new_user` trigger on signup.
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, email, status, last_login, created_at")
      .eq("id", userId)
      .maybeSingle();

    // Role is read via service role (security-definer) because `get_user_role`
    // is locked down. We bounce through the admin client only for this RPC.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roleSlug } = await supabaseAdmin.rpc("get_user_role", {
      _user_id: userId,
    });

    const role: AppRole = roleSlug ? (ROLE_DB_TO_APP[roleSlug] ?? "Viewer") : "Viewer";
    const email =
      profile?.email ||
      (typeof claims.email === "string" ? claims.email : "") ||
      "";
    const metaName =
      (claims.user_metadata as { name?: string; full_name?: string } | undefined)?.name ??
      (claims.user_metadata as { name?: string; full_name?: string } | undefined)?.full_name ??
      "";
    const name = profile?.name || metaName || email || "Pengguna";

    // Best-effort last-login bookkeeping.
    void supabase
      .from("profiles")
      .update({ last_login: new Date().toISOString() })
      .eq("id", userId);

    return {
      userId,
      name,
      email,
      role,
      permissions: ROLE_PERMISSIONS[role] ?? [],
      status: profile?.status ?? "Aktif",
      lastLogin: profile?.last_login ?? null,
      createdAt: profile?.created_at ?? null,
    };
  });

/**
 * Lists all users for the Manajemen User module. Admins see everyone;
 * Staff TU and Viewer only see themselves (so the page still works without
 * exposing PII they shouldn't reach).
 */
export const listManagedUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ManagedUser[]> => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: callerRole } = await supabaseAdmin.rpc("get_user_role", {
      _user_id: userId,
    });
    const isAdmin = callerRole === "admin";

    const profileQuery = supabaseAdmin
      .from("profiles")
      .select("id, name, email, status, last_login, created_at")
      .order("created_at", { ascending: false });

    const { data: profiles, error } = isAdmin
      ? await profileQuery
      : await profileQuery.eq("id", userId);

    if (error) {
      console.error("[listManagedUsers] profiles error", error);
      throw new Error("Gagal memuat daftar pengguna.");
    }

    if (!profiles || profiles.length === 0) return [];

    const ids = profiles.map((p) => p.id);
    const { data: roleRows } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", ids);

    const roleByUser = new Map<string, string>();
    for (const r of roleRows ?? []) {
      // Highest-privilege role wins when a user has multiple.
      const priority: Record<string, number> = { admin: 3, staff_tu: 2, viewer: 1 };
      const existing = roleByUser.get(r.user_id);
      if (!existing || (priority[r.role] ?? 0) > (priority[existing] ?? 0)) {
        roleByUser.set(r.user_id, r.role);
      }
    }

    return profiles.map((p) => {
      const slug = roleByUser.get(p.id) ?? "viewer";
      const role: AppRole = ROLE_DB_TO_APP[slug] ?? "Viewer";
      return {
        id: p.id,
        name: p.name || p.email || "Pengguna",
        email: p.email,
        role,
        status: p.status ?? "Aktif",
        lastLogin: p.last_login ?? null,
        createdAt: p.created_at ?? null,
      };
    });
  });
