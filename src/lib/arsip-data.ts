export type ArsipStatus = "Aktif" | "Inaktif" | "Diarsipkan";
export type ArsipJenis = "Surat Masuk" | "Surat Keluar" | "Internal";

export type Arsip = {
  id: string;
  nomorSurat: string;
  judul: string;
  kategori: string;
  jenis: ArsipJenis;
  tahun: number;
  lokasiFisik: string;
  tanggalUpload: string; // ISO
  status: ArsipStatus;
  deskripsi: string;
  pdfUrl: string;
};

export const KATEGORI_LIST: string[] = [];
export const LOKASI_LIST: string[] = [];

export const STATUS_LIST: ArsipStatus[] = ["Aktif", "Inaktif", "Diarsipkan"];
export const JENIS_LIST: ArsipJenis[] = ["Surat Masuk", "Surat Keluar", "Internal"];

export const ARSIP_DATA: Arsip[] = [];

export const TAHUN_LIST: number[] = [];
