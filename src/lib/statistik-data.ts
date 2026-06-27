import { ARSIP_DATA, KATEGORI_LIST, LOKASI_LIST, TAHUN_LIST, type Arsip } from "./arsip-data";

export { TAHUN_LIST };
export const BULAN_LIST = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export type StatistikFilter = {
  tahun?: number;
  bulan?: number; // 1-12
  kategori?: string;
};

export function filterArsip(filter: StatistikFilter): Arsip[] {
  return ARSIP_DATA.filter((a) => {
    if (filter.tahun && a.tahun !== filter.tahun) return false;
    if (filter.kategori && a.kategori !== filter.kategori) return false;
    if (filter.bulan) {
      const m = Number(a.tanggalUpload.slice(5, 7));
      if (m !== filter.bulan) return false;
    }
    return true;
  });
}

// Treat arsip > 3 years old as "retensi"; else "aktif"
export function isRetensi(a: Arsip): boolean {
  const currentYear = 2026;
  return currentYear - a.tahun >= 3 || a.status === "Diarsipkan";
}

export function getSummary(data: Arsip[]) {
  const total = data.length;
  const aktif = data.filter((a) => a.status === "Aktif" && !isRetensi(a)).length;
  const retensi = data.filter(isRetensi).length;
  const kategori = new Set(data.map((a) => a.kategori)).size;
  const lokasi = new Set(data.map((a) => a.lokasiFisik)).size;
  return { total, aktif, retensi, kategori, lokasi };
}

export function getMonthlyGrowth(data: Arsip[], tahun: number) {
  return BULAN_LIST.map((bln, i) => {
    const month = i + 1;
    const value = data.filter(
      (a) => a.tahun === tahun && Number(a.tanggalUpload.slice(5, 7)) === month,
    ).length;
    return { label: bln.slice(0, 3), value };
  });
}

export function getYearlyGrowth(data: Arsip[]) {
  const years = Array.from(new Set(data.map((a) => a.tahun))).sort();
  return years.map((y) => ({
    label: String(y),
    value: data.filter((a) => a.tahun === y).length,
  }));
}

export function getDailyGrowth(data: Arsip[], tahun: number, bulan: number) {
  const days: { label: string; value: number }[] = [];
  for (let d = 1; d <= 28; d++) {
    const value = data.filter(
      (a) =>
        a.tahun === tahun &&
        Number(a.tanggalUpload.slice(5, 7)) === bulan &&
        Number(a.tanggalUpload.slice(8, 10)) === d,
    ).length;
    days.push({ label: String(d), value });
  }
  return days;
}

export function getCategoryDistribution(data: Arsip[]) {
  return KATEGORI_LIST.map((name) => ({
    name,
    value: data.filter((a) => a.kategori === name).length,
  })).filter((d) => d.value > 0);
}

export function getStatusDistribution(data: Arsip[]) {
  return [
    { name: "Aktif", value: data.filter((a) => a.status === "Aktif" && !isRetensi(a)).length },
    { name: "Inaktif", value: data.filter((a) => a.status === "Inaktif").length },
    { name: "Retensi", value: data.filter(isRetensi).length },
  ].filter((d) => d.value > 0);
}

export function getTopCategory(data: Arsip[]) {
  return getCategoryDistribution(data).sort((a, b) => b.value - a.value).slice(0, 5);
}

export function getTopLocation(data: Arsip[]) {
  return LOKASI_LIST.map((name) => ({
    name,
    value: data.filter((a) => a.lokasiFisik === name).length,
  }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function getYearlyReport(data: Arsip[]) {
  const years = Array.from(new Set(data.map((a) => a.tahun))).sort((a, b) => b - a);
  return years.map((tahun) => {
    const rows = data.filter((a) => a.tahun === tahun);
    const total = rows.length;
    const aktif = rows.filter((a) => a.status === "Aktif" && !isRetensi(a)).length;
    const retensi = rows.filter(isRetensi).length;
    return {
      tahun,
      total,
      aktif,
      retensi,
      status: retensi > aktif ? ("Perlu Tinjauan" as const) : ("Sehat" as const),
    };
  });
}

export { KATEGORI_LIST, LOKASI_LIST };