/**
 * Public (unauthenticated) read of a single arsip for the public link
 * page at `/p/arsip/$id`. Uses the service-role admin client to bypass
 * RLS and projects ONLY non-sensitive metadata + a short-lived signed
 * preview URL. Never exposes storage paths, bucket names, or PII.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type PublicArsip = {
  id: string;
  nomorSurat: string;
  judul: string;
  kategori: string;
  jenis: string;
  tahun: number;
  lokasiFisik: string | null;
  status: string;
  deskripsi: string | null;
  tanggalUpload: string;
  fileName: string | null;
  mimeType: string | null;
  previewUrl: string | null;
  previewExpiresIn: number | null;
};

const Input = z.object({ id: z.string().uuid() });

export const getPublicArsip = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<PublicArsip | null> => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: row, error } = await supabaseAdmin
      .from("arsip")
      .select(
        "id, nomor_surat, judul, kategori, jenis, tahun, lokasi_fisik, status, deskripsi, created_at, storage_path, file_name, mime_type, pdf_url",
      )
      .eq("id", data.id)
      .maybeSingle();
    if (error) {
      console.error("[getPublicArsip]", error);
      return null;
    }
    if (!row) return null;

    let previewUrl: string | null = null;
    let previewExpiresIn: number | null = null;
    const key = (row.storage_path ?? row.pdf_url ?? "").trim();
    if (key) {
      try {
        const { getStorage } = await import("./storage/index.server");
        const storage = getStorage();
        if (await storage.exists(key)) {
          const signed = await storage.preview(key, {
            expiresIn: 600,
            contentType: row.mime_type ?? undefined,
          });
          previewUrl = signed.url;
          previewExpiresIn = signed.expiresIn;
        }
      } catch (err) {
        console.error("[getPublicArsip] preview sign failed", err);
      }
    }

    return {
      id: row.id,
      nomorSurat: row.nomor_surat,
      judul: row.judul,
      kategori: row.kategori,
      jenis: row.jenis ?? "Internal",
      tahun: row.tahun,
      lokasiFisik: row.lokasi_fisik,
      status: row.status ?? "Aktif",
      deskripsi: row.deskripsi,
      tanggalUpload: row.created_at,
      fileName: row.file_name,
      mimeType: row.mime_type,
      previewUrl,
      previewExpiresIn,
    };
  });