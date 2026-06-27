import { Pencil, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Kategori } from "@/lib/kategori-data";
import { statusTone } from "./CategoryTable";

export function CategoryDetail({
  kategori,
  open,
  onOpenChange,
  onEdit,
}: {
  kategori: Kategori | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onEdit?: () => void;
}) {
  if (!kategori) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Tag className="h-4 w-4" />
            </span>
            Detail Kategori
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">{kategori.nama}</h3>
                <code className="mt-1 inline-block rounded-md bg-background px-1.5 py-0.5 font-mono text-xs text-foreground ring-1 ring-border">
                  {kategori.kode}
                </code>
              </div>
              <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${statusTone(kategori.status)}`}>
                {kategori.status}
              </span>
            </div>
          </div>

          <DetailRow label="Deskripsi">
            <p className="text-sm text-foreground">
              {kategori.deskripsi || (
                <span className="text-muted-foreground italic">Tidak ada deskripsi.</span>
              )}
            </p>
          </DetailRow>

          <div className="grid grid-cols-2 gap-3">
            <DetailRow label="Jumlah Arsip">
              <p className="text-sm font-semibold text-foreground">
                {kategori.jumlahArsip.toLocaleString("id-ID")} dokumen
              </p>
            </DetailRow>
            <DetailRow label="Status">
              <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${statusTone(kategori.status)}`}>
                {kategori.status}
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
                <Pencil className="h-3.5 w-3.5" /> Edit Kategori
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