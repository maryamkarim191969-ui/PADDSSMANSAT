/**
 * Backup & Restore server functions.
 *
 * Strategy: a backup is a JSON snapshot of every primary table in `public`
 * (arsip metadata, kategori, lokasi, profiles, user_roles, qr_code,
 * log_aktivitas, system_settings, backup index). The blob is uploaded to
 * Cloudflare R2 under `backups/<timestamp>.json` and indexed in
 * `public.backup`. Restore re-applies the snapshot by upserting rows.
 *
 * R2 is treated as the durable store — no file is kept inside the database
 * itself. Only admins may create / restore / delete backups.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { writeLogEntry } from "@/lib/log-aktivitas.functions";

type AppSupabase = SupabaseClient<Database>;

async function assertAdmin(supabase: AppSupabase, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(`Gagal memeriksa peran: ${error.message}`);
  if (data !== true) throw new Error("Forbidden: hanya Admin yang dapat mengelola backup.");
}

/* ---------------------------------------------------------------- */
/* TYPES                                                              */
/* ---------------------------------------------------------------- */

export type BackupRow = {
  id: string;
  name: string;
  scope: string;
  size: string;
  bytes: number | null;
  type: "Manual" | "Auto Harian" | "Auto Mingguan" | "Auto Bulanan";
  status: "Berhasil" | "Gagal" | "Proses";
  storagePath: string | null;
  createdAt: string;
};

const BACKUP_TABLES = [
  "kategori",
  "lokasi",
  "arsip",
  "qr_code",
  "profiles",
  "user_roles",
  "log_aktivitas",
  "system_settings",
  "backup",
] as const;

type BackupTable = (typeof BACKUP_TABLES)[number];

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function mapRow(r: {
  id: string;
  name: string;
  scope: string;
  size: string;
  type: string;
  status: string;
  bytes: number | null;
  storage_path: string | null;
  created_at: string;
}): BackupRow {
  return {
    id: r.id,
    name: r.name,
    scope: r.scope,
    size: r.size,
    bytes: r.bytes,
    type: (r.type as BackupRow["type"]) ?? "Manual",
    status: (r.status as BackupRow["status"]) ?? "Berhasil",
    storagePath: r.storage_path,
    createdAt: r.created_at,
  };
}

/* ---------------------------------------------------------------- */
/* LIST                                                               */
/* ---------------------------------------------------------------- */

export const listBackups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BackupRow[]> => {
    const { data, error } = await context.supabase
      .from("backup")
      .select("id, name, scope, size, type, status, bytes, storage_path, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error("[listBackups]", error);
      return [];
    }
    return (data ?? []).map((r) => mapRow(r as Parameters<typeof mapRow>[0]));
  });

/* ---------------------------------------------------------------- */
/* CREATE                                                             */
/* ---------------------------------------------------------------- */

async function dumpTables(supabase: AppSupabase): Promise<Record<string, unknown[]>> {
  const out: Record<string, unknown[]> = {};
  for (const t of BACKUP_TABLES) {
    const { data, error } = await supabase.from(t as BackupTable).select("*").limit(50_000);
    if (error) {
      console.warn(`[backup] skip ${t}: ${error.message}`);
      continue;
    }
    out[t] = data ?? [];
  }
  return out;
}

export const createBackup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BackupRow> => {
    await assertAdmin(context.supabase, context.userId);

    const now = new Date();
    const stamp = now.toISOString().replace(/[:.]/g, "-");
    const fileName = `sipastera-${stamp}.json`;
    const storagePath = `backups/${fileName}`;

    const snapshot = {
      meta: {
        createdAt: now.toISOString(),
        version: 1,
        tables: BACKUP_TABLES,
      },
      data: await dumpTables(context.supabase),
    };
    const payload = new TextEncoder().encode(JSON.stringify(snapshot));
    const bytes = payload.byteLength;

    const { getStorage } = await import("./storage/index.server");
    const storage = getStorage();
    await storage.upload({
      storagePath,
      body: payload,
      contentType: "application/json",
    });

    const insert = {
      name: fileName,
      scope: "Full",
      size: formatBytes(bytes),
      type: "Manual",
      status: "Berhasil",
      bytes,
      storage_path: storagePath,
    };
    const { data, error } = await context.supabase
      .from("backup")
      .insert(insert)
      .select("id, name, scope, size, type, status, bytes, storage_path, created_at")
      .single();
    if (error) throw new Error(`Backup tersimpan di R2 tapi gagal dicatat: ${error.message}`);

    await writeLogEntry(context.supabase, context.userId, {
      action: "backup.create",
      detail: `Membuat backup ${fileName} (${formatBytes(bytes)})`,
      modul: "Pengaturan",
      targetId: data.id as string,
      status: "Berhasil",
    });

    return mapRow(data as Parameters<typeof mapRow>[0]);
  });

