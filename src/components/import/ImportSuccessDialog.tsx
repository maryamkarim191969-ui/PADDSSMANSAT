import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ImportSuccessDialog({
  open,
  onOpenChange,
  count,
  onClose,
  onGoToArsip,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  count: number;
  onClose: () => void;
  onGoToArsip: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center">
            {count} arsip berhasil diimport
          </DialogTitle>
        </DialogHeader>
        <p className="text-center text-sm text-muted-foreground">
          Seluruh dokumen telah dimigrasi ke dalam sistem PADDS SMANSAT.
        </p>
        <DialogFooter className="sm:justify-center">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-xs font-medium hover:bg-muted"
          >
            Import Lagi
          </button>
          <button
            type="button"
            onClick={onGoToArsip}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Lihat Daftar Arsip
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
