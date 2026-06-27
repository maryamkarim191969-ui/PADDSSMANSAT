/**
 * Server functions for the `public.arsip` table.
 *
 *   - listArsip   : paginated / sorted / filtered list (server-side ILIKE search)
 *   - getArsip    : fetch one row by id
 *   - updateArsip : update editable metadata (RLS enforces staff_tu/admin)
 *
 * `createArsip` lives in `upload-arsip.functions.ts`.
 * `deleteArsip` lives in `storage.functions.ts` (it also nukes the R2 object).
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Arsip } from "@/lib/arsip-data";
import { ARSIP_SELECT, mapArsipRow, type ArsipDbRow } from "@/lib/arsip-mappers";

const SortKey = z.enum(["newest", "oldest", "az", "za"]);
export type ArsipSortKey = z.infer<typeof SortKey>;

const ListInput = z.object({
  search: z.string().trim().max(200).optional().default(""),
  tahun: z.union([z.string(), z.number()]).optional(),
  kategori: z.string().optional(),
  jenis: z.string().optional(),
  status: z.string().optional(),
  lokasi: z.string().optional(),
  sort: SortKey.default("newest"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(200).default(10),
});

export type ListArsipInput = z.input<typeof ListInput>;
export type ListArsipResult = {
  rows: Arsip[];
  total: number;
  page: number;
  pageSize: number;
};

function escapeIlike(v: string) {
  // % and _ are wildcards in ILIKE
  return v.replace(/[\\%_]/g, (m) => `\\${m}`);
}

export const listArsip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ListInput.parse(d ?? {}))
  .handler(async ({ data, context }): Promise<ListArsipResult> => {
    let q = context.supabase
      .from("arsip")
      .select(ARSIP_SELECT, { count: "exact" });

    if (data.tahun !== undefined && String(data.tahun) !== "all") {
      q = q.eq("tahun", Number(data.tahun));
    }
    if (data.kategori && data.kategori !== "all") q = q.eq("kategori", data.kategori);
    if (data.jenis && data.jenis !== "all") q = q.eq("jenis", data.jenis);
    if (data.status && data.status !== "all") q = q.eq("status", data.status);
    if (data.lokasi && data.lokasi !== "all") q = q.eq("lokasi_fisik", data.lokasi);

    const search = data.search?.trim();
    if (search) {
      const s = `%${escapeIlike(search)}%`;
      // ILIKE OR across nomor_surat / judul / kategori / lokasi_fisik / deskripsi
      q = q.or(
        [
          `nomor_surat.ilike.${s}`,
          `judul.ilike.${s}`,
          `kategori.ilike.${s}`,
          `lokasi_fisik.ilike.${s}`,
          `deskripsi.ilike.${s}`,
        ].join(","),
      );
    }

    const ascending = data.sort === "oldest" || data.sort === "az";
    const orderCol =
      data.sort === "az" || data.sort === "za" ? "judul" : "created_at";
    q = q.order(orderCol, { ascending });

    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;
    q = q.range(from, to);

    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);

    return {
      rows: (rows ?? []).map((r) => mapArsipRow(r as ArsipDbRow)),
      total: count ?? 0,
      page: data.page,
      pageSize: data.pageSize,
    };
  });

const IdInput = z.object({ id: z.string().uuid() });

export const getArsip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ data, context }): Promise<Arsip> => {
    const { data: row, error } = await context.supabase
      .from("arsip")
      .select(ARSIP_SELECT)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Arsip tidak ditemukan.");
    return mapArsipRow(row as ArsipDbRow);
  });

const UpdateInput = z.object({
  id: z.string().uuid(),
  nomorSurat: z.string().trim().min(1).max(120),
  judul: z.string().trim().min(1).max(255),
  kategori: z.string().trim().min(1).max(60),
  jenis: z.string().trim().min(1).max(60),
  tahun: z.number().int().min(1900).max(2200),
  lokasiFisik: z.string().trim().max(120).optional().nullable(),
  status: z.string().trim().max(40),
  deskripsi: z.string().trim().max(4000).optional().nullable(),
});

export type UpdateArsipInput = z.input<typeof UpdateInput>;

export const updateArsip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateInput.parse(d))
  .handler(async ({ data, context }): Promise<Arsip> => {
    const { data: row, error } = await context.supabase
      .from("arsip")
      .update({
        nomor_surat: data.nomorSurat,
        judul: data.judul,
        kategori: data.kategori,
        jenis: data.jenis,
        tahun: data.tahun,
        lokasi_fisik: data.lokasiFisik ?? null,
        status: data.status,
        deskripsi: data.deskripsi ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select(ARSIP_SELECT)
      .single();
    if (error) throw new Error(error.message);
    return mapArsipRow(row as ArsipDbRow);
  });

/** Distinct facet values for filter dropdowns (tahun, kategori, jenis, lokasi). */
export type ArsipFacets = {
  tahun: number[];
  kategori: string[];
  jenis: string[];
  lokasi: string[];
};

export const getArsipFacets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ArsipFacets> => {
    const { data, error } = await context.supabase
      .from("arsip")
      .select("tahun, kategori, jenis, lokasi_fisik")
      .limit(5000);
    if (error) throw new Error(error.message);
    const tahun = new Set<number>();
    const kategori = new Set<string>();
    const jenis = new Set<string>();
    const lokasi = new Set<string>();
    for (const r of (data ?? []) as Array<{
      tahun: number; kategori: string; jenis: string; lokasi_fisik: string | null;
    }>) {
      if (r.tahun != null) tahun.add(r.tahun);
      if (r.kategori) kategori.add(r.kategori);
      if (r.jenis) jenis.add(r.jenis);
      if (r.lokasi_fisik) lokasi.add(r.lokasi_fisik);
    }
    return {
      tahun: Array.from(tahun).sort((a, b) => b - a),
      kategori: Array.from(kategori).sort(),
      jenis: Array.from(jenis).sort(),
      lokasi: Array.from(lokasi).sort(),
    };
  });
