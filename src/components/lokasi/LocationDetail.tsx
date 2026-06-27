import { Pencil, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Lokasi } from "@/lib/lokasi-data";
import { statusTone, statusLabel } from "./LocationTable";
import { LocationHierarchy } from "./LocationHierarchy";

export function LocationDetail({
  lokasi,
  open,
  onOpenChange,
  onEdit,
}: {
  lokasi: Lokasi | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onEdit?: () => void;
}) {
  if (!lokasi) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-4 w-4" />
            </span>
            Detail Lokasi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">{lokasi.nama}</h3>
                <code className="mt-1 inline-block rounded-md bg-background px-1.5 py-0.5 font-mono text-xs text-foreground ring-1 ring-border">
                  {lokasi.kode}
                </code>
              </div>
              <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${statusTone(lokasi.status)}`}>
                {statusLabel(lokasi.status)}
              </span>
            </div>
          </div>

          <LocationHierarchy ruangan={lokasi.ruangan} rak={lokasi.rak} kode={lokasi.kode} />

          <DetailRow label="Deskripsi">
            <p className="text-sm text-foreground">
              {lokasi.deskripsi || (
                <span className="text-muted-foreground italic">Tidak ada deskripsi.</span>
              )}
            </p>
          </DetailRow>

          <div className="grid grid-cols-2 gap-3">
            <DetailRow label="Jumlah Arsip">
              <p className="text-sm font-semibold text-foreground">
                {lokasi.jumlahArsip.toLocaleString("id-ID")} dokumen
              </p>
            </DetailRow>
            <DetailRow label="Status">
              <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${statusTone(lokasi.status)}`}>
                {statusLabel(lokasi.status)}
              </span>
            </DetailRow>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => onOpenChange(false)}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Tutup
            </button>
            {onEdit && (
              <button
                onClick={onEdit}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit Lokasi
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}
