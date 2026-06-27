/**
 * Server-side statistik aggregation. Pulls only the columns it needs
 * (no PDF blobs, no signed URLs) and groups in JS — keeps SQL portable
 * across Supabase tiers while remaining fast for tens of thousands of rows.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  RETENTION_YEARS,
  classifyRetention,
  computeSisaHari,
  computeTanggalRetensi,
} from "@/lib/retention-policy";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const FilterInput = z.object({
  tahun: z.number().int().optional(),
  bulan: z.number().int().min(1).max(12).optional(),
  kategori: z.string().optional(),
});
export type StatistikFilterInput = z.input<typeof FilterInput>;

type Row = {
  tahun: number;
  kategori: string;
  status: string;
  lokasi_fisik: string | null;
  created_at: string;
};

export type StatistikOverview = {
  summary: { total: number; aktif: number; retensi: number; kategori: number; lokasi: number };
  monthly: { label: string; value: number }[];
  daily: { label: string; value: number }[];
  yearly: { label: string; value: number }[];
  categoryDistribution: { name: string; value: number }[];
  statusDistribution: { name: string; value: number }[];
  topCategory: { name: string; value: number }[];
  topLocation: { name: string; value: number }[];
  yearlyReport: {
    tahun: number; total: number; aktif: number; retensi: number;
    status: "Sehat" | "Perlu Tinjauan";
  }[];
  isEmpty: boolean;
};

function isRetensi(r: Row, now: Date): boolean {
  if (r.status === "Diarsipkan") return true;
  const sisa = computeSisaHari(computeTanggalRetensi(r.created_at), now);
  const cls = classifyRetention(sisa);
  return cls !== "Aman";
}

export const getStatistikOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => FilterInput.parse(d ?? {}))
  .handler(async ({ data, context }): Promise<StatistikOverview> => {
    let q = context.supabase
      .from("arsip")
      .select("tahun, kategori, status, lokasi_fisik, created_at")
      .limit(50000);
    if (data.tahun !== undefined) q = q.eq("tahun", data.tahun);
    if (data.kategori) q = q.eq("kategori", data.kategori);

    const { data: rawRows, error } = await q;
    if (error) throw new Error(error.message);
    const now = new Date();

    let rows = (rawRows ?? []) as Row[];
    if (data.bulan) {
      rows = rows.filter((r) => new Date(r.created_at).getUTCMonth() + 1 === data.bulan);
    }

    const total = rows.length;
    const retensi = rows.filter((r) => isRetensi(r, now)).length;
    const aktif = rows.filter((r) => r.status === "Aktif" && !isRetensi(r, now)).length;
    const kategoriSet = new Set(rows.map((r) => r.kategori).filter(Boolean));
    const lokasiSet = new Set(
      rows.map((r) => r.lokasi_fisik).filter((v): v is string => !!v && v.length > 0),
    );

    // Monthly
    const focusYear = data.tahun ?? now.getUTCFullYear();
    const monthly = BULAN.map((b, i) => {
      const value = rows.filter((r) => {
        const d = new Date(r.created_at);
        return d.getUTCFullYear() === focusYear && d.getUTCMonth() === i;
      }).length;
      return { label: b.slice(0, 3), value };
    });

    // Daily for focus month
    const focusMonth = data.bulan ?? now.getUTCMonth() + 1;
    const daysInMonth = new Date(Date.UTC(focusYear, focusMonth, 0)).getUTCDate();
    const daily: { label: string; value: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const value = rows.filter((r) => {
        const x = new Date(r.created_at);
        return x.getUTCFullYear() === focusYear && x.getUTCMonth() + 1 === focusMonth && x.getUTCDate() === d;
      }).length;
      daily.push({ label: String(d), value });
    }

    // Yearly
    const yearMap: Record<number, number> = {};
    for (const r of rows) yearMap[r.tahun] = (yearMap[r.tahun] ?? 0) + 1;
    const yearly = Object.keys(yearMap)
      .map(Number)
      .sort((a, b) => a - b)
      .map((y) => ({ label: String(y), value: yearMap[y] }));

    // Category distribution
    const catMap: Record<string, number> = {};
    for (const r of rows) if (r.kategori) catMap[r.kategori] = (catMap[r.kategori] ?? 0) + 1;
    const categoryDistribution = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Status distribution
    const statusDistribution = [
      { name: "Aktif", value: aktif },
      { name: "Inaktif", value: rows.filter((r) => r.status === "Inaktif").length },
      { name: "Retensi", value: retensi },
    ].filter((d) => d.value > 0);

    // Top category / location
    const topCategory = categoryDistribution.slice(0, 5);
    const locMap: Record<string, number> = {};
    for (const r of rows) {
      if (r.lokasi_fisik) locMap[r.lokasi_fisik] = (locMap[r.lokasi_fisik] ?? 0) + 1;
    }
    const topLocation = Object.entries(locMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Yearly report
    const years = Array.from(new Set(rows.map((r) => r.tahun))).sort((a, b) => b - a);
    const yearlyReport = years.map((tahun) => {
      const sub = rows.filter((r) => r.tahun === tahun);
      const t = sub.length;
      const ret = sub.filter((r) => isRetensi(r, now)).length;
      const ak = sub.filter((r) => r.status === "Aktif" && !isRetensi(r, now)).length;
      return {
        tahun,
        total: t,
        aktif: ak,
        retensi: ret,
        status: (ret > ak ? "Perlu Tinjauan" : "Sehat") as "Sehat" | "Perlu Tinjauan",
      };
    });

    return {
      summary: {
        total,
        aktif,
        retensi,
        kategori: kategoriSet.size,
        lokasi: lokasiSet.size,
      },
      monthly,
      daily,
      yearly,
      categoryDistribution,
      statusDistribution,
      topCategory,
      topLocation,
      yearlyReport,
      isEmpty: total === 0,
    };
  });

export { RETENTION_YEARS };
