import type { Arsip, ArsipJenis, ArsipStatus } from "@/lib/arsip-data";

/** Raw row shape we select from `public.arsip`. */
export type ArsipDbRow = {
  id: string;
  nomor_surat: string;
  judul: string;
  kategori: string;
  jenis: string;
  tahun: number;
  lokasi_fisik: string | null;
  status: string;
  deskripsi: string | null;
  pdf_url: string | null;
  storage_path: string | null;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
  updated_at?: string | null;
};

export const ARSIP_SELECT =
  "id, nomor_surat, judul, kategori, jenis, tahun, lokasi_fisik, status, deskripsi, pdf_url, storage_path, file_name, mime_type, file_size, created_at, updated_at";

export function mapArsipRow(row: ArsipDbRow): Arsip {
  return {
    id: row.id,
    nomorSurat: row.nomor_surat,
    judul: row.judul,
    kategori: row.kategori,
    jenis: (row.jenis as ArsipJenis) ?? "Internal",
    tahun: row.tahun,
    lokasiFisik: row.lokasi_fisik ?? "",
    tanggalUpload: row.created_at,
    status: (row.status as ArsipStatus) ?? "Aktif",
    deskripsi: row.deskripsi ?? "",
    pdfUrl: row.pdf_url ?? "",
  };
}
