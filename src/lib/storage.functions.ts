/**
 * Storage server functions — the only bridge between the client and the
 * Storage Adapter (Cloudflare R2). Every file operation (upload via
 * presigned PUT, preview, download, delete) flows through here.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import {
  ALLOWED_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  buildStoragePath,
} from "./storage/storage-adapter";

type AppSupabase = SupabaseClient<Database>;

const WRITE_ROLES = ["staff_tu", "admin"] as const;

async function assertWriteRole(supabase: AppSupabase, userId: string) {
  for (const role of WRITE_ROLES) {
    const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: role });
    if (data === true) return;
  }
  throw new Error("Forbidden: hanya staff_tu / admin yang boleh mengunggah arsip.");
}

/* ------------------------------------------------------------------ */
/* UPLOAD                                                              */
/* ------------------------------------------------------------------ */

const UploadUrlInput = z.object({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(180),
  size: z.number().int().nonnegative().max(MAX_UPLOAD_BYTES),
  tahun: z.number().int().min(1900).max(2200),
});

export type RequestUploadResult = {
  uploadUrl: string;
  storagePath: string;
  bucket: string;
  storageProvider: "r2";
  expiresIn: number;
  method: "PUT";
};

export const requestUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UploadUrlInput.parse(input))
  .handler(async ({ data, context }): Promise<RequestUploadResult> => {
    await assertWriteRole(context.supabase, context.userId);

    if (!ALLOWED_MIME_TYPES.has(data.mimeType)) {
      throw new Error(`Tipe file tidak diizinkan: ${data.mimeType}`);
    }

    const { getStorage } = await import("./storage/index.server");
    const storage = getStorage();

    const { storagePath } = buildStoragePath({
      tahun: data.tahun,
      fileName: data.fileName,
    });

    const signed = await storage.getSignedUrl(storagePath, {
      mode: "put",
      contentType: data.mimeType,
      expiresIn: 600,
    });

    return {
      uploadUrl: signed.url,
      storagePath,
      bucket: storage.bucket,
      storageProvider: "r2",
      expiresIn: signed.expiresIn,
      method: "PUT",
    };
  });

/* ------------------------------------------------------------------ */
/* PREVIEW / DOWNLOAD                                                  */
/* ------------------------------------------------------------------ */

const ArsipIdInput = z.object({ arsipId: z.string().uuid() });

type ArsipFileRow = {
  storage_path: string | null;
  file_name: string | null;
  mime_type: string | null;
  pdf_url: string | null;
  nomor_surat: string;
};

async function loadArsipFile(supabase: AppSupabase, arsipId: string): Promise<ArsipFileRow> {
  const { data, error } = await supabase
    .from("arsip")
    .select("storage_path, file_name, mime_type, pdf_url, nomor_surat")
    .eq("id", arsipId)
    .maybeSingle();

  if (error) throw new Error(`Gagal membaca metadata arsip: ${error.message}`);
  if (!data) throw new Error("Arsip tidak ditemukan.");
  return data as ArsipFileRow;
}

function resolveStoragePath(row: ArsipFileRow): string {
  // Modern path: storage_path is authoritative.
  if (row.storage_path && row.storage_path.trim()) return row.storage_path.trim();
  // Legacy fallback: rows created before this sprint stored the key in pdf_url.
  if (row.pdf_url && row.pdf_url.trim()) return row.pdf_url.trim();
  throw new Error("Arsip ini belum memiliki file yang tersimpan.");
}

export type SignedAccessResult = {
  url: string;
  expiresIn: number;
  fileName: string;
  mimeType: string | null;
};

export const getPreviewUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ArsipIdInput.parse(input))
  .handler(async ({ data, context }): Promise<SignedAccessResult> => {
    const row = await loadArsipFile(context.supabase, data.arsipId);
    const key = resolveStoragePath(row);

    const { getStorage, StorageObjectNotFoundError } = await import("./storage/index.server");
    const storage = getStorage();

    if (!(await storage.exists(key))) {
      console.error("[storage] preview missed", { arsipId: data.arsipId, key });
      throw new StorageObjectNotFoundError(key);
    }

    const signed = await storage.preview(key, {
      expiresIn: 300,
      contentType: row.mime_type ?? undefined,
    });
    return {
      url: signed.url,
      expiresIn: signed.expiresIn,
      fileName: row.file_name ?? `${row.nomor_surat}`,
      mimeType: row.mime_type ?? null,
    };
  });

export const getDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ArsipIdInput.parse(input))
  .handler(async ({ data, context }): Promise<SignedAccessResult> => {
    const row = await loadArsipFile(context.supabase, data.arsipId);
    const key = resolveStoragePath(row);

    const { getStorage, StorageObjectNotFoundError } = await import("./storage/index.server");
    const storage = getStorage();

    if (!(await storage.exists(key))) {
      console.error("[storage] download missed", { arsipId: data.arsipId, key });
      throw new StorageObjectNotFoundError(key);
    }

    const downloadAs = row.file_name ?? `${row.nomor_surat}`;
    const signed = await storage.getSignedUrl(key, {
      mode: "get",
      expiresIn: 300,
      downloadAs,
      contentType: row.mime_type ?? undefined,
    });
    return {
      url: signed.url,
      expiresIn: signed.expiresIn,
      fileName: downloadAs,
      mimeType: row.mime_type ?? null,
    };
  });

/* ------------------------------------------------------------------ */
/* DELETE                                                              */
/* ------------------------------------------------------------------ */

export type DeleteArsipResult = {
  id: string;
  fileDeleted: boolean;
  metadataDeleted: boolean;
};

/**
 * Delete an arsip atomically:
 * 1) Read the storage path
 * 2) Delete the database row (RLS enforces admin-only)
 * 3) Delete the file from Cloudflare R2. If this fails we log it; we do NOT
 *    re-insert metadata (per spec, leave a tracked failure rather than orphans).
 */
export const deleteArsip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ArsipIdInput.parse(input))
  .handler(async ({ data, context }): Promise<DeleteArsipResult> => {
    const supabase = context.supabase as AppSupabase;

    const row = await loadArsipFile(supabase, data.arsipId);
    const key = (() => {
      try {
        return resolveStoragePath(row);
      } catch {
        return null;
      }
    })();

    const { error: delErr } = await supabase
      .from("arsip")
      .delete()
      .eq("id", data.arsipId);

    if (delErr) {
      throw new Error(`Gagal menghapus metadata arsip: ${delErr.message}`);
    }

    let fileDeleted = false;
    if (key) {
      try {
        const { getStorage } = await import("./storage/index.server");
        await getStorage().delete(key);
        fileDeleted = true;
      } catch (err) {
        console.error("[deleteArsip] file delete failed — orphan in R2", {
          arsipId: data.arsipId,
          key,
          err,
        });
      }
    }

    return { id: data.arsipId, fileDeleted, metadataDeleted: true };
  });
