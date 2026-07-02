/**
 * AI Pengecekan Nomor Surat — pemeriksaan eksak berdasarkan nomor surat.
 *
 * Dijadikan tahap AI tersendiri pada workflow Upload Arsip, dijalankan
 * setelah AI Analisis Metadata selesai. Server hanya melakukan pencocokan
 * eksak (case-insensitive, trim) terhadap kolom `arsip.nomor_surat` dan
 * mengembalikan daftar arsip yang sudah menggunakan nomor tersebut agar
 * administrator dapat melakukan verifikasi. Keputusan akhir tetap pada
 * administrator — server tidak membatalkan proses upload.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { writeLogEntry } from "@/lib/log-aktivitas.functions";

const Input = z.object({
  nomorSurat: z.string().trim().min(1).max(200),
});

export type NomorSuratMatch = {
  id: string;
  nomorSurat: string;
  judul: string;
  kategori: string;
  tahun: number;
  createdAt: string;
};

export type NomorSuratCheckResult = {
  nomorSurat: string;
  found: boolean;
  matches: NomorSuratMatch[];
  checkedAt: string;
};

export const checkNomorSurat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }): Promise<NomorSuratCheckResult> => {
    const nomor = data.nomorSurat.trim();
    const { data: rows, error } = await context.supabase
      .from("arsip")
      .select("id, nomor_surat, judul, kategori, tahun, created_at")
      .ilike("nomor_surat", nomor)
      .limit(10);
    if (error) throw new Error(error.message);
    const matches = (rows ?? []).map((r) => ({
      id: r.id as string,
      nomorSurat: r.nomor_surat as string,
      judul: r.judul as string,
      kategori: r.kategori as string,
      tahun: r.tahun as number,
      createdAt: r.created_at as string,
    }));
    void writeLogEntry(context.supabase, context.userId, {
      action: "ai.nomor_check",
      detail: `Pengecekan nomor surat "${nomor}" → ${matches.length} temuan`,
      modul: "AI",
      status: "Berhasil",
    });
    return {
      nomorSurat: nomor,
      found: matches.length > 0,
      matches,
      checkedAt: new Date().toISOString(),
    };
  });