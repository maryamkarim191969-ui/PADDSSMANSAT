import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type LokasiRow = {
  id: string;
  nama: string;
  kode: string;
  ruangan: string;
  rak: string;
  deskripsi: string;
  status: "Aktif" | "Nonaktif";
  jumlahArsip: number;
  createdAt: string;
};

const LokasiInput = z.object({
  nama: z.string().trim().min(1).max(120),
  kode: z
    .string()
    .trim()
    .min(2)
    .max(12)
    .regex(/^[A-Z0-9-]+$/i)
    .transform((v) => v.toUpperCase()),
  ruangan: z.string().trim().max(120).optional().default(""),
  rak: z.string().trim().max(120).optional().default(""),
  deskripsi: z.string().trim().max(2000).optional().default(""),
  status: z.enum(["Aktif", "Nonaktif"]).default("Aktif"),
});

function mapRow(r: {
  id: string;
  nama: string;
  kode: string;
  ruangan: string | null;
  rak: string | null;
  deskripsi: string | null;
  status: string;
  jumlah_arsip: number | null;
  created_at: string;
}, count = 0): LokasiRow {
  return {
    id: r.id,
    nama: r.nama,
    kode: r.kode,
    ruangan: r.ruangan ?? "",
    rak: r.rak ?? "",
    deskripsi: r.deskripsi ?? "",
    status: r.status === "Nonaktif" ? "Nonaktif" : "Aktif",
    jumlahArsip: count || r.jumlah_arsip || 0,
    createdAt: r.created_at,
  };
}

export const listLokasi = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LokasiRow[]> => {
    const { data, error } = await context.supabase
      .from("lokasi")
      .select("id,nama,kode,ruangan,rak,deskripsi,status,jumlah_arsip,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const { data: arsipRows } = await context.supabase
      .from("arsip")
      .select("lokasi_fisik");
    const counts = new Map<string, number>();
    for (const a of arsipRows ?? []) {
      const k = (a.lokasi_fisik ?? "").trim();
      if (!k) continue;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return rows.map((r) => mapRow(r, counts.get(r.nama) ?? 0));
  });

export const createLokasi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => LokasiInput.parse(d))
  .handler(async ({ data, context }): Promise<LokasiRow> => {
    const { data: row, error } = await context.supabase
      .from("lokasi")
      .insert({
        nama: data.nama,
        kode: data.kode,
        ruangan: data.ruangan ?? "",
        rak: data.rak ?? "",
        deskripsi: data.deskripsi ?? "",
        status: data.status,
        jumlah_arsip: 0,
      })
      .select("id,nama,kode,ruangan,rak,deskripsi,status,jumlah_arsip,created_at")
      .single();
    if (error) throw new Error(error.message);
    return mapRow(row);
  });

export const updateLokasi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    LokasiInput.extend({ id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }): Promise<LokasiRow> => {
    const { data: row, error } = await context.supabase
      .from("lokasi")
      .update({
        nama: data.nama,
        kode: data.kode,
        ruangan: data.ruangan ?? "",
        rak: data.rak ?? "",
        deskripsi: data.deskripsi ?? "",
        status: data.status,
      })
      .eq("id", data.id)
      .select("id,nama,kode,ruangan,rak,deskripsi,status,jumlah_arsip,created_at")
      .single();
    if (error) throw new Error(error.message);
    return mapRow(row);
  });

export const deleteLokasi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("lokasi")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });