import { FileText, Trash2, Eye, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { QueuedFile } from "../types";
import { StatusBadge } from "./StatusBadge";
import { formatBytes } from "./utils";

export function UploadQueue({
  items,
  onRemove,
  onReview,
  onUpload,
  busy,
  duplicateIds,
}: {
  items: QueuedFile[];
  onRemove: (id: string) => void;
  onReview: (id: string) => void;
  onUpload: (id: string) => void;
  busy: boolean;
  duplicateIds?: Set<string>;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/60 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada dokumen pada antrian. Tambahkan file melalui area unggah di
          atas untuk memulai analisis AI.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((q) => {
        const ready =
          q.status === "siap_upload" || q.status === "perlu_review";
        const inProgress =
          q.status === "dianalisis" ||
          q.status === "ocr" ||
          q.status === "ekstraksi" ||
          q.status === "sedang_upload";
        const isDuplicate = duplicateIds?.has(q.id) ?? false;
        return (
          <li
            key={q.id}
            className={
              "flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center " +
              (isDuplicate ? "border-amber-300" : "border-border")
            }
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {q.file.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatBytes(q.file.size)} •{" "}
                  {q.file.type || "tipe tidak dikenal"}
                </p>
                {isDuplicate ? (
                  <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
                    <AlertTriangle className="h-3 w-3" />
                    Perlu Peninjauan — indikasi nomor surat duplikat
                  </p>
                ) : null}
                {q.error ? (
                  <p className="mt-1 text-[11px] font-medium text-destructive">
                    {q.error}
                  </p>
                ) : null}
                {q.status === "sedang_upload" ? (
                  <Progress value={q.progress} className="mt-2 h-1.5" />
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={q.status} />
              {q.status !== "berhasil" && q.status !== "sedang_upload" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onReview(q.id)}
                  disabled={inProgress}
                >
                  <Eye className="mr-1 h-3.5 w-3.5" />
                  {ready ? "Tinjau Form" : "Buka Form"}
                </Button>
              ) : null}
              {ready ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onUpload(q.id)}
                  disabled={busy || inProgress}
                  variant={isDuplicate ? "outline" : "default"}
                  title={
                    isDuplicate
                      ? "Dokumen memiliki indikasi duplikat. Tetap upload manual bila diperlukan."
                      : undefined
                  }
                >
                  {isDuplicate ? "Tetap Upload" : "Upload File Ini"}
                </Button>
              ) : null}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => onRemove(q.id)}
                aria-label="Hapus dari antrian"
                disabled={inProgress}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
