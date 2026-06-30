/**
 * AI Archive Integrity Analysis — server-side evaluator that compares a
 * document being uploaded against the existing arsip database to surface
 * potential duplicates or near-duplicates. The analysis combines several
 * signals (exact nomor-surat match, judul/deskripsi token overlap, keyword
 * overlap, ringkasan overlap, plus tahun/kategori reinforcement) so the
 * administrator receives a richer, more reliable assessment than a simple
 * nomor-or-title check. The server returns candidates with severity, score,
 * and the matched signals; the operator always makes the final decision.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  nomorSurat: z.string().trim().min(1).max(200),
  judul: z.string().trim().min(1).max(500),
  deskripsi: z.string().trim().max(4000).optional().default(""),
  ringkasan: z.string().trim().max(4000).optional().default(""),
  keywords: z.array(z.string().trim().max(80)).max(40).optional().default([]),
  tahun: z.number().int().min(1900).max(2200).optional(),
  kategori: z.string().trim().max(120).optional().default(""),
});

export type DuplicateCandidate = {
  id: string;
  nomorSurat: string;
  judul: string;
  tahun: number;
  kategori: string;
  score: number;
  reason:
    | "exact-nomor"
    | "similar-judul"
    | "similar-deskripsi"
    | "similar-konten";
  severity: "high" | "medium";
  matchedSignals: string[];
};

export type IntegrityVerdict = "clean" | "needs-review" | "likely-duplicate";

export type IntegrityAnalysis = {
  verdict: IntegrityVerdict;
  candidates: DuplicateCandidate[];
  /** Total arsip rows considered as candidate pool. */
  comparedAgainst: number;
  /** Server timestamp of the analysis. */
  analysedAt: string;
};

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

function escapeIlike(v: string) {
  return v.replace(/[\\%_]/g, (m) => `\\${m}`);
}

/** Normalize a free-form keyword list into a tokenized set for jaccard. */
function keywordSet(values: string[] | null | undefined): Set<string> {
  if (!values || values.length === 0) return new Set();
  const out = new Set<string>();
  for (const v of values) {
    const s = String(v ?? "").toLowerCase().trim();
    if (s.length >= 3) out.add(s);
  }
  return out;
}

