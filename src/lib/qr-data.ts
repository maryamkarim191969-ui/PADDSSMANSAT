export type QRStatus = "Aktif" | "Nonaktif";

export type QRHistoryAction = "Dibuat" | "Diunduh" | "Discan" | "Dinonaktifkan" | "Diaktifkan" | "Regenerasi";

export type QRHistoryItem = {
  id: string;
  action: QRHistoryAction;
  at: string; // ISO
  by?: string;
  note?: string;
};

export type QRItem = {
  id: string;
  nomorSurat: string;
  namaArsip: string;
  publicLink: string;
  status: QRStatus;
  totalScan: number;
  scanToday: number;
  scanWeek: number;
  scanMonth: number;
  createdAt: string; // ISO
  lastScanAt: string | null; // ISO
  history: QRHistoryItem[];
  // 7-day scan series for sparkline
  series: number[];
};

export const initialQR: QRItem[] = [];

export function qrImageUrl(data: string, size = 320) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=4&data=${encodeURIComponent(data)}`;
}

export function qrSvgUrl(data: string, size = 320) {
  return `https://api.qrserver.com/v1/create-qr-code/?format=svg&size=${size}x${size}&margin=4&data=${encodeURIComponent(data)}`;
}

export function formatDateID(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
