/**
 * Cloudflare R2 storage adapter (S3-compatible).
 *
 * Server-only. Never import from client code or from `*.functions.ts`
 * module scope — load via `getStorage()` inside handler bodies.
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  NoSuchKey,
  NotFound,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
  type DownloadResult,
  type SignedUrlOptions,
  type SignedUrlResult,
  type StorageAdapter,
  type StoredObjectRef,
  type UploadInput,
  StorageError,
  StorageObjectNotFoundError,
} from "./types";

const DEFAULT_TTL = 5 * 60; // 5 minutes
const MAX_TTL = 60 * 60; // 1 hour upper bound

function clampTtl(ttl?: number): number {
  if (!ttl || ttl <= 0) return DEFAULT_TTL;
  return Math.min(ttl, MAX_TTL);
}

export type R2AdapterConfig = {
  accountId: string;
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
};

export class R2StorageAdapter implements StorageAdapter {
  readonly provider = "r2" as const;
  readonly bucket: string;
  private readonly client: S3Client;

  constructor(cfg: R2AdapterConfig) {
    this.bucket = cfg.bucket;
    this.client = new S3Client({
      region: "auto",
      endpoint: cfg.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.secretAccessKey,
      },
    });
  }

  async upload(input: UploadInput): Promise<StoredObjectRef> {
    const body =
      input.body instanceof Blob
        ? new Uint8Array(await input.body.arrayBuffer())
        : input.body instanceof ArrayBuffer
          ? new Uint8Array(input.body)
          : input.body;

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: input.storagePath,
          Body: body,
          ContentType: input.contentType,
        }),
      );
    } catch (err) {
      throw new StorageError(`Gagal mengunggah ke R2: ${(err as Error).message}`, err);
    }

    return {
      storageProvider: this.provider,
      bucketName: this.bucket,
      storagePath: input.storagePath,
    };
  }

  async download(storagePath: string): Promise<DownloadResult> {
    try {
      const out = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: storagePath }),
      );
      const body = out.Body as unknown as ReadableStream<Uint8Array> | null;
      return {
        body,
        contentType: out.ContentType,
        contentLength: typeof out.ContentLength === "number" ? out.ContentLength : undefined,
      };
    } catch (err) {
      if (err instanceof NoSuchKey || err instanceof NotFound) {
        throw new StorageObjectNotFoundError(storagePath);
      }
      throw new StorageError(`Gagal mengunduh dari R2: ${(err as Error).message}`, err);
    }
  }

  async delete(storagePath: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: storagePath }),
      );
    } catch (err) {
      throw new StorageError(`Gagal menghapus object R2: ${(err as Error).message}`, err);
    }
  }

  async exists(storagePath: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: storagePath }),
      );
      return true;
    } catch (err) {
      if (err instanceof NotFound || err instanceof NoSuchKey) return false;
      const status = (err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
      if (status === 404) return false;
      throw new StorageError(`Gagal memeriksa object R2: ${(err as Error).message}`, err);
    }
  }

  async preview(
    storagePath: string,
    opts?: { expiresIn?: number; contentType?: string },
  ): Promise<SignedUrlResult> {
    return this.getSignedUrl(storagePath, {
      mode: "get",
      expiresIn: opts?.expiresIn,
      inline: true,
      contentType: opts?.contentType,
    });
  }

  async getSignedUrl(storagePath: string, opts: SignedUrlOptions): Promise<SignedUrlResult> {
    const expiresIn = clampTtl(opts.expiresIn);

    try {
      if (opts.mode === "put") {
        const cmd = new PutObjectCommand({
          Bucket: this.bucket,
          Key: storagePath,
          ContentType: opts.contentType,
        });
        const url = await getSignedUrl(this.client, cmd, { expiresIn });
        return { url, method: "PUT", expiresIn };
      }

      const disposition = opts.downloadAs
        ? `attachment; filename="${encodeFilename(opts.downloadAs)}"`
        : opts.inline
          ? "inline"
          : undefined;

      const cmd = new GetObjectCommand({
        Bucket: this.bucket,
        Key: storagePath,
        ResponseContentDisposition: disposition,
        ResponseContentType: opts.contentType,
      });
      const url = await getSignedUrl(this.client, cmd, { expiresIn });
      return { url, method: "GET", expiresIn };
    } catch (err) {
      throw new StorageError(`Gagal membuat signed URL: ${(err as Error).message}`, err);
    }
  }
}

function encodeFilename(name: string): string {
  return name.replace(/["\\]/g, "_");
}