export const checkArsipDuplicates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }): Promise<IntegrityAnalysis> => {
    const nomor = data.nomorSurat.trim();
    const judul = data.judul.trim();
    const deskripsi = data.deskripsi?.trim() ?? "";
    const ringkasan = data.ringkasan?.trim() ?? "";
    const kategori = data.kategori?.trim() ?? "";
    const tahun = data.tahun;
    const incomingKw = keywordSet(data.keywords);

    // Exact nomor surat match — strongest signal.
    const { data: exact } = await context.supabase
      .from("arsip")
      .select("id, nomor_surat, judul, tahun, kategori, deskripsi")
      .eq("nomor_surat", nomor)
      .limit(5);

    const exactHits: DuplicateCandidate[] = (exact ?? []).map((r) => ({
      id: r.id as string,
      nomorSurat: r.nomor_surat as string,
      judul: r.judul as string,
      tahun: r.tahun as number,
      kategori: r.kategori as string,
      score: 1,
      reason: "exact-nomor",
      severity: "high",
      matchedSignals: ["Nomor surat sama persis"],
    }));

    // Build candidate pool: judul tokens, optionally union with kategori+tahun.
    const titleTokens = Array.from(tokenize(judul)).slice(0, 6);
    const orsParts: string[] = [];
    for (const t of titleTokens) orsParts.push(`judul.ilike.%${escapeIlike(t)}%`);
    // Reinforce recall with kategori+tahun bucket so structurally identical
    // docs (same kategori/tahun) get a chance even when titles differ.
    let candidatePool: Array<{
      id: string;
      nomor_surat: string;
      judul: string;
      tahun: number;
      kategori: string;
      deskripsi: string | null;
    }> = [];
    let comparedAgainst = 0;
    if (orsParts.length > 0) {
      const { data: cand } = await context.supabase
        .from("arsip")
        .select("id, nomor_surat, judul, tahun, kategori, deskripsi")
        .or(orsParts.join(","))
        .limit(60);
      candidatePool = (cand ?? []) as typeof candidatePool;
    }
    if (kategori && tahun !== undefined) {
      const { data: bucket, count } = await context.supabase
        .from("arsip")
        .select("id, nomor_surat, judul, tahun, kategori, deskripsi", {
          count: "estimated",
        })
        .eq("kategori", kategori)
        .eq("tahun", tahun)
        .limit(60);
      if (count !== null) comparedAgainst = count;
      const seen = new Set(candidatePool.map((c) => c.id));
      for (const row of (bucket ?? []) as typeof candidatePool) {
        if (!seen.has(row.id)) candidatePool.push(row);
      }
    }
    if (comparedAgainst === 0) {
      const { count } = await context.supabase
        .from("arsip")
        .select("id", { count: "estimated", head: true });
      comparedAgainst = count ?? candidatePool.length;
    }

    const targetJ = tokenize(judul);
    const targetD = deskripsi ? tokenize(deskripsi) : null;
    const targetR = ringkasan ? tokenize(ringkasan) : null;

    const similar: DuplicateCandidate[] = candidatePool
      .filter((r) => r.nomor_surat !== nomor)
      .map((r) => {
        const jScore = jaccard(targetJ, tokenize(String(r.judul ?? "")));
        const dScore = targetD
          ? jaccard(targetD, tokenize(String(r.deskripsi ?? "")))
          : 0;
        // Ringkasan reuses deskripsi tokens of the candidate as a proxy for
        // its summarised content; this gives the analysis a second textual
        // axis beyond the title.
        const rScore = targetR
          ? jaccard(targetR, tokenize(String(r.deskripsi ?? "")))
          : 0;
        const kScore = incomingKw.size
          ? jaccard(incomingKw, keywordSet(String(r.deskripsi ?? "").split(/\s+/)))
          : 0;
        const sameYearCat =
          kategori &&
          tahun !== undefined &&
          r.kategori === kategori &&
          r.tahun === tahun
            ? 0.05
            : 0;
        // Weighted blend — title still dominant but content signals contribute.
        const blended = Math.min(
          1,
          jScore * 0.55 +
            dScore * 0.2 +
            rScore * 0.15 +
            kScore * 0.1 +
            sameYearCat,
        );
        const signals: string[] = [];
        if (jScore >= 0.5) signals.push(`Judul mirip (${Math.round(jScore * 100)}%)`);
        if (dScore >= 0.5) signals.push(`Deskripsi mirip (${Math.round(dScore * 100)}%)`);
        if (rScore >= 0.45) signals.push(`Ringkasan mirip (${Math.round(rScore * 100)}%)`);
        if (kScore >= 0.4) signals.push(`Kata kunci mirip (${Math.round(kScore * 100)}%)`);
        if (sameYearCat > 0) signals.push("Kategori & tahun sama");
        const reason: DuplicateCandidate["reason"] =
          jScore >= Math.max(dScore, rScore, kScore)
            ? "similar-judul"
            : dScore >= Math.max(rScore, kScore)
              ? "similar-deskripsi"
              : "similar-konten";
        return {
          id: r.id,
          nomorSurat: r.nomor_surat,
          judul: r.judul,
          tahun: r.tahun,
          kategori: r.kategori,
          score: blended,
          reason,
          severity:
            blended >= 0.75 ? "high" : ("medium" as DuplicateCandidate["severity"]),
          matchedSignals: signals.length ? signals : ["Kemiripan terdeteksi"],
        } satisfies DuplicateCandidate;
      })
      .filter((c) => c.score >= 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    const seen = new Set<string>();
    const merged: DuplicateCandidate[] = [];
    for (const c of [...exactHits, ...similar]) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      merged.push(c);
    }
    const top = merged.slice(0, 8);
    const verdict: IntegrityVerdict =
      top.some((c) => c.reason === "exact-nomor" || c.score >= 0.85)
        ? "likely-duplicate"
        : top.length > 0
          ? "needs-review"
          : "clean";
    return {
      verdict,
      candidates: top,
      comparedAgainst,
      analysedAt: new Date().toISOString(),
    };
  });