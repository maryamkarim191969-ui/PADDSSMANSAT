import type {
  ArsipFormErrors,
  ArsipFormValues,
  ExtractedMetadata,
  MasterOption,
} from "../types";

export const DEFAULT_FORM: ArsipFormValues = {
  nomorSurat: "",
  judul: "",
  kategori: "",
  tahun: String(new Date().getFullYear()),
  tanggalSurat: "",
  lokasiFisik: "",
  deskripsi: "",
  masaRetensi: "5 Tahun",
  status: "Aktif",
};

function matchMaster(value: string | null, options: MasterOption[]): string {
  if (!value) return "";
  const target = value.trim().toLowerCase();
  const hit = options.find((o) => o.nama.trim().toLowerCase() === target);
  return hit ? hit.nama : "";
}

function yearFromDate(d: string | null): string {
  if (!d) return "";
  const y = Number(d.slice(0, 4));
  if (Number.isFinite(y) && y > 1900 && y < 2200) return String(y);
  return "";
}

/**
 * Build the SIPASTERA form values from AI-extracted metadata.
 * Only fields actually present in the document are filled — missing fields
 * stay empty so the operator can complete them manually.
 *
 * Status is NEVER touched by AI (operator-controlled per spec).
 * Tanggal is left empty when the AI didn't find one.
 */
export function buildFormFromMetadata(
  meta: ExtractedMetadata,
  masters: { kategori: MasterOption[]; lokasi: MasterOption[] },
): { form: ArsipFormValues; aiFilled: Partial<Record<keyof ArsipFormValues, boolean>> } {
  const form: ArsipFormValues = { ...DEFAULT_FORM };
  const aiFilled: Partial<Record<keyof ArsipFormValues, boolean>> = {};

  const judul = (meta.judul.value as string | null) ?? "";
  if (judul) {
    form.judul = judul;
    aiFilled.judul = true;
  }

  const nomor = (meta.nomorSurat.value as string | null) ?? "";
  if (nomor) {
    form.nomorSurat = nomor;
    aiFilled.nomorSurat = true;
  }

  const kategoriRaw = (meta.kategori.value as string | null) ?? "";
  const kategoriMatch = matchMaster(kategoriRaw, masters.kategori);
  if (kategoriMatch) {
    form.kategori = kategoriMatch;
    aiFilled.kategori = true;
  }

  const lokasiRaw = (meta.lokasiFisik.value as string | null) ?? "";
  const lokasiMatch = matchMaster(lokasiRaw, masters.lokasi);
  if (lokasiMatch) {
    form.lokasiFisik = lokasiMatch;
    aiFilled.lokasiFisik = true;
  }

  const tanggal =
    (meta.tanggalSurat.value as string | null) ??
    (meta.tanggalDokumen.value as string | null) ??
    null;
  if (tanggal && /^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
    form.tanggalSurat = tanggal;
    aiFilled.tanggalSurat = true;
    const y = yearFromDate(tanggal);
    if (y) {
      form.tahun = y;
      aiFilled.tahun = true;
    }
  }

  const ringkasan = (meta.ringkasan.value as string | null) ?? "";
  if (ringkasan) {
    form.deskripsi = ringkasan;
    aiFilled.deskripsi = true;
  }

  return { form, aiFilled };
}

export function validateForm(f: ArsipFormValues): ArsipFormErrors {
  const errs: ArsipFormErrors = {};
  if (!f.nomorSurat.trim()) errs.nomorSurat = "Nomor surat wajib diisi";
  if (!f.judul.trim()) errs.judul = "Judul arsip wajib diisi";
  if (!f.kategori.trim()) errs.kategori = "Kategori wajib dipilih";
  if (!f.tahun.trim()) errs.tahun = "Tahun wajib diisi";
  else {
    const y = Number(f.tahun);
    if (!Number.isFinite(y) || y < 1900 || y > 2200)
      errs.tahun = "Tahun tidak valid";
  }
  return errs;
}
