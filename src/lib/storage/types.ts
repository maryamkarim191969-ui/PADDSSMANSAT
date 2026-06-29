/**
 * PADDS SMANSAT Storage Layer — public types.
 *
 * This file is client-safe (no SDK imports). It defines the contract every
 * storage provider (R2, S3, B2, Azure, Supabase Storage, ...) must satisfy.
 */

export type StorageProvider = "r2" | "s3" | "b2" | "azure" | "supabase";

export type StoredObjectRef = {
  storageProvider: StorageProvider;
  bucketName: string;
  storagePath: string;
};

export type SignedUrlMode = "get" | "put";

export type SignedUrlOptions = {
  mode: SignedUrlMode;
  /** TTL in seconds. Adapter enforces a sane upper bound. */
  expiresIn?: number;
  /** Optional HTTP Content-Type for PUT presign. */
  contentType?: string;
  /** When set on GET, forces download with the given filename. */
  downloadAs?: string;
  /** When true, hints inline rendering (default for previews). */
  inline?: boolean;
};

export type SignedUrlResult = {
  url: string;
  method: "GET" | "PUT";
  expiresIn: number;
};

export type UploadInput = {
  storagePath: string;
  body: Uint8Array | ArrayBuffer | Blob;
  contentType?: string;
};

export type DownloadResult = {
  body: ReadableStream<Uint8Array> | null;
  contentType?: string;
  contentLength?: number;
};

export interface StorageAdapter {
  readonly provider: StorageProvider;
  readonly bucket: string;

  upload(input: UploadInput): Promise<StoredObjectRef>;
  download(storagePath: string): Promise<DownloadResult>;
  delete(storagePath: string): Promise<void>;
  /** Returns true if the object exists (HEAD). */
  exists(storagePath: string): Promise<boolean>;
  /** Convenience: GET signed URL for inline preview. */
  preview(storagePath: string, opts?: { expiresIn?: number; contentType?: string }): Promise<SignedUrlResult>;
  getSignedUrl(storagePath: string, opts: SignedUrlOptions): Promise<SignedUrlResult>;
  /**
   * Aggregate object metadata across an optional key prefix. Implementations
   * page through the underlying provider listing API and sum sizes — callers
   * use this for storage monitoring panels.
   */
  getStats(prefix?: string): Promise<{ objectCount: number; totalBytes: number }>;
}

export class StorageObjectNotFoundError extends Error {
  readonly code = "STORAGE_OBJECT_NOT_FOUND";
  constructor(public readonly storagePath: string) {
    super(`Storage object not found: ${storagePath}`);
    this.name = "StorageObjectNotFoundError";
  }
}

export class StorageError extends Error {
  readonly code = "STORAGE_ERROR";
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "StorageError";
  }
}
