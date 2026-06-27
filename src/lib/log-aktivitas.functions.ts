/**
 * Activity-log server functions — single source of truth for
 * `public.log_aktivitas`. Every module that writes a meaningful audit
 * trail entry funnels through `recordEvent`. The Log Aktivitas page,
 * Dashboard activity feed, and user detail page all read through
 * `listActivityLog`.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type AppSupabase = SupabaseClient<Database>;

export type ActivityJenis =
  | "Login"
  | "Upload"
  | "Edit"
  | "Hapus"
  | "Lihat"
  | "Export";
export type ActivityStatus = "Berhasil" | "Gagal";
export type ActivityModul =
  | "Auth"
  | "Arsip"
  | "Kategori"
  | "Lokasi Fisik"
  | "Upload"
  | "Import"
  | "Pengaturan"
  | "Statistik"
  | "User";

export type ActivityLogRow = {
  id: string;
  user: string;
  role: string;
  aktivitas: string;
  jenis: ActivityJenis;
  modul: ActivityModul;
  waktu: string;
  status: ActivityStatus;
  ip: string;
  detail: string;
};

const RecordInput = z.object({
  action: z.string().trim().min(1).max(120),
  detail: z.string().trim().max(2000).optional().nullable(),
  modul: z.string().trim().max(60).optional().nullable(),
  toolName: z.string().trim().max(120).optional().nullable(),
  targetId: z.string().trim().max(120).optional().nullable(),
  status: z.enum(["Berhasil", "Gagal"]).default("Berhasil"),
});

/**
 * Internal helper — write a single log row using the authenticated
 * Supabase client (RLS allows insert when user_id matches auth.uid()).
 * Never throws — logging failures must not break user-facing flows.
 */
export async function writeLogEntry(
  supabase: AppSupabase,
  userId: string,
  row: {
    action: string;
    detail?: string | null;
    modul?: string | null;
    toolName?: string | null;
    targetId?: string | null;
    status?: ActivityStatus;
  },
): Promise<void> {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", userId)
      .maybeSingle();
    const userName = profile?.name || profile?.email || "Pengguna";
    await supabase.from("log_aktivitas").insert({
      user_id: userId,
      user_name: userName,
      action: row.action,
      detail: row.detail ?? null,
      tool_name: row.toolName ?? null,
      target_id: row.targetId ?? null,
      status: row.status ?? "Berhasil",
      source: row.modul ?? "Sistem",
    });
  } catch (err) {
    console.error("[writeLogEntry] failed to insert", err);
  }
}

export const recordEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RecordInput.parse(input))
  .handler(async ({ data, context }) => {
    await writeLogEntry(context.supabase, context.userId, {
      action: data.action,
      detail: data.detail,
      modul: data.modul,
      toolName: data.toolName,
      targetId: data.targetId,
      status: data.status,
    });
    return { ok: true };
  });

/* ---------------------------------------------------------------- */
/* READ                                                              */
/* ---------------------------------------------------------------- */

function deriveJenis(action: string): ActivityJenis {
  const a = action.toLowerCase();
  if (a.includes("login") || a.includes("logout") || a.includes("sign")) return "Login";
  if (a.includes("upload")) return "Upload";
  if (a.includes("hapus") || a.includes("delete")) return "Hapus";
  if (a.includes("edit") || a.includes("update") || a.includes("ubah")) return "Edit";
  if (a.includes("export") || a.includes("ekspor")) return "Export";
  return "Lihat";
}

function deriveModul(source: string | null, action: string): ActivityModul {
  const s = (source ?? "").toLowerCase();
  if (s.includes("auth")) return "Auth";
  if (s.includes("upload")) return "Upload";
  if (s.includes("import")) return "Import";
  if (s.includes("user")) return "User";
  if (s.includes("kategori")) return "Kategori";
  if (s.includes("lokasi")) return "Lokasi Fisik";
  if (s.includes("setting") || s.includes("pengaturan")) return "Pengaturan";
  if (s.includes("statistik")) return "Statistik";
  if (s.includes("arsip")) return "Arsip";
  const a = action.toLowerCase();
  if (a.includes("login") || a.includes("logout")) return "Auth";
  if (a.includes("upload")) return "Upload";
  if (a.includes("arsip")) return "Arsip";
  return "Arsip";
}

export const listActivityLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ActivityLogRow[]> => {
    const { data, error } = await context.supabase
      .from("log_aktivitas")
      .select(
        "id, user_id, user_name, action, detail, tool_name, target_id, status, source, at",
      )
      .order("at", { ascending: false })
      .limit(500);
    if (error) {
      console.error("[listActivityLog]", error);
      return [];
    }
    type Row = {
      id: string;
      user_id: string | null;
      user_name: string | null;
      action: string;
      detail: string | null;
      tool_name: string | null;
      target_id: string | null;
      status: string;
      source: string;
      at: string;
    };
    return ((data ?? []) as Row[]).map((r): ActivityLogRow => ({
      id: r.id,
      user: r.user_name || "Sistem",
      role: "",
      aktivitas: r.detail || r.action,
      jenis: deriveJenis(r.action),
      modul: deriveModul(r.source, r.action),
      waktu: r.at,
      status: (r.status === "Gagal" ? "Gagal" : "Berhasil") as ActivityStatus,
      ip: "-",
      detail: r.detail || r.action,
    }));
  });