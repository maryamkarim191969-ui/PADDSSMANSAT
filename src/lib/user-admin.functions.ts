/**
 * Admin-only user management server functions:
 *   - updateManagedUser: change role / status / name for any user
 *   - deleteManagedUser: remove a user (auth + cascading public rows)
 *   - resetUserPassword: trigger a password-reset email via Auth Admin API
 *
 * Authorization is enforced server-side by checking `has_role(_user_id, 'admin')`
 * via the authenticated context — never trust the client.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { writeLogEntry } from "@/lib/log-aktivitas.functions";

type AppSupabase = SupabaseClient<Database>;

const APP_TO_DB_ROLE = {
  Admin: "admin",
  "Staff TU": "staff_tu",
  Viewer: "viewer",
} as const;

const ROLE_LABELS = Object.keys(APP_TO_DB_ROLE) as Array<keyof typeof APP_TO_DB_ROLE>;

async function assertAdmin(supabase: AppSupabase, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(`Gagal memeriksa peran: ${error.message}`);
  if (data !== true) {
    throw new Error("Forbidden: hanya Admin yang dapat mengelola pengguna.");
  }
}

const UpdateInput = z.object({
  userId: z.string().uuid(),
  role: z.enum(["Admin", "Staff TU", "Viewer"]).optional(),
  status: z.enum(["Aktif", "Nonaktif"]).optional(),
  name: z.string().trim().min(1).max(120).optional(),
});

export type UpdateManagedUserInput = z.infer<typeof UpdateInput>;

export const updateManagedUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdateInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    const changes: string[] = [];

    // ----- role -----
    if (data.role) {
      const dbRole = APP_TO_DB_ROLE[data.role];
      // Replace role rows for this user with the single new role.
      const { error: delErr } = await context.supabase
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId);
      if (delErr) throw new Error(`Gagal menghapus peran lama: ${delErr.message}`);
      const { error: insErr } = await context.supabase
        .from("user_roles")
        .insert({ user_id: data.userId, role: dbRole });
      if (insErr) throw new Error(`Gagal menetapkan peran baru: ${insErr.message}`);
      changes.push(`role → ${data.role}`);
    }

    // ----- profile (name / status) -----
    const profilePatch: Record<string, string> = {};
    if (data.name) profilePatch.name = data.name;
    if (data.status) profilePatch.status = data.status;
    if (Object.keys(profilePatch).length > 0) {
      // Use the admin client only for fields the authenticated user cannot
      // update under RLS (admin can manage any profile).
      const { supabaseAdmin } = await import(
        "@/integrations/supabase/client.server"
      );
      const { error: upErr } = await supabaseAdmin
        .from("profiles")
        .update(profilePatch)
        .eq("id", data.userId);
      if (upErr) throw new Error(`Gagal memperbarui profil: ${upErr.message}`);
      if (data.name) changes.push(`nama → ${data.name}`);
      if (data.status) changes.push(`status → ${data.status}`);
    }

    if (changes.length === 0) {
      return { ok: true, changes: [] };
    }

    await writeLogEntry(context.supabase, context.userId, {
      action: "user.update",
      detail: `Memperbarui pengguna: ${changes.join(", ")}`,
      modul: "User",
      targetId: data.userId,
      status: "Berhasil",
    });

    return { ok: true, changes };
  });

const DeleteInput = z.object({ userId: z.string().uuid() });

export const deleteManagedUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => DeleteInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.userId === context.userId) {
      throw new Error("Anda tidak dapat menghapus akun Anda sendiri.");
    }

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    // Snapshot the email so the log has something readable after delete.
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("name, email")
      .eq("id", data.userId)
      .maybeSingle();

    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(`Gagal menghapus user: ${error.message}`);

    // profiles + user_roles rows cascade via ON DELETE CASCADE on auth.users.

    await writeLogEntry(context.supabase, context.userId, {
      action: "user.delete",
      detail: `Menghapus pengguna ${profile?.name ?? profile?.email ?? data.userId}`,
      modul: "User",
      targetId: data.userId,
      status: "Berhasil",
    });

    return { ok: true };
  });

const ResetInput = z.object({ userId: z.string().uuid() });

export const resetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ResetInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("id", data.userId)
      .maybeSingle();
    if (!profile?.email) throw new Error("Email pengguna tidak ditemukan.");

    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: profile.email,
    });
    if (error) throw new Error(`Gagal mengirim link reset: ${error.message}`);

    await writeLogEntry(context.supabase, context.userId, {
      action: "user.reset_password",
      detail: `Mengirim link reset password ke ${profile.email}`,
      modul: "User",
      targetId: data.userId,
      status: "Berhasil",
    });

    return { ok: true, email: profile.email };
  });

// Re-export available roles for typed UI selects.
export const MANAGED_ROLES = ROLE_LABELS;