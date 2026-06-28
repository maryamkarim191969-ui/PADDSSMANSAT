/**
 * System-wide server functions: storage monitoring, persisted Pengaturan,
 * and activity-log management (admin purge / per-row delete). All writes
 * are admin-only; reads require an authenticated session.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { writeLogEntry } from "@/lib/log-aktivitas.functions";

type AppSupabase = SupabaseClient<Database>;

const SETTINGS_ID = "global";

async function assertAdmin(supabase: AppSupabase, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(`Gagal memeriksa peran: ${error.message}`);
  if (data !== true) throw new Error("Forbidden: hanya Admin yang diizinkan.");
}

/* ---------------------------------------------------------------- */
/* STORAGE MONITORING                                                 */
/* ---------------------------------------------------------------- */

export type StorageStats = {
  provider: "r2";
  bucket: string;
  objectCount: number;
  usedBytes: number;
  totalBytes: number;
};

function readTotalCapacityBytes(): number {
  const gb = Number(process.env.R2_TOTAL_CAPACITY_GB ?? "10");
  const safe = Number.isFinite(gb) && gb > 0 ? gb : 10;
  return Math.round(safe * 1024 * 1024 * 1024);
}

export const getStorageStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<StorageStats> => {
    const { getStorage } = await import("./storage/index.server");
    const storage = getStorage();
    const stats = await storage.getStats("arsip/");
    return {
      provider: "r2",
      bucket: storage.bucket,
      objectCount: stats.objectCount,
      usedBytes: stats.totalBytes,
      totalBytes: readTotalCapacityBytes(),
    };
  });

/* ---------------------------------------------------------------- */
/* SYSTEM SETTINGS                                                    */
/* ---------------------------------------------------------------- */

const SettingsSchema = z.record(z.string(), z.unknown());

export const getSystemSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Record<string, unknown> | null> => {
    const { data, error } = await context.supabase
      .from("system_settings")
      .select("value")
      .eq("id", SETTINGS_ID)
      .maybeSingle();
    if (error) {
      console.error("[getSystemSettings]", error);
      return null;
    }
    return ((data?.value as Record<string, unknown> | null) ?? null);
  });

export const saveSystemSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SettingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("system_settings")
      .upsert(
        {
          id: SETTINGS_ID,
          value: data,
          updated_at: new Date().toISOString(),
          updated_by: context.userId,
        },
        { onConflict: "id" },
      );
    if (error) throw new Error(`Gagal menyimpan pengaturan: ${error.message}`);
    await writeLogEntry(context.supabase, context.userId, {
      action: "settings.save",
      detail: "Memperbarui pengaturan sistem",
      modul: "Pengaturan",
      status: "Berhasil",
    });
    return { ok: true };
  });

/* ---------------------------------------------------------------- */
/* ACTIVITY LOG MANAGEMENT                                            */
/* ---------------------------------------------------------------- */

const PurgeInput = z.object({
  olderThanDays: z.number().int().min(0).max(3650),
});

export const purgeActivityLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PurgeInput.parse(input))
  .handler(async ({ data, context }): Promise<{ deleted: number }> => {
    await assertAdmin(context.supabase, context.userId);
    const cutoff = new Date(Date.now() - data.olderThanDays * 86_400_000).toISOString();
    const query =
      data.olderThanDays === 0
        ? context.supabase
            .from("log_aktivitas")
            .delete()
            .not("id", "is", null)
            .select("id")
        : context.supabase
            .from("log_aktivitas")
            .delete()
            .lt("at", cutoff)
            .select("id");
    const { data: deleted, error } = await query;
    if (error) throw new Error(`Gagal membersihkan log: ${error.message}`);
    const count = (deleted ?? []).length;
    await writeLogEntry(context.supabase, context.userId, {
      action: "log.purge",
      detail:
        data.olderThanDays === 0
          ? `Membersihkan seluruh log aktivitas (${count} baris)`
          : `Membersihkan log lebih lama dari ${data.olderThanDays} hari (${count} baris)`,
      modul: "Pengaturan",
      status: "Berhasil",
    });
    return { deleted: count };
  });

const DeleteLogInput = z.object({ id: z.string().uuid() });

export const deleteActivityLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => DeleteLogInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("log_aktivitas")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(`Gagal menghapus log: ${error.message}`);
    return { ok: true };
  });