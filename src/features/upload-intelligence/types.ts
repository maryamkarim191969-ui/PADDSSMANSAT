import type { UploadStatus } from "./constants";

export type ConfidenceLevel = "good" | "warn" | "low" | "missing";

export type MetadataField =
  | "judul"
  | "nomorSurat"
  | "tanggalSurat"
  | "tanggalDokumen"
  | "pengirim"
  | "penerima"
  | "instansi"
  | "perihal"
  | "jenis"
  | "kategori"
  | "lokasiFisik"
  | "ringkasan"
  | "keywords";

export type ExtractedField<T = string> = {
  value: T | null;
  confidence: number;
  source: "document" | "manual" | "missing";
};

export type ExtractedMetadata = {
  judul: ExtractedField;
  nomorSurat: ExtractedField;
  tanggalSurat: ExtractedField;
  tanggalDokumen: ExtractedField;
  pengirim: ExtractedField;
  penerima: ExtractedField;
  instansi: ExtractedField;
  perihal: ExtractedField;
  jenis: ExtractedField;
  kategori: ExtractedField;
  lokasiFisik: ExtractedField;
  ringkasan: ExtractedField;
  keywords: ExtractedField<string[]>;
};

export type AnalysisDurations = {
  parse: number;
  llm: number;
  total: number;
};

export type ArsipStatusForm = "Aktif" | "Retensi" | "Nonaktif";

export type ArsipJenisForm = "Surat Masuk" | "Surat Keluar" | "Internal";

/**
 * PADDS SMANSAT form values. This is the single source of truth for what gets
 * saved to the arsip table. AI extraction prefills these; the operator can
 * edit anything before saving.
 */
export type ArsipFormValues = {
  nomorSurat: string;
  judul: string;
  kategori: string;
  jenis: ArsipJenisForm;
  tahun: string;
  tanggalSurat: string; // YYYY-MM-DD, "" when empty
  lokasiFisik: string;
  deskripsi: string;
  masaRetensi: string;
  status: ArsipStatusForm;
};

export type ArsipFormErrors = Partial<Record<keyof ArsipFormValues, string>>;

export type QueuedFile = {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  metadata?: ExtractedMetadata;
  durations?: AnalysisDurations;
  form?: ArsipFormValues;
  /** Tracks which form fields the AI pre-filled (vs. operator edits). */
  aiFilled?: Partial<Record<keyof ArsipFormValues, boolean>>;
  arsipId?: string;
};

export type WorkspaceSummary = {
  total: number;
  berhasil: number;
  gagal: number;
  perluReview: number;
  durasiAnalisisMs: number;
  durasiUploadMs: number;
};

export type MasterOption = { id: string; nama: string };
