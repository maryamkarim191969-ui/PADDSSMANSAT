import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function UploadErrorDialog({
  open,
  onOpenChange,
  onRetry,
  message,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onRetry: () => void;
  message?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive ring-4 ring-destructive/10">
            <AlertCircle className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center">Gagal menyimpan arsip</DialogTitle>
        </DialogHeader>
        <p className="text-center text-sm text-muted-foreground">
          {message ?? "Terjadi kesalahan ketika memproses arsip Anda. Silakan coba lagi."}
        </p>
        <DialogFooter className="sm:justify-center">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-xs font-medium hover:bg-muted"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Coba Lagi
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
