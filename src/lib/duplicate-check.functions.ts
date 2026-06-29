/**
 * AI Duplicate Detection — pre-save sanity check that runs before the
 * upload flow commits a new arsip. Returns the most likely duplicate
 * candidates (exact nomor-surat match or high judul/deskripsi overlap)
 * so the operator can confirm or cancel without leaving the form.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  nomorSurat: z.string().trim().min(1).max(200),
  judul: z.string().trim().min(1).max(500),
  deskripsi: z.string().trim().max(4000).optional().default(""),
});

export type DuplicateCandidate = {
  id: string;
  nomorSurat: string;
  judul: string;
  tahun: number;
  kategori: string;
  score: number;
  reason: "exact-nomor" | "similar-judul" | "similar-deskripsi";
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

export const checkArsipDuplicates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }): Promise<DuplicateCandidate[]> => {
    const nomor = data.nomorSurat.trim();
    const judul = data.judul.trim();
    const deskripsi = data.deskripsi?.trim() ?? "";

    // Exact nomor surat match — strongest signal.
    const { data: exact } = await context.supabase
      .from("arsip")
      .select("id, nomor_surat, judul, tahun, kategori")
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
    }));

    // Similar judul — ILIKE on a few leading tokens for cheap candidate list.
    const tokens = Array.from(tokenize(judul)).slice(0, 4);
    let similar: DuplicateCandidate[] = [];
    if (tokens.length > 0) {
      const ors = tokens
        .map((t) => `judul.ilike.%${escapeIlike(t)}%`)
        .join(",");
      const { data: cand } = await context.supabase
        .from("arsip")
        .select("id, nomor_surat, judul, tahun, kategori, deskripsi")
        .or(ors)
        .limit(30);
      const targetJ = tokenize(judul);
      const targetD = deskripsi ? tokenize(deskripsi) : null;
      similar = (cand ?? [])
        .filter((r) => r.nomor_surat !== nomor)
        .map((r) => {
          const jScore = jaccard(targetJ, tokenize(String(r.judul ?? "")));
          const dScore = targetD
            ? jaccard(targetD, tokenize(String(r.deskripsi ?? "")))
            : 0;
          const score = Math.max(jScore, dScore);
          const reason: DuplicateCandidate["reason"] =
            jScore >= dScore ? "similar-judul" : "similar-deskripsi";
          return {
            id: r.id as string,
            nomorSurat: r.nomor_surat as string,
            judul: r.judul as string,
            tahun: r.tahun as number,
            kategori: r.kategori as string,
            score,
            reason,
          };
        })
        .filter((c) => c.score >= 0.55)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    }

    const seen = new Set<string>();
    const merged: DuplicateCandidate[] = [];
    for (const c of [...exactHits, ...similar]) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      merged.push(c);
    }
    return merged.slice(0, 5);
  });