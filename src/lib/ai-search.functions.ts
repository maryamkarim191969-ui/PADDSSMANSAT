/**
 * AI Document Search — server function that ranks arsip rows by
 * relevance to a natural-language query using the Lovable AI Gateway.
 *
 * Reads live data from `public.arsip` (same source as the conventional
 * search), feeds a compact projection to the LLM, and returns ranked
 * IDs + per-result reasoning. The route then re-hydrates full Arsip
 * objects via existing hooks so detail/preview/download all keep
 * working through the established pipeline.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Arsip } from "@/lib/arsip-data";
import { ARSIP_SELECT, mapArsipRow, type ArsipDbRow } from "@/lib/arsip-mappers";

const Input = z.object({
  query: z.string().trim().min(2).max(500),
  limit: z.number().int().min(1).max(20).optional().default(10),
});

export type AiSearchHit = {
  arsip: Arsip;
  score: number;
  reason: string;
};

export type AiSearchResult = {
  query: string;
  totalScanned: number;
  hits: AiSearchHit[];
  durations: { fetch: number; llm: number; total: number };
};

const MAX_CANDIDATES = 120;

type LlmHit = { id: string; score: number; reason: string };

async function rankWithLlm(
  query: string,
  candidates: Array<{ id: string; text: string }>,
  limit: number,
): Promise<LlmHit[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY belum dikonfigurasi.");
  const system = `Anda adalah mesin pemeringkat dokumen arsip sekolah. Pengguna memberikan permintaan dalam bahasa alami. Anda mendapat daftar dokumen (id + ringkasan metadata). Tugas Anda memilih dokumen yang paling relevan dengan permintaan pengguna.

Aturan:
- Hanya kembalikan id yang BENAR-BENAR relevan dengan permintaan. Jika tidak ada yang relevan, kembalikan daftar kosong.
- Skor relevansi 0..1 (1.0 = sangat relevan).
- "reason" adalah satu kalimat singkat dalam Bahasa Indonesia, profesional, tanpa emoji, menjelaskan alasan dokumen tersebut direkomendasikan.
- Maksimum ${limit} hasil, urut dari paling relevan.
- Output HANYA JSON valid dengan bentuk: {"hits":[{"id":"...","score":0.92,"reason":"..."}]}`;

  const userPayload = {
    query,
    documents: candidates,
    max_results: limit,
  };

  const body = {
    model: "google/gemini-3-flash-preview",
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: `Permintaan: ${query}\n\nDaftar dokumen (JSON):\n${JSON.stringify(userPayload).slice(0, 90_000)}`,
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
    if (res.status === 429) throw new Error("Layanan AI sedang sibuk. Coba lagi sebentar lagi.");
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
  const hits = (parsed as { hits?: unknown }).hits;
  if (!Array.isArray(hits)) return [];
  const out: LlmHit[] = [];
  for (const h of hits) {
    if (!h || typeof h !== "object") continue;
    const o = h as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : null;
    const score = typeof o.score === "number" ? Math.max(0, Math.min(1, o.score)) : 0;
    const reason = typeof o.reason === "string" ? o.reason.slice(0, 280) : "";
    if (id) out.push({ id, score, reason });
  }
  return out.slice(0, limit);
}

export const aiSearchArsip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }): Promise<AiSearchResult> => {
    const t0 = Date.now();
    // Pull a recent slice of arsip. RLS enforces what the user can read.
    const { data: rows, error } = await context.supabase
      .from("arsip")
      .select(ARSIP_SELECT)
      .order("created_at", { ascending: false })
      .limit(MAX_CANDIDATES);
    if (error) throw new Error(`Gagal memuat arsip: ${error.message}`);
    const all = (rows ?? []).map((r) => mapArsipRow(r as ArsipDbRow));
    const tFetch = Date.now() - t0;

    if (all.length === 0) {
      return {
        query: data.query,
        totalScanned: 0,
        hits: [],
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
        `Status: ${a.status}`,
        a.deskripsi ? `Deskripsi: ${a.deskripsi}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    }));

    const tLlm = Date.now();
    const ranked = await rankWithLlm(data.query, candidates, data.limit);
    const llmMs = Date.now() - tLlm;

    const byId = new Map(all.map((a) => [a.id, a]));
    const hits: AiSearchHit[] = [];
    for (const r of ranked) {
      const a = byId.get(r.id);
      if (a) hits.push({ arsip: a, score: r.score, reason: r.reason });
    }
    return {
      query: data.query,
      totalScanned: all.length,
      hits,
      durations: { fetch: tFetch, llm: llmMs, total: Date.now() - t0 },
    };
  });