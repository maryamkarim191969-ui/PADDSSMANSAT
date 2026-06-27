import { ARSIP_DATA, type Arsip } from "./arsip-data";

export type RetensiStatus = "Aman" | "Mendekati Retensi" | "Kadaluarsa";

export type RetensiRow = Arsip & {
  tanggalRetensi: string; // ISO date
  retensiStatus: RetensiStatus;
  sisaHari: number;
};

// Retention period: 5 years after upload date
const RETENSI_TAHUN = 5;
const TODAY = new Date("2026-06-24");

function classify(sisa: number): RetensiStatus {
  if (sisa < 0) return "Kadaluarsa";
  if (sisa <= 180) return "Mendekati Retensi";
  return "Aman";
}

function addYears(iso: string, years: number): string {
  const d = new Date(iso);
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d.toISOString().slice(0, 10);
}

export const RETENSI_DATA: RetensiRow[] = ARSIP_DATA.map((a) => {
  const tanggalRetensi = addYears(a.tanggalUpload, RETENSI_TAHUN);
  const sisaHari = Math.floor(
    (new Date(tanggalRetensi).getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24),
  );
  return { ...a, tanggalRetensi, sisaHari, retensiStatus: classify(sisaHari) };
});

export function getRetensiSummary(rows: RetensiRow[]) {
  return {
    total: rows.length,
    mendekati: rows.filter((r) => r.retensiStatus === "Mendekati Retensi").length,
    kadaluarsa: rows.filter((r) => r.retensiStatus === "Kadaluarsa").length,
    aktif: rows.filter((r) => r.retensiStatus === "Aman").length,
  };
}

export const RETENSI_STATUS_LIST: RetensiStatus[] = ["Aman", "Mendekati Retensi", "Kadaluarsa"];