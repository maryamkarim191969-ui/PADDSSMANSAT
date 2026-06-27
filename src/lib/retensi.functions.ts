/**
 * Retensi server functions. Calculates tanggal retensi & status server-side
 * using the global retention policy. Filterable by tahun / kategori / status / search.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ARSIP_SELECT, mapArsipRow, type ArsipDbRow } from "@/lib/arsip-mappers";
import type { Arsip } from "@/lib/arsip-data";
import {
  RETENTION_YEARS,
  classifyRetention,
  computeSisaHari,
  computeTanggalRetensi,
  type RetensiStatusKey,
} from "@/lib/retention-policy";

export type RetensiRow = Arsip & {
  tanggalRetensi: string;
  retensiStatus: RetensiStatusKey;
  sisaHari: number;
};

export type RetensiSummary = {
  total: number;
  mendekati: number;
  kadaluarsa: number;
  aktif: number;
};

const FilterInput = z.object({
  tahun: z.number().int().optional(),
  kategori: z.string().optional(),
  status: z.enum(["Aman", "Mendekati Retensi", "Kadaluarsa"]).optional(),
  search: z.string().trim().max(200).optional().default(""),
});
export type RetensiFilterInput = z.input<typeof FilterInput>;

function escapeIlike(v: string) {
  return v.replace(/[\\%_]/g, (m) => `\\${m}`);
}

export const listRetensi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => FilterInput.parse(d ?? {}))
  .handler(async ({ data, context }): Promise<{
    rows: RetensiRow[]; summary: RetensiSummary;
  }> => {
    let q = context.supabase.from("arsip").select(ARSIP_SELECT).limit(20000);
    if (data.tahun !== undefined) q = q.eq("tahun", data.tahun);
    if (data.kategori) q = q.eq("kategori", data.kategori);
    if (data.search) {
      const s = `%${escapeIlike(data.search)}%`;
      q = q.or(
        [`nomor_surat.ilike.${s}`, `judul.ilike.${s}`, `kategori.ilike.${s}`].join(","),
      );
    }
    const { data: raw, error } = await q;
    if (error) throw new Error(error.message);

    const now = new Date();
    const all: RetensiRow[] = ((raw ?? []) as ArsipDbRow[]).map((r) => {
      const a = mapArsipRow(r);
      const tanggalRetensi = computeTanggalRetensi(a.tanggalUpload);
      const sisaHari = computeSisaHari(tanggalRetensi, now);
      return { ...a, tanggalRetensi, sisaHari, retensiStatus: classifyRetention(sisaHari) };
    });

    const filtered = data.status ? all.filter((r) => r.retensiStatus === data.status) : all;
    // Sort by sisaHari ascending — most urgent first.
    filtered.sort((a, b) => a.sisaHari - b.sisaHari);

    const summary: RetensiSummary = {
      total: all.length,
      mendekati: all.filter((r) => r.retensiStatus === "Mendekati Retensi").length,
      kadaluarsa: all.filter((r) => r.retensiStatus === "Kadaluarsa").length,
      aktif: all.filter((r) => r.retensiStatus === "Aman").length,
    };

    return { rows: filtered, summary };
  });

export { RETENTION_YEARS };
