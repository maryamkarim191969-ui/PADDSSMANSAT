import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function UploadSuccessDialog({
  open,
  onOpenChange,
  onUploadAgain,
  onGoToArsip,
  nomorSurat,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onUploadAgain: () => void;
  onGoToArsip: () => void;
  nomorSurat?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center">Arsip berhasil ditambahkan</DialogTitle>
        </DialogHeader>
        <p className="text-center text-sm text-muted-foreground">
          {nomorSurat ? (
            <>
              Dokumen <span className="font-medium text-foreground">{nomorSurat}</span>{" "}
              telah tersimpan di sistem.
            </>
          ) : (
            "Dokumen telah tersimpan di sistem."
          )}
        </p>
        <DialogFooter className="sm:justify-center">
          <button
            type="button"
            onClick={onUploadAgain}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-xs font-medium hover:bg-muted"
          >
            Upload Lagi
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
