/**
 * AI Statistics — dashboard data source.
 *
 * Membaca `log_aktivitas` untuk seluruh aktivitas AI (source = "AI").
 * Mengembalikan ringkasan kapabilitas, tren 30 hari, top pengguna, dan
 * peristiwa terbaru. Tidak menulis; hanya membaca dengan RLS admin/staff.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AiCapabilityKey =
  | "ai.metadata"
  | "ai.nomor_check"
  | "ai.category_proposal"
  | "ai.search"
  | "ai.assistant"
  | "ai.duplicate";

export type AiCapabilityLabel = {
  key: AiCapabilityKey;
  label: string;
  description: string;
};

export const AI_CAPABILITIES: AiCapabilityLabel[] = [
  { key: "ai.metadata", label: "AI Analisis Metadata", description: "Ekstraksi metadata pada Upload Arsip." },
  { key: "ai.nomor_check", label: "AI Pengecekan Nomor Surat", description: "Verifikasi nomor surat terhadap database." },
  { key: "ai.category_proposal", label: "AI Smart Category", description: "Usulan kategori baru dari analisis dokumen." },
  { key: "ai.search", label: "AI Document Search", description: "Pencarian arsip berbasis bahasa alami." },
  { key: "ai.assistant", label: "AI Assistant", description: "Digital Customer Assistant PADDS SMANSAT." },
  { key: "ai.duplicate", label: "AI Duplicate Detection", description: "Analisis kesamaan dokumen." },
];

export type AiStatisticsOverview = {
  totalCalls: number;
  successCount: number;
  failCount: number;
  activeUsers: number;
  windowDays: number;
  perCapability: Array<{
    key: string;
    label: string;
    total: number;
    berhasil: number;
    gagal: number;
  }>;
  trend: Array<{ date: string; total: number }>; // ISO date (YYYY-MM-DD)
  topUsers: Array<{ user: string; total: number }>;
  recentEvents: Array<{
    id: string;
    at: string;
    user: string;
    action: string;
    detail: string;
    status: "Berhasil" | "Gagal";
  }>;
};

const CAP_LABEL: Record<string, string> = Object.fromEntries(
  AI_CAPABILITIES.map((c) => [c.key, c.label]),
);

export const getAiStatistics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AiStatisticsOverview> => {
    const WINDOW_DAYS = 30;
    const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const { data, error } = await context.supabase
      .from("log_aktivitas")
      .select("id, user_name, action, detail, status, source, at")
      .eq("source", "AI")
      .gte("at", since.toISOString())
      .order("at", { ascending: false })
      .limit(2000);
    if (error) {
      console.error("[getAiStatistics]", error);
      return {
        totalCalls: 0,
        successCount: 0,
        failCount: 0,
        activeUsers: 0,
        windowDays: WINDOW_DAYS,
        perCapability: AI_CAPABILITIES.map((c) => ({
          key: c.key,
          label: c.label,
          total: 0,
          berhasil: 0,
          gagal: 0,
        })),
        trend: [],
        topUsers: [],
        recentEvents: [],
      };
    }
    type Row = {
      id: string;
      user_name: string | null;
      action: string;
      detail: string | null;
      status: string;
      source: string;
      at: string;
    };
    const rows = (data ?? []) as Row[];
    const perCap = new Map<string, { total: number; berhasil: number; gagal: number }>();
    for (const c of AI_CAPABILITIES)
      perCap.set(c.key, { total: 0, berhasil: 0, gagal: 0 });
    const users = new Map<string, number>();
    const dayBucket = new Map<string, number>();
    let ok = 0;
    let fail = 0;
    for (const r of rows) {
      const key = r.action;
      if (!perCap.has(key)) perCap.set(key, { total: 0, berhasil: 0, gagal: 0 });
      const entry = perCap.get(key)!;
      entry.total += 1;
      if (r.status === "Gagal") {
        entry.gagal += 1;
        fail += 1;
      } else {
        entry.berhasil += 1;
        ok += 1;
      }
      const uname = r.user_name || "Sistem";
      users.set(uname, (users.get(uname) ?? 0) + 1);
      const d = r.at.slice(0, 10);
      dayBucket.set(d, (dayBucket.get(d) ?? 0) + 1);
    }
    // Fill 30-day trend even if some days have no events.
    const trend: Array<{ date: string; total: number }> = [];
    for (let i = WINDOW_DAYS - 1; i >= 0; i -= 1) {
      const dt = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = dt.toISOString().slice(0, 10);
      trend.push({ date: key, total: dayBucket.get(key) ?? 0 });
    }
    const topUsers = [...users.entries()]
      .map(([user, total]) => ({ user, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
    const perCapability = [...perCap.entries()].map(([key, v]) => ({
      key,
      label: CAP_LABEL[key] ?? key,
      ...v,
    }));
    return {
      totalCalls: rows.length,
      successCount: ok,
      failCount: fail,
      activeUsers: users.size,
      windowDays: WINDOW_DAYS,
      perCapability,
      trend,
      topUsers,
      recentEvents: rows.slice(0, 25).map((r) => ({
        id: r.id,
        at: r.at,
        user: r.user_name || "Sistem",
        action: CAP_LABEL[r.action] ?? r.action,
        detail: r.detail || r.action,
        status: (r.status === "Gagal" ? "Gagal" : "Berhasil") as "Berhasil" | "Gagal",
      })),
    };
  });