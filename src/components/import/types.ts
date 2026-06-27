export const IMPORT_KATEGORI = [
  "Administrasi",
  "Keuangan",
  "Kesiswaan",
  "Kepegawaian",
  "Kurikulum",
  "Lainnya",
] as const;

export const IMPORT_LOKASI = [
  "Lemari A1",
  "Lemari A2",
  "Rak B1",
  "Rak B2",
  "Gudang Arsip",
] as const;

export type ImportStatus = "valid" | "invalid" | "imported";

export type ImportItem = {
  id: string;
  fileName: string;
  size: number;
  format: string;
  status: ImportStatus;
  nomorSurat: string;
  judul: string;
  tahun: string;
  kategori: string;
  lokasiFisik: string;
  error?: string;
};

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const KATEGORI_HINTS: Array<[RegExp, string]> = [
  [/sk|surat.?keputusan|tugas|pegawai|guru|staff/i, "Kepegawaian"],
  [/keu|anggaran|bos|spj|rab|bayar/i, "Keuangan"],
  [/siswa|ppdb|osis|kesiswaan|raport/i, "Kesiswaan"],
  [/kurikulum|silabus|rpp|ujian|kbm/i, "Kurikulum"],
  [/admin|umum|edaran|notulen|disposisi/i, "Administrasi"],
];

/**
 * Parse a file name like "001_SK_Guru_2025.pdf" into metadata.
 * - First numeric segment → nomorSurat
 * - 4-digit number 1900–2099 → tahun
 * - Remaining tokens → judul (joined with spaces, original casing)
 */
export function parseFileName(fileName: string): {
  nomorSurat: string;
  judul: string;
  tahun: string;
  kategori: string;
} {
  const base = fileName.replace(/\.[^.]+$/, "");
  const tokens = base.split(/[_\-\s]+/).filter(Boolean);

  let nomorSurat = "";
  let tahun = "";
  const judulTokens: string[] = [];

  for (const t of tokens) {
    if (!tahun && /^(19|20)\d{2}$/.test(t)) {
      tahun = t;
      continue;
    }
    if (!nomorSurat && /^\d{1,5}$/.test(t)) {
      nomorSurat = t;
      continue;
    }
    judulTokens.push(t);
  }

  const judul = judulTokens.join(" ").trim() || base;
  let kategori = "Lainnya";
  for (const [re, cat] of KATEGORI_HINTS) {
    if (re.test(base)) {
      kategori = cat;
      break;
    }
  }
  if (!tahun) tahun = String(new Date().getFullYear());
  if (!nomorSurat) nomorSurat = "—";

  return { nomorSurat, judul, tahun, kategori };
}

export function buildItemFromFile(file: File): ImportItem {
  const meta = parseFileName(file.name);
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  return {
    id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
    fileName: file.name,
    size: file.size,
    format: file.name.split(".").pop()?.toUpperCase() ?? "—",
    status: isPdf ? "valid" : "invalid",
    error: isPdf ? undefined : "Format bukan PDF",
    lokasiFisik: "Lemari A1",
    ...meta,
  };
}

/**
 * Placeholder ZIP extractor.
 * Real extraction will be wired in a later sprint; for now no items are
 * produced so the UI shows its empty state instead of simulated data.
 */
export function simulateZipExtract(_zip: File): ImportItem[] {
  return [];
}

