export const dashboardStats = [
  {
    key: "total",
    label: "Total Arsip",
    value: 0,
    hint: "Belum ada arsip",
    icon: "folder",
    tone: "blue" as const,
  },
  {
    key: "aktif",
    label: "Arsip Aktif",
    value: 0,
    hint: "Belum ada arsip aktif",
    icon: "check",
    tone: "green" as const,
  },
  {
    key: "kategori",
    label: "Total Kategori",
    value: 0,
    hint: "Belum ada kategori",
    icon: "tag",
    tone: "amber" as const,
  },
  {
    key: "qr",
    label: "QR Code Aktif",
    value: 0,
    hint: "Belum ada QR Code",
    icon: "qr",
    tone: "violet" as const,
  },
];

export const growthData = [
  { month: "Jan", value: 0 },
  { month: "Feb", value: 0 },
  { month: "Mar", value: 0 },
  { month: "Apr", value: 0 },
  { month: "Mei", value: 0 },
  { month: "Jun", value: 0 },
];

export type ArsipRow = {
  title: string;
  code: string;
  jenis: "Surat Keluar" | "Surat Masuk";
  tahun: number;
  status: "Aktif" | "Inaktif";
};

export const arsipTerbaru: ArsipRow[] = [];

export const aktivitasTerkini: Array<{ title: string; user: string; time: string }> = [];
