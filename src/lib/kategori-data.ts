export type KategoriStatus = "Aktif" | "Nonaktif";

export interface Kategori {
  id: string;
  nama: string;
  kode: string;
  deskripsi: string;
  jumlahArsip: number;
  status: KategoriStatus;
  createdAt: string; // ISO
}

export const KATEGORI_STATUS_LIST: KategoriStatus[] = ["Aktif", "Nonaktif"];

export const KATEGORI_DATA: Kategori[] = [];
