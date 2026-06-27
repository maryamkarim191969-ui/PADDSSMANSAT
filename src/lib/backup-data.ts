export type BackupItem = {
  id: string;
  name: string;
  date: string;
  size: string;
  type: "Manual" | "Auto Harian" | "Auto Mingguan" | "Auto Bulanan";
  status: "Berhasil" | "Gagal" | "Proses";
};

export const initialBackups: BackupItem[] = [];

export const storageInfo = {
  used: 0,
  total: 0,
  unit: "GB",
};
