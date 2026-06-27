import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type KategoriRow = {
  id: string;
  nama: string;
  kode: string;
  deskripsi: string;
  status: "Aktif" | "Nonaktif";
  jumlahArsip: number;
  createdAt: string;
};

const KategoriInput = z.object({
  nama: z.string().trim().min(1).max(120),
  kode: z
    .string()
    .trim()
    .min(2)
    .max(8)
    .regex(/^[A-Z0-9-]+$/i)
    .transform((v) => v.toUpperCase()),
  deskripsi: z.string().trim().max(2000).optional().default(""),
  status: z.enum(["Aktif", "Nonaktif"]).default("Aktif"),
});

function mapRow(r: {
  id: string;
  nama: string;
  kode: string;
  deskripsi: string | null;
  status: string;
  jumlah_arsip: number | null;
  created_at: string;
}, count = 0): KategoriRow {
  return {
    id: r.id,
    nama: r.nama,
    kode: r.kode,
    deskripsi: r.deskripsi ?? "",
    status: (r.status === "Nonaktif" ? "Nonaktif" : "Aktif"),
    jumlahArsip: count || r.jumlah_arsip || 0,
    createdAt: r.created_at,
  };
}

export const listKategori = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<KategoriRow[]> => {
    const { data, error } = await context.supabase
      .from("kategori")
      .select("id,nama,kode,deskripsi,status,jumlah_arsip,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    // Live count per kategori by name (arsip.kategori is text)
    const { data: arsipRows } = await context.supabase
      .from("arsip")
      .select("kategori");
    const counts = new Map<string, number>();
    for (const a of arsipRows ?? []) {
      const k = (a.kategori ?? "").trim();
      if (!k) continue;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return rows.map((r) => mapRow(r, counts.get(r.nama) ?? 0));
  });

export const createKategori = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => KategoriInput.parse(d))
  .handler(async ({ data, context }): Promise<KategoriRow> => {
    const { data: row, error } = await context.supabase
      .from("kategori")
      .insert({
        nama: data.nama,
        kode: data.kode,
        deskripsi: data.deskripsi ?? "",
        status: data.status,
        jumlah_arsip: 0,
      })
      .select("id,nama,kode,deskripsi,status,jumlah_arsip,created_at")
      .single();
    if (error) throw new Error(error.message);
    return mapRow(row);
  });

export const updateKategori = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    KategoriInput.extend({ id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }): Promise<KategoriRow> => {
    const { data: row, error } = await context.supabase
      .from("kategori")
      .update({
        nama: data.nama,
        kode: data.kode,
        deskripsi: data.deskripsi ?? "",
        status: data.status,
      })
      .eq("id", data.id)
      .select("id,nama,kode,deskripsi,status,jumlah_arsip,created_at")
      .single();
    if (error) throw new Error(error.message);
    return mapRow(row);
  });

export const deleteKategori = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("kategori")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });