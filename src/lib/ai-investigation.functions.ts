/**
 * AI Document Search — Tindak Lanjut. Server function tambahan yang
 * membantu administrator melakukan investigasi terhadap kualitas database
 * arsip. AI mengidentifikasi kelompok arsip yang berpotensi merupakan
 * penyimpanan ganda (duplikat) berdasarkan nomor surat, judul, kategori,
 * dan konteks metadata lain. Fungsi ini melengkapi aiSearchArsip tanpa
 * mengubah alur pencarian utama.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Arsip } from "@/lib/arsip-data";
import { ARSIP_SELECT, mapArsipRow, type ArsipDbRow } from "@/lib/arsip-mappers";
import { writeLogEntry } from "@/lib/log-aktivitas.functions";

const Input = z.object({
  focus: z.string().trim().max(300).optional().default(""),
  limitClusters: z.number().int().min(1).max(30).optional().default(15),
});

export type DuplicateCluster = {
  id: string;
  reason: string;
  confidence: number;
  arsip: Arsip[];
};

export type AiInvestigationResult = {
  focus: string;
  totalScanned: number;
  clusters: DuplicateCluster[];
  durations: { fetch: number; llm: number; total: number };
};

const MAX_CANDIDATES = 500;

type LlmCluster = {
  ids: string[];
  reason: string;
  confidence: number;
};

async function detectDuplicates(
  focus: string,
  candidates: Array<{ id: string; text: string }>,
  limitClusters: number,
): Promise<LlmCluster[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY belum dikonfigurasi.");
  const focusLine = focus
    ? `Fokus investigasi administrator: ${focus}`
    : "Fokus investigasi: seluruh arsip terbaru yang tersimpan.";
  const system = `Anda adalah analis kualitas arsip sekolah PADDS SMANSAT.
Tugas Anda: mengidentifikasi arsip yang berpotensi merupakan PENYIMPANAN GANDA (duplikat) berdasarkan daftar dokumen yang diberikan.

Aturan:
- Kelompokkan HANYA arsip yang benar-benar memiliki indikasi duplikat (nomor surat sama, judul sangat mirip, kombinasi kategori/tahun/instansi yang konsisten menandakan dokumen yang sama).
- Setiap kelompok berisi 2 atau lebih id arsip.
- Jangan mengelompokkan arsip yang hanya kebetulan berada pada kategori atau tahun yang sama.
- Jangan mengambil keputusan penghapusan; hanya menyajikan indikasi untuk peninjauan.
- "reason" adalah satu kalimat singkat berbahasa Indonesia, profesional, tanpa emoji, menjelaskan mengapa kelompok tersebut berpotensi duplikat.
- "confidence" 0..1 menggambarkan kekuatan indikasi (1.0 = sangat yakin duplikat).
- Maksimum ${limitClusters} kelompok, urut dari indikasi terkuat.
- Bila tidak ditemukan indikasi duplikat sama sekali, kembalikan {"clusters":[]}.
- Output HANYA JSON valid dengan bentuk: {"clusters":[{"ids":["..."],"reason":"...","confidence":0.9}]}`;

  const userPayload = {
    focus: focusLine,
    documents: candidates,
    max_clusters: limitClusters,
  };

  const body = {
    model: "google/gemini-3-flash-preview",
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: `${focusLine}\n\nDaftar arsip (JSON):\n${JSON.stringify(userPayload).slice(0, 90_000)}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
  };
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 429)
      throw new Error("Layanan AI sedang sibuk. Coba lagi sebentar lagi.");
    if (res.status === 402) throw new Error("Kredit AI Gateway habis.");
    const t = await res.text().catch(() => "");
    throw new Error(`AI Gateway error ${res.status}: ${t.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = json.choices?.[0]?.message?.content ?? "";
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    const s = stripped.indexOf("{");
    const e = stripped.lastIndexOf("}");
    if (s === -1 || e <= s) return [];
    parsed = JSON.parse(stripped.slice(s, e + 1));
  }
  const clusters = (parsed as { clusters?: unknown }).clusters;
  if (!Array.isArray(clusters)) return [];
  const out: LlmCluster[] = [];
  for (const c of clusters) {
    if (!c || typeof c !== "object") continue;
    const o = c as Record<string, unknown>;
    const ids = Array.isArray(o.ids)
      ? o.ids.filter((x): x is string => typeof x === "string")
      : [];
    if (ids.length < 2) continue;
    const reason = typeof o.reason === "string" ? o.reason.slice(0, 280) : "";
    const confidence =
      typeof o.confidence === "number"
        ? Math.max(0, Math.min(1, o.confidence))
        : 0.7;
    out.push({ ids, reason, confidence });
  }
  return out.slice(0, limitClusters);
}

export const aiInvestigateDuplicates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }): Promise<AiInvestigationResult> => {
    const t0 = Date.now();
    const { data: rows, error } = await context.supabase
      .from("arsip")
      .select(ARSIP_SELECT)
      .order("created_at", { ascending: false })
      .limit(MAX_CANDIDATES);
    if (error) throw new Error(`Gagal memuat arsip: ${error.message}`);
    const all = (rows ?? []).map((r) => mapArsipRow(r as ArsipDbRow));
    const tFetch = Date.now() - t0;

    if (all.length < 2) {
      return {
        focus: data.focus,
        totalScanned: all.length,
        clusters: [],
        durations: { fetch: tFetch, llm: 0, total: Date.now() - t0 },
      };
    }

    const candidates = all.map((a) => ({
      id: a.id,
      text: [
        `Nomor: ${a.nomorSurat}`,
        `Judul: ${a.judul}`,
        `Kategori: ${a.kategori}`,
        `Jenis: ${a.jenis}`,
        `Tahun: ${a.tahun}`,
        `Lokasi: ${a.lokasiFisik}`,
        a.deskripsi ? `Deskripsi: ${a.deskripsi.slice(0, 160)}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    }));

    const tLlm = Date.now();
    const raw = await detectDuplicates(data.focus, candidates, data.limitClusters);
    const llmMs = Date.now() - tLlm;

    const byId = new Map(all.map((a) => [a.id, a]));
    const clusters: DuplicateCluster[] = [];
    raw.forEach((c, i) => {
      const arsipList = c.ids
        .map((id) => byId.get(id))
        .filter((a): a is Arsip => !!a);
      if (arsipList.length < 2) return;
      clusters.push({
        id: `cl_${i}_${Date.now().toString(36)}`,
        reason: c.reason,
        confidence: c.confidence,
        arsip: arsipList,
      });
    });

    void writeLogEntry(context.supabase, context.userId, {
      action: "ai.investigation",
      detail: `Tindak Lanjut AI Search: "${data.focus.slice(0, 100) || "seluruh arsip"}" → ${clusters.length} kelompok dari ${all.length} arsip`,
      modul: "AI",
      status: "Berhasil",
    });

    return {
      focus: data.focus,
      totalScanned: all.length,
      clusters,
      durations: { fetch: tFetch, llm: llmMs, total: Date.now() - t0 },
    };
  });