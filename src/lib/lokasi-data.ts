export type LokasiStatus = "Aktif" | "Nonaktif";

export interface Lokasi {
  id: string;
  nama: string;
  kode: string;
  ruangan: string;
  rak: string;
  deskripsi: string;
  jumlahArsip: number;
  status: LokasiStatus;
  createdAt: string;
}

export const LOKASI_STATUS_LIST: LokasiStatus[] = ["Aktif", "Nonaktif"];

export const LOKASI_DATA: Lokasi[] = [];
