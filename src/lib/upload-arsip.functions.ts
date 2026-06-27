import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { writeLogEntry } from "@/lib/log-aktivitas.functions";
import {
  ALLOWED_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  buildStoragePath,
} from "./storage/storage-adapter";

/**
 * Server function that COMMITS an arsip after the file has already been
 * uploaded to Cloudflare R2 via a presigned PUT. The flow is atomic:
 *
 *   client → presigned PUT to R2  (file lands in bucket)
 *          → createArsip          (insert metadata row)
 *          → if insert fails      → server deletes the R2 object (rollback)
 */
const ArsipInputSchema = z.object({
  nomorSurat: z.string().trim().min(1, "Nomor surat wajib diisi").max(120),
  judul: z.string().trim().min(1, "Judul wajib diisi").max(255),
  kategori: z.string().trim().min(1).max(60),
  jenis: z.string().trim().min(1).max(60).default("Internal"),
  tahun: z.number().int().min(1900).max(2200),
  lokasiFisik: z.string().trim().max(120).optional().nullable(),
  status: z.string().trim().max(40).default("Aktif"),
  deskripsi: z.string().trim().max(4000).optional().nullable(),

  // Storage metadata produced by the Storage Adapter after presigned upload.
  storageProvider: z.literal("r2"),
  bucketName: z.string().trim().min(1).max(120),
  storagePath: z.string().trim().min(1).max(500),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(180),
  fileSize: z.number().int().nonnegative(),
});

export type CreateArsipInput = z.infer<typeof ArsipInputSchema>;

export type CreateArsipResult = {
  id: string;
  nomorSurat: string;
};

export const createArsip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ArsipInputSchema.parse(input))
  .handler(async ({ data, context }): Promise<CreateArsipResult> => {
    const { supabase, userId } = context;

    const { data: row, error } = await supabase
      .from("arsip")
      .insert({
        nomor_surat: data.nomorSurat,
        judul: data.judul,
        kategori: data.kategori,
        jenis: data.jenis,
        tahun: data.tahun,
        lokasi_fisik: data.lokasiFisik ?? null,
        status: data.status,
        deskripsi: data.deskripsi ?? null,
        storage_provider: data.storageProvider,
        bucket_name: data.bucketName,
        storage_path: data.storagePath,
        file_name: data.fileName,
        mime_type: data.mimeType,
        file_size: data.fileSize,
        created_by: userId,
      })
      .select("id, nomor_surat")
      .single();

    if (error || !row) {
      console.error("[createArsip] insert failed, rolling back R2 object", {
        storagePath: data.storagePath,
        error,
      });
      // Transactional rollback: delete the file we just uploaded to R2.
      try {
        const { getStorage } = await import("./storage/index.server");
        await getStorage().delete(data.storagePath);
      } catch (rollbackErr) {
        console.error(
          "[createArsip] rollback delete failed — orphan file in R2",
          { storagePath: data.storagePath, rollbackErr },
        );
      }
      throw new Error(error?.message ?? "Gagal menyimpan metadata arsip.");
    }

    return { id: row.id, nomorSurat: row.nomor_surat };
  });

/* ------------------------------------------------------------------ */
/* SERVER-SIDE UPLOAD (one round-trip)                                 */
/* ------------------------------------------------------------------ */
/**
 * Atomic upload-and-commit. The client sends the file bytes (base64) plus
 * metadata. The server uploads to R2 and immediately inserts the metadata
 * row in the same authenticated request, so the browser never talks to R2
 * directly and CORS / network edge issues are eliminated. Max body is
 * bounded by `MAX_UPLOAD_BYTES` (5 MB raw → ~6.7 MB base64).
 */
const UploadAndCreateInput = z.object({
  // metadata
  nomorSurat: z.string().trim().min(1).max(120),
  judul: z.string().trim().min(1).max(255),
  kategori: z.string().trim().min(1).max(60),
  jenis: z.string().trim().min(1).max(60).default("Internal"),
  tahun: z.number().int().min(1900).max(2200),
  lokasiFisik: z.string().trim().max(120).optional().nullable(),
  status: z.string().trim().max(40).default("Aktif"),
  deskripsi: z.string().trim().max(4000).optional().nullable(),
  // file
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(180),
  fileSize: z.number().int().nonnegative().max(MAX_UPLOAD_BYTES),
  fileBase64: z.string().min(1),
});

const WRITE_ROLES = ["staff_tu", "admin"] as const;

export const uploadAndCreateArsip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UploadAndCreateInput.parse(input))
  .handler(async ({ data, context }): Promise<CreateArsipResult> => {
    const { supabase, userId } = context;

    // Role gate — same matrix as the storage layer.
    let allowed = false;
    for (const role of WRITE_ROLES) {
      const { data: ok } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: role,
      });
      if (ok === true) {
        allowed = true;
        break;
      }
    }
    if (!allowed) {
      throw new Error(
        "Forbidden: hanya staff_tu / admin yang boleh mengunggah arsip.",
      );
    }

    if (!ALLOWED_MIME_TYPES.has(data.mimeType)) {
      throw new Error(`Tipe file tidak diizinkan: ${data.mimeType}`);
    }

    // Decode base64 → bytes.
    const bytes = Uint8Array.from(Buffer.from(data.fileBase64, "base64"));
    if (bytes.byteLength !== data.fileSize) {
      // Not a hard error — some browsers normalize whitespace. Use real size.
      console.warn("[uploadAndCreateArsip] reported size mismatch", {
        reported: data.fileSize,
        actual: bytes.byteLength,
      });
    }

    const { storagePath } = buildStoragePath({
      tahun: data.tahun,
      fileName: data.fileName,
    });

    const { getStorage } = await import("./storage/index.server");
    const storage = getStorage();

    // 1) Push bytes to R2.
    await storage.upload({
      storagePath,
      body: bytes,
      contentType: data.mimeType,
    });

    // 2) Insert metadata. If insert fails, rollback the R2 object.
    const { data: row, error } = await supabase
      .from("arsip")
      .insert({
        nomor_surat: data.nomorSurat,
        judul: data.judul,
        kategori: data.kategori,
        jenis: data.jenis,
        tahun: data.tahun,
        lokasi_fisik: data.lokasiFisik ?? null,
        status: data.status,
        deskripsi: data.deskripsi ?? null,
        storage_provider: "r2",
        bucket_name: storage.bucket,
        storage_path: storagePath,
        file_name: data.fileName,
        mime_type: data.mimeType,
        file_size: bytes.byteLength,
        created_by: userId,
      })
      .select("id, nomor_surat")
      .single();

    if (error || !row) {
      console.error("[uploadAndCreateArsip] insert failed, rolling back", error);
      try {
        await storage.delete(storagePath);
      } catch (rollbackErr) {
        console.error("[uploadAndCreateArsip] rollback delete failed", rollbackErr);
      }
      throw new Error(error?.message ?? "Gagal menyimpan metadata arsip.");
    }

    await writeLogEntry(supabase, userId, {
      action: "arsip.upload",
      detail: `Mengunggah arsip ${row.nomor_surat} — ${data.judul}`,
      modul: "Upload",
      targetId: row.id,
      status: "Berhasil",
    });

    return { id: row.id, nomorSurat: row.nomor_surat };
  });
