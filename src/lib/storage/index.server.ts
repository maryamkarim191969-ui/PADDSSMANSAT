/**
 * Storage Layer entry point (server-only).
 *
 * `getStorage()` returns the single configured StorageAdapter. UI code MUST
 * NOT import this file — all access goes through server functions defined in
 * `src/lib/storage.functions.ts`.
 */

import type { StorageAdapter } from "./types";
import { R2StorageAdapter } from "./r2-adapter.server";

let cached: StorageAdapter | null = null;

function readEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`Storage env missing: ${name}`);
  }
  return v.trim();
}

export function getStorage(): StorageAdapter {
  if (cached) return cached;

  const provider = (process.env.STORAGE_PROVIDER ?? "r2").toLowerCase();

  switch (provider) {
    case "r2": {
      cached = new R2StorageAdapter({
        accountId: readEnv("R2_ACCOUNT_ID"),
        endpoint: readEnv("R2_ENDPOINT"),
        bucket: readEnv("R2_BUCKET_NAME"),
        accessKeyId: readEnv("R2_ACCESS_KEY_ID"),
        secretAccessKey: readEnv("R2_SECRET_ACCESS_KEY"),
      });
      return cached;
    }
    default:
      throw new Error(
        `Unsupported STORAGE_PROVIDER "${provider}". Only "r2" is implemented in this sprint.`,
      );
  }
}

export { StorageObjectNotFoundError, StorageError } from "./types";
