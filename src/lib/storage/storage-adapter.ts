/**
 * Client-safe helpers for the storage layer.
 *
 * No SDK imports here — anything that touches AWS/R2 SDKs must live in
 * `*.server.ts` files. This module is safe to import from server functions
 * AND from shared logic that may end up in the client bundle.
 */

export type StoragePathInput = {
  /** 4-digit year used as the first level of the object key. */
  tahun: number;
  /** Original filename — used only to extract the extension. */
  fileName: string;
  /** Optional pre-generated UUID. If omitted, one is generated. */
  uuid?: string;
  /** Optional date (defaults to now) used to derive month folder. */
  at?: Date;
};

const MAX_EXT_LEN = 12;

function sanitizeExt(name: string): string {
  const idx = name.lastIndexOf(".");
  if (idx < 0 || idx === name.length - 1) return "";
  const raw = name.slice(idx + 1).toLowerCase();
  const clean = raw.replace(/[^a-z0-9]/g, "");
  if (!clean) return "";
  return clean.slice(0, MAX_EXT_LEN);
}

function randomUuid(): string {
  // Prefer Web Crypto when available (works in browser, Workers, modern Node).
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  // Fallback (RFC4122 v4 via Math.random — only used if Web Crypto is absent).
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Build a stable, opaque object key.
 *
 * Shape: `arsip/{YYYY}/{MM}/{uuid}.{ext}`
 *
 * Notes:
 * - Filename and category are NOT part of the key — those live in the DB so
 *   metadata edits never require moving the object.
 * - The key is permanent for the lifetime of the archive.
 */
export function buildStoragePath(input: StoragePathInput): { storagePath: string; uuid: string } {
  const uuid = input.uuid ?? randomUuid();
  const ext = sanitizeExt(input.fileName);
  const at = input.at ?? new Date();
  const month = String(at.getUTCMonth() + 1).padStart(2, "0");
  const year = Number.isFinite(input.tahun) ? Math.trunc(input.tahun) : at.getUTCFullYear();
  const tail = ext ? `${uuid}.${ext}` : uuid;
  return { storagePath: `arsip/${year}/${month}/${tail}`, uuid };
}

/** Allowed mime types for arsip uploads. */
export const ALLOWED_MIME_TYPES = new Set<string>([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
]);

/** Max upload size: 25 MB. Matches client-side `MAX_FILE_SIZE_BYTES`. */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export type { StorageAdapter, StoredObjectRef, SignedUrlOptions, SignedUrlResult, UploadInput, DownloadResult, StorageProvider } from "./types";
export { StorageObjectNotFoundError, StorageError } from "./types";
