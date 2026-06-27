import { ARSIP_DATA, type Arsip } from "@/lib/arsip-data";

export const RECENT_KEY = "sipastera.search.recent";
export const MAX_RECENT = 6;

export const POPULAR_SEARCHES: string[] = [];

export const AI_EXAMPLES: string[] = [];

export function buildSuggestions(query: string, limit = 6): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const pool = new Set<string>();
  for (const a of ARSIP_DATA) {
    if (pool.size >= limit) break;
    if (a.judul.toLowerCase().includes(q)) pool.add(a.judul);
  }
  for (const a of ARSIP_DATA) {
    if (pool.size >= limit) break;
    if (a.nomorSurat.toLowerCase().includes(q)) pool.add(a.nomorSurat);
  }
  for (const k of POPULAR_SEARCHES) {
    if (pool.size >= limit) break;
    if (k.toLowerCase().includes(q)) pool.add(k);
  }
  return Array.from(pool).slice(0, limit);
}

export type SearchSort = "newest" | "oldest" | "az" | "za";

export function runSearch(opts: {
  query: string;
  kategori: string;
  tahun: string;
  status: string;
  lokasi: string;
  sort: SearchSort;
}): Arsip[] {
  const q = opts.query.trim().toLowerCase();
  let rows = ARSIP_DATA.filter((r) => {
    if (opts.kategori !== "all" && r.kategori !== opts.kategori) return false;
    if (opts.tahun !== "all" && String(r.tahun) !== opts.tahun) return false;
    if (opts.status !== "all" && r.status !== opts.status) return false;
    if (opts.lokasi !== "all" && r.lokasiFisik !== opts.lokasi) return false;
    if (!q) return true;
    return (
      r.judul.toLowerCase().includes(q) ||
      r.nomorSurat.toLowerCase().includes(q) ||
      r.kategori.toLowerCase().includes(q) ||
      r.lokasiFisik.toLowerCase().includes(q) ||
      String(r.tahun).includes(q)
    );
  });
  rows = [...rows].sort((a, b) => {
    switch (opts.sort) {
      case "oldest":
        return +new Date(a.tanggalUpload) - +new Date(b.tanggalUpload);
      case "az":
        return a.judul.localeCompare(b.judul);
      case "za":
        return b.judul.localeCompare(a.judul);
      case "newest":
      default:
        return +new Date(b.tanggalUpload) - +new Date(a.tanggalUpload);
    }
  });
  return rows;
}

export function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function saveRecent(query: string): string[] {
  if (typeof window === "undefined") return [];
  const q = query.trim();
  if (!q) return loadRecent();
  const cur = loadRecent().filter((x) => x.toLowerCase() !== q.toLowerCase());
  const next = [q, ...cur].slice(0, MAX_RECENT);
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function clearRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    window.localStorage.removeItem(RECENT_KEY);
  } catch {
    /* ignore */
  }
  return [];
}
