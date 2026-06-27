/**
 * Server functions powering the Dashboard. All data is computed from
 * `public.arsip` (and `public.log_aktivitas` for activity feed) — no mocks.
 *
 * The Retention Alert uses the SAME math as the Retensi module
 * (see `retention-policy.ts`) so both modules stay in sync.
 */

import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ARSIP_SELECT, mapArsipRow, type ArsipDbRow } from "@/lib/arsip-mappers";
import type { Arsip } from "@/lib/arsip-data";
import {
  RETENTION_ALERT_DAYS,
  RETENTION_YEARS,
  classifyRetention,
  computeSisaHari,
  computeTanggalRetensi,
} from "@/lib/retention-policy";

export type DashboardOverview = {
  stats: {
    total: number;
    aktif: number;
    kategori: number;
    qrAktif: number;
  };
  growth: { month: string; value: number }[];
  terbaru: Arsip[];
  aktivitas: { title: string; user: string; time: string }[];
  retention: {
    mendekati: number;
    kadaluarsa: number;
    nextItem: { id: string; nomorSurat: string; judul: string; sisaHari: number } | null;
  };
};

const BULAN_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export const getDashboardOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DashboardOverview> => {
    const sb = context.supabase;

    // ---- Stats: total, aktif, kategori distinct ----
    const [{ count: total }, { count: aktif }, kategoriRes] = await Promise.all([
      sb.from("arsip").select("id", { head: true, count: "exact" }),
      sb.from("arsip").select("id", { head: true, count: "exact" }).eq("status", "Aktif"),
      sb.from("arsip").select("kategori").limit(5000),
    ]);
    const kategoriDistinct = new Set(
      ((kategoriRes.data ?? []) as Array<{ kategori: string }>)
        .map((r) => r.kategori)
        .filter(Boolean),
    ).size;

    // ---- Growth: 6 months back including current month ----
    const now = new Date();
    const monthsBack = 6;
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthsBack - 1), 1));
    const startIso = start.toISOString();
    const { data: growthRows } = await sb
      .from("arsip")
      .select("created_at")
      .gte("created_at", startIso)
      .limit(20000);

    const buckets: Record<string, number> = {};
    for (let i = 0; i < monthsBack; i++) {
      const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      buckets[key] = 0;
    }
    for (const r of (growthRows ?? []) as Array<{ created_at: string }>) {
      const d = new Date(r.created_at);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      if (key in buckets) buckets[key]++;
    }
    const growth = Object.keys(buckets)
      .sort()
      .map((key) => {
        const m = Number(key.slice(5, 7)) - 1;
        return { month: BULAN_SHORT[m], value: buckets[key] };
      });

    // ---- Latest 5 arsip ----
    const { data: latestRows } = await sb
      .from("arsip")
      .select(ARSIP_SELECT)
      .order("created_at", { ascending: false })
      .limit(5);
    const terbaru = ((latestRows ?? []) as ArsipDbRow[]).map(mapArsipRow);

    // ---- Recent activity ----
    const { data: logRows } = await sb
      .from("log_aktivitas")
      .select("action, detail, user_name, at")
      .order("at", { ascending: false })
      .limit(8);
    const aktivitas = ((logRows ?? []) as Array<{
      action: string; detail: string | null; user_name: string | null; at: string;
    }>).map((l) => ({
      title: l.detail || l.action,
      user: l.user_name || "Sistem",
      time: timeAgo(l.at),
    }));

    // ---- Retention alert: pull all created_at + meta, classify in JS ----
    const { data: retRows } = await sb
      .from("arsip")
      .select("id, nomor_surat, judul, created_at")
      .limit(20000);
    let mendekati = 0;
    let kadaluarsa = 0;
    let nextItem: DashboardOverview["retention"]["nextItem"] = null;
    let nextSisa = Number.POSITIVE_INFINITY;
    for (const r of (retRows ?? []) as Array<{
      id: string; nomor_surat: string; judul: string; created_at: string;
    }>) {
      const tglRet = computeTanggalRetensi(r.created_at);
      const sisa = computeSisaHari(tglRet, now);
      const cls = classifyRetention(sisa);
      if (cls === "Mendekati Retensi") {
        mendekati++;
        if (sisa < nextSisa) {
          nextSisa = sisa;
          nextItem = { id: r.id, nomorSurat: r.nomor_surat, judul: r.judul, sisaHari: sisa };
        }
      } else if (cls === "Kadaluarsa") {
        kadaluarsa++;
        if (sisa < nextSisa) {
          nextSisa = sisa;
          nextItem = { id: r.id, nomorSurat: r.nomor_surat, judul: r.judul, sisaHari: sisa };
        }
      }
    }

    return {
      stats: {
        total: total ?? 0,
        aktif: aktif ?? 0,
        kategori: kategoriDistinct,
        qrAktif: total ?? 0,
      },
      growth,
      terbaru,
      aktivitas,
      retention: { mendekati, kadaluarsa, nextItem },
    };
  });

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export { RETENTION_ALERT_DAYS, RETENTION_YEARS };
