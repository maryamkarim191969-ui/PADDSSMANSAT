import { useEffect, useState } from "react";
import { Download, Maximize2, Minimize2, ZoomIn, ZoomOut, FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Arsip } from "@/lib/arsip-data";
import { getDownloadUrl, getPreviewUrl } from "@/lib/storage.functions";

export function ArsipPreview({
  arsip,
  open,
  onOpenChange,
}: {
  arsip: Arsip | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Fetch a fresh signed URL each time the dialog opens for an arsip.
  useEffect(() => {
    if (!open || !arsip?.id) {
      setPreviewUrl(null);
      setPreviewError(null);
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);
    getPreviewUrl({ data: { arsipId: arsip.id } })
      .then((r) => {
        if (!cancelled) setPreviewUrl(r.url);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setPreviewError(
            e instanceof Error ? e.message : "Gagal memuat pratinjau.",
          );
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, arsip?.id]);

  async function handleDownload() {
    if (!arsip?.id || downloading) return;
    setDownloading(true);
    try {
      const r = await getDownloadUrl({ data: { arsipId: arsip.id } });
      window.open(r.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setPreviewError(e instanceof Error ? e.message : "Gagal mengunduh.");
    } finally {
      setDownloading(false);
    }
  }

  if (!arsip) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setZoom(100); setFullscreen(false); } onOpenChange(o); }}>
      <DialogContent
        className={
          fullscreen
            ? "h-screen w-screen max-w-none rounded-none p-0"
            : "max-w-4xl p-0"
        }
      >
        <DialogHeader className="border-b border-border px-5 py-3">
          <DialogTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-primary" />
            <span className="truncate">{arsip.judul}</span>
            <span className="ml-auto rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
              {arsip.nomorSurat}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-xs font-medium tabular-nums text-foreground">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFullscreen((f) => !f)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              {fullscreen ? "Keluar" : "Fullscreen"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || !arsip.id}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {downloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Download
            </button>
          </div>
        </div>

        <div className={fullscreen ? "h-[calc(100vh-110px)] overflow-auto bg-muted/30" : "h-[68vh] overflow-auto bg-muted/30"}>
          <div
            className="mx-auto my-4 origin-top bg-white shadow-sm transition-transform"
            style={{ width: `${zoom}%`, maxWidth: zoom > 100 ? "none" : "100%" }}
          >
            {previewLoading ? (
              <div className="flex h-[80vh] w-full items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat pratinjau…
              </div>
            ) : previewError ? (
              <div className="flex h-[80vh] w-full items-center justify-center px-6 text-center text-sm text-destructive">
                {previewError}
              </div>
            ) : previewUrl ? (
              <iframe
                src={`${previewUrl}#toolbar=0&view=FitH`}
                className="h-[80vh] w-full"
                title={arsip.judul}
              />
            ) : (
              <div className="flex h-[80vh] w-full items-center justify-center text-sm text-muted-foreground">
                File belum tersedia.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
