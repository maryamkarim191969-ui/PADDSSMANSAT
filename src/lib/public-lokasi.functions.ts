/**
 * Public (unauthenticated) read of a single lokasi and the arsip that
 * reside di dalamnya. Digunakan oleh halaman publik `/p/lokasi/$id` yang
 * dituju QR Code lokasi fisik. Hanya memproyeksikan kolom aman.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type PublicLokasi = {
  id: string;
  nama: string;
  kode: string;
  ruangan: string;
  rak: string;
  deskripsi: string;
  status: string;
  jumlahArsip: number;
  arsip: Array<{
    id: string;
    nomorSurat: string;
    judul: string;
    kategori: string;
    tahun: number;
    tanggalUpload: string;
  }>;
};

const Input = z.object({ id: z.string().uuid() });

export const getPublicLokasi = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<PublicLokasi | null> => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: row, error } = await supabaseAdmin
      .from("lokasi")
      .select("id, nama, kode, ruangan, rak, deskripsi, status")
      .eq("id", data.id)
      .maybeSingle();
    if (error) {
      console.error("[getPublicLokasi]", error);
      return null;
    }
    if (!row) return null;

    const { data: arsipRows } = await supabaseAdmin
      .from("arsip")
      .select("id, nomor_surat, judul, kategori, tahun, created_at")
      .ilike("lokasi_fisik", row.nama)
      .order("created_at", { ascending: false })
      .limit(200);

    const arsip = (arsipRows ?? []).map((a) => ({
      id: a.id as string,
      nomorSurat: (a.nomor_surat as string) ?? "",
      judul: (a.judul as string) ?? "",
      kategori: (a.kategori as string) ?? "",
      tahun: (a.tahun as number) ?? 0,
      tanggalUpload: (a.created_at as string) ?? "",
    }));

    return {
      id: row.id as string,
      nama: row.nama as string,
      kode: row.kode as string,
      ruangan: (row.ruangan as string) ?? "",
      rak: (row.rak as string) ?? "",
      deskripsi: (row.deskripsi as string) ?? "",
      status: (row.status as string) ?? "Aktif",
      jumlahArsip: arsip.length,
      arsip,
    };
  });