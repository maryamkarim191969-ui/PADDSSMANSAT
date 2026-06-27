export type LogAktivitasJenis = "Login" | "Upload" | "Edit" | "Hapus" | "Lihat" | "Export";
export type LogStatus = "Berhasil" | "Gagal";
export type LogModul =
  | "Auth"
  | "Arsip"
  | "Kategori"
  | "Lokasi Fisik"
  | "Upload"
  | "Import"
  | "Pengaturan"
  | "Statistik";

export type LogEntry = {
  id: string;
  user: string;
  role: string;
  aktivitas: string;
  jenis: LogAktivitasJenis;
  modul: LogModul;
  waktu: string; // ISO
  status: LogStatus;
  ip: string;
  detail: string;
};

export const LOG_DATA: LogEntry[] = [];

export const LOG_USER_LIST: string[] = [];
export const LOG_MODUL_LIST: LogModul[] = [
  "Auth", "Arsip", "Kategori", "Lokasi Fisik", "Upload", "Import", "Pengaturan", "Statistik",
];
export const LOG_JENIS_LIST: LogAktivitasJenis[] = ["Login", "Upload", "Edit", "Hapus", "Lihat", "Export"];

export function getLogSummary(rows: LogEntry[]) {
  return {
    total: rows.length,
    login: rows.filter((r) => r.jenis === "Login").length,
    upload: rows.filter((r) => r.jenis === "Upload").length,
    edit: rows.filter((r) => r.jenis === "Edit").length,
    hapus: rows.filter((r) => r.jenis === "Hapus").length,
  };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function formatWaktu(iso: string): string {
  const d = new Date(iso);
  const bln = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${d.getUTCDate()} ${bln[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}
