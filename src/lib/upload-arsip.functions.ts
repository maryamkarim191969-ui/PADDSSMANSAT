import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

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
