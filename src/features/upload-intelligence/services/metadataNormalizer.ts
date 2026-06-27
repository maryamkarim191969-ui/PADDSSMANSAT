import type { ExtractedField, ExtractedMetadata } from "../types";

/**
 * Build an ExtractedField from a raw LLM response. The LLM is instructed to
 * return null / empty when a value isn't present in the document — we never
 * fabricate confidence numbers for missing fields.
 */
export function buildField<T>(
  value: T | null | undefined,
  confidence: number | null | undefined,
): ExtractedField<T> {
  const isEmpty =
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0);

  if (isEmpty) {
    return { value: null, confidence: 0, source: "missing" };
  }
  const clamped = Math.max(0, Math.min(1, Number(confidence ?? 0)));
  return { value, confidence: clamped, source: "document" };
}

export function emptyMetadata(): ExtractedMetadata {
  const empty = buildField<string>(null, 0);
  return {
    judul: empty,
    nomorSurat: empty,
    tanggalSurat: empty,
    tanggalDokumen: empty,
    pengirim: empty,
    penerima: empty,
    instansi: empty,
    perihal: empty,
    jenis: empty,
    kategori: empty,
    lokasiFisik: empty,
    ringkasan: empty,
    keywords: buildField<string[]>(null, 0),
  };
}

export function classifyConfidence(
  field: ExtractedField<unknown>,
): "good" | "warn" | "low" | "missing" {
  if (field.source === "missing" || field.value === null) return "missing";
  if (field.confidence >= 0.85) return "good";
  if (field.confidence >= 0.6) return "warn";
  return "low";
}

/**
 * Aggregate signal whether the file is ready for upload or requires
 * operator review. Anything below "good" on a required field triggers review.
 */
const REQUIRED_FIELDS: Array<keyof ExtractedMetadata> = [
  "judul",
  "nomorSurat",
  "kategori",
];

export function needsReview(metadata: ExtractedMetadata): boolean {
  for (const key of REQUIRED_FIELDS) {
    const f = metadata[key];
    if (f.source === "missing" || f.confidence < 0.85) return true;
  }
  return false;
}
