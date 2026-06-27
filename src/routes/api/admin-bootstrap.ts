import { createFileRoute } from "@tanstack/react-router";

/**
 * Idempotent Administrator seeding endpoint.
 *
 * Public route (under /api/public/* would also work, but this endpoint
 * performs only a strictly defined, idempotent operation: ensure the
 * Administrator account exists). It uses the same authentication backend
 * as every other user (no login bypass): we call the standard Auth Admin
 * API to mint a real Supabase user record, then assign the `admin` role
 * through the same `public.user_roles` table the rest of the app reads
 * from. Once seeded, the admin signs in through the normal login form
 * and every module (Dashboard, Upload, AI Assistant, …) reads the
 * unified identity via `getCurrentUser` / `useCurrentUser`.
 *
 * Reads `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` env vars when
 * present (recommended for production) and falls back to the development
 * defaults requested by the operator otherwise. The password can be
 * rotated at any time from Manajemen User without touching the source.
 */

const FALLBACK_EMAIL = "zulfekarpalada@gmail.com";
const FALLBACK_PASSWORD = "taufik711";

async function bootstrap() {
  const email = (process.env.ADMIN_BOOTSTRAP_EMAIL ?? FALLBACK_EMAIL).trim();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? FALLBACK_PASSWORD;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Look up existing user via the Admin API. The Admin API is rate-limited
  // but listUsers + filter is the documented way to check email existence.
  let existingId: string | null = null;
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (error) throw error;
    const match = data.users.find(
      (u) => (u.email ?? "").toLowerCase() === email.toLowerCase(),
    );
    if (match) existingId = match.id;
  } catch (e) {
    console.error("[admin-bootstrap] listUsers", e);
  }

  let userId = existingId;
  let created = false;

  if (!userId) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "Administrator" },
    });
    if (error || !data.user) {
      throw new Error(`createUser failed: ${error?.message ?? "unknown"}`);
    }
    userId = data.user.id;
    created = true;
  }

  // Ensure the admin role exists (idempotent — table has UNIQUE(user_id, role)).
  const { error: roleErr } = await supabaseAdmin
    .from("user_roles")
    .upsert(
      { user_id: userId, role: "admin" },
      { onConflict: "user_id,role", ignoreDuplicates: true },
    );
  if (roleErr) {
    console.error("[admin-bootstrap] role upsert", roleErr);
    throw new Error(`role upsert failed: ${roleErr.message}`);
  }

  // Ensure the profile row reflects the admin identity.
  await supabaseAdmin.from("profiles").upsert(
    {
      id: userId,
      name: "Administrator",
      email,
      status: "Aktif",
    },
    { onConflict: "id" },
  );

  return { ok: true, created, email, userId };
}

export const Route = createFileRoute("/api/admin-bootstrap")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const result = await bootstrap();
          return Response.json(result);
        } catch (e) {
          console.error("[admin-bootstrap]", e);
          return Response.json(
            { ok: false, error: (e as Error).message },
            { status: 500 },
          );
        }
      },
      POST: async () => {
        try {
          const result = await bootstrap();
          return Response.json(result);
        } catch (e) {
          console.error("[admin-bootstrap]", e);
          return Response.json(
            { ok: false, error: (e as Error).message },
            { status: 500 },
          );
        }
      },
    },
  },
});
