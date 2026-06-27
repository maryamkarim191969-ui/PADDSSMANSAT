// File constraints and labels for the AI Document Intelligence upload workspace.

export const MAX_FILES = 20;
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ACCEPTED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
  "image/png",
  "image/jpeg",
] as const;

export const ACCEPTED_EXT = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".txt",
  ".png",
  ".jpg",
  ".jpeg",
];

export const ACCEPT_ATTR = ACCEPTED_EXT.join(",");

export const STATUS_LABEL = {
  menunggu: "Menunggu",
  dianalisis: "Sedang Dianalisis",
  ocr: "OCR",
  ekstraksi: "Ekstraksi Metadata",
  perlu_review: "Perlu Review",
  siap_upload: "Siap Upload",
  sedang_upload: "Sedang Upload",
  berhasil: "Berhasil",
  gagal: "Gagal",
} as const;

export type UploadStatus = keyof typeof STATUS_LABEL;

export const TERMINAL_STATUS: UploadStatus[] = ["berhasil", "gagal"];

export const CONFIDENCE_THRESHOLD = {
  good: 0.85,
  warn: 0.6,
} as const;

export const RETENSI_OPTIONS = [
  "1 Tahun",
  "2 Tahun",
  "5 Tahun",
  "10 Tahun",
  "Permanen",
] as const;

export const STATUS_OPTIONS = ["Aktif", "Retensi", "Nonaktif"] as const;

export const JENIS_OPTIONS = ["Surat Masuk", "Surat Keluar", "Internal"] as const;

export function isImageMime(mime: string) {
  return mime.startsWith("image/");
}

export function isPdfMime(mime: string) {
  return mime === "application/pdf";
}
