import {
  ACCEPTED_EXT,
  ACCEPTED_MIME,
  MAX_FILES,
  MAX_FILE_SIZE_BYTES,
} from "../constants";

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

const ACCEPTED_MIME_SET = new Set<string>(ACCEPTED_MIME);
const ACCEPTED_EXT_SET = new Set(ACCEPTED_EXT.map((e) => e.toLowerCase()));

export function getFileExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx === -1 ? "" : name.slice(idx).toLowerCase();
}

export function isAcceptedFile(file: File): boolean {
  if (file.type && ACCEPTED_MIME_SET.has(file.type)) return true;
  // Some browsers report empty MIME for .docx etc. Fall back to extension.
  return ACCEPTED_EXT_SET.has(getFileExtension(file.name));
}

export function validateSingleFile(file: File): ValidationResult {
  if (!isAcceptedFile(file)) {
    return {
      ok: false,
      reason: `Format tidak didukung. Gunakan ${ACCEPTED_EXT.join(", ")}.`,
    };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      reason: `Ukuran melebihi batas ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`,
    };
  }
  if (file.size === 0) {
    return { ok: false, reason: "File kosong." };
  }
  return { ok: true };
}

export function validateBatch(
  incoming: File[],
  existingCount: number,
): { accepted: File[]; rejected: Array<{ file: File; reason: string }> } {
  const accepted: File[] = [];
  const rejected: Array<{ file: File; reason: string }> = [];
  let slots = MAX_FILES - existingCount;

  for (const file of incoming) {
    if (slots <= 0) {
      rejected.push({
        file,
        reason: `Batas ${MAX_FILES} file telah tercapai.`,
      });
      continue;
    }
    const v = validateSingleFile(file);
    if (v.ok) {
      accepted.push(file);
      slots -= 1;
    } else {
      rejected.push({ file, reason: v.reason });
    }
  }
  return { accepted, rejected };
}
