/**
 * Global retention policy. SINGLE SOURCE OF TRUTH for retention math,
 * shared between the Retensi module and the Dashboard Retention Alert.
 */
export const RETENTION_YEARS = 5;
/** Days before tanggal_retensi at which an arsip is flagged "Mendekati Retensi". */
export const RETENTION_ALERT_DAYS = 180;

export type RetensiStatusKey = "Aman" | "Mendekati Retensi" | "Kadaluarsa";

export function classifyRetention(sisaHari: number): RetensiStatusKey {
  if (sisaHari < 0) return "Kadaluarsa";
  if (sisaHari <= RETENTION_ALERT_DAYS) return "Mendekati Retensi";
  return "Aman";
}

export function computeTanggalRetensi(createdAtIso: string): string {
  const d = new Date(createdAtIso);
  d.setUTCFullYear(d.getUTCFullYear() + RETENTION_YEARS);
  return d.toISOString();
}

export function computeSisaHari(tanggalRetensiIso: string, now: Date = new Date()): number {
  return Math.floor(
    (new Date(tanggalRetensiIso).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
}