/* ---------------------------------------------------------------- */
/* DOWNLOAD                                                           */
/* ---------------------------------------------------------------- */

const IdInput = z.object({ id: z.string().uuid() });

export const getBackupDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IdInput.parse(input))
  .handler(async ({ data, context }): Promise<{ url: string; fileName: string }> => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("backup")
      .select("name, storage_path")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !row) throw new Error("Backup tidak ditemukan.");
    if (!row.storage_path) throw new Error("Backup ini belum tersimpan di storage.");
    const { getStorage } = await import("./storage/index.server");
    const signed = await getStorage().getSignedUrl(row.storage_path, {
      mode: "get",
      expiresIn: 600,
      downloadAs: row.name ?? "backup.json",
      contentType: "application/json",
    });
    return { url: signed.url, fileName: row.name ?? "backup.json" };
  });

/* ---------------------------------------------------------------- */
/* DELETE                                                             */
/* ---------------------------------------------------------------- */

export const deleteBackup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IdInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row } = await context.supabase
      .from("backup")
      .select("storage_path, name")
      .eq("id", data.id)
      .maybeSingle();
    const { error: delErr } = await context.supabase
      .from("backup")
      .delete()
      .eq("id", data.id);
    if (delErr) throw new Error(`Gagal menghapus backup: ${delErr.message}`);
    if (row?.storage_path) {
      try {
        const { getStorage } = await import("./storage/index.server");
        await getStorage().delete(row.storage_path);
      } catch (err) {
        console.error("[deleteBackup] orphan in R2", err);
      }
    }
    await writeLogEntry(context.supabase, context.userId, {
      action: "backup.delete",
      detail: `Menghapus backup ${row?.name ?? data.id}`,
      modul: "Pengaturan",
      targetId: data.id,
      status: "Berhasil",
    });
    return { ok: true };
  });

/* ---------------------------------------------------------------- */
/* RESTORE                                                            */
/* ---------------------------------------------------------------- */

const RestoreInput = z.object({ id: z.string().uuid() });

const RESTORE_TABLES: BackupTable[] = [
  "kategori",
  "lokasi",
  "arsip",
  "qr_code",
  "system_settings",
];

export const restoreBackup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RestoreInput.parse(input))
  .handler(async ({ data, context }): Promise<{ restored: Record<string, number> }> => {
    await assertAdmin(context.supabase, context.userId);

    const { data: row, error } = await context.supabase
      .from("backup")
      .select("storage_path, name")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !row || !row.storage_path) {
      throw new Error("Backup tidak ditemukan atau belum tersimpan di storage.");
    }

    const { getStorage } = await import("./storage/index.server");
    const dl = await getStorage().download(row.storage_path);
    if (!dl.body) throw new Error("File backup kosong.");
    const reader = dl.body.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const buf = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
    let off = 0;
    for (const c of chunks) {
      buf.set(c, off);
      off += c.length;
    }
    const text = new TextDecoder().decode(buf);
    const snapshot = JSON.parse(text) as { data: Record<string, unknown[]> };

    const restored: Record<string, number> = {};
    for (const t of RESTORE_TABLES) {
      const rows = snapshot.data?.[t];
      if (!Array.isArray(rows) || rows.length === 0) {
        restored[t] = 0;
        continue;
      }
      const { error: upErr } = await context.supabase
        .from(t)
        .upsert(rows as never, { onConflict: "id" });
      if (upErr) {
        console.error(`[restoreBackup] ${t}:`, upErr);
        restored[t] = -1;
      } else {
        restored[t] = rows.length;
      }
    }

    await writeLogEntry(context.supabase, context.userId, {
      action: "backup.restore",
      detail: `Restore dari ${row.name ?? data.id}`,
      modul: "Pengaturan",
      targetId: data.id,
      status: "Berhasil",
    });

    return { restored };
  });