export type UploadStatus = "Aktif" | "Retensi" | "Nonaktif";

export const UPLOAD_KATEGORI = [
  "Administrasi",
  "Keuangan",
  "Kesiswaan",
  "Kepegawaian",
  "Kurikulum",
  "Lainnya",
] as const;

export const UPLOAD_LOKASI = [
  "Lemari A1",
  "Lemari A2",
  "Rak B1",
  "Rak B2",
  "Gudang Arsip",
] as const;

export const UPLOAD_STATUS: UploadStatus[] = ["Aktif", "Retensi", "Nonaktif"];

export const UPLOAD_RETENSI = [
  "1 Tahun",
  "2 Tahun",
  "5 Tahun",
  "10 Tahun",
  "Permanen",
] as const;

export type UploadForm = {
  nomorSurat: string;
  judul: string;
  kategori: string;
  tahun: string;
  tanggalSurat: string;
  lokasiFisik: string;
  deskripsi: string;
  masaRetensi: string;
  status: UploadStatus;
  file: File | null;
};

export const DEFAULT_FORM: UploadForm = {
  nomorSurat: "",
  judul: "",
  kategori: "",
  tahun: String(new Date().getFullYear()),
  tanggalSurat: "",
  lokasiFisik: "",
  deskripsi: "",
  masaRetensi: "5 Tahun",
  status: "Aktif",
  file: null,
};

export type UploadErrors = Partial<Record<keyof UploadForm, string>>;

export function validateUpload(f: UploadForm): UploadErrors {
  const e: UploadErrors = {};
  if (!f.nomorSurat.trim()) e.nomorSurat = "Nomor surat wajib diisi";
  if (!f.judul.trim()) e.judul = "Judul arsip wajib diisi";
  if (!f.kategori) e.kategori = "Kategori wajib dipilih";
  if (!f.tahun) e.tahun = "Tahun wajib diisi";
  if (!f.file) e.file = "File PDF wajib diunggah";
  return e;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
