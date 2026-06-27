import { Calendar, FileText, FolderTree, Hash, MapPin, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Arsip } from "@/lib/arsip-data";
import { formatDateTime, jenisTone, statusTone } from "./utils";
import { ArsipLink } from "./ArsipLink";
import { ArsipQRCode } from "./ArsipQRCode";

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 text-sm font-medium text-foreground">{children}</div>
      </div>
    </div>
  );
}

export function ArsipDetail({
  arsip,
  open,
  onOpenChange,
  onPreview,
}: {
  arsip: Arsip | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPreview?: () => void;
}) {
  if (!arsip) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-2 pr-6 text-base">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="leading-snug">{arsip.judul}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${jenisTone(arsip.jenis)}`}>
              {arsip.jenis}
            </span>
            <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${statusTone(arsip.status)}`}>
              {arsip.status}
            </span>
            <span className="font-mono text-xs text-muted-foreground">{arsip.nomorSurat}</span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field icon={Hash} label="Nomor Surat">{arsip.nomorSurat}</Field>
            <Field icon={Tag} label="Kategori">{arsip.kategori}</Field>
            <Field icon={Calendar} label="Tahun">{arsip.tahun}</Field>
            <Field icon={MapPin} label="Lokasi Fisik">{arsip.lokasiFisik}</Field>
            <Field icon={Calendar} label="Tanggal Upload">{formatDateTime(arsip.tanggalUpload)}</Field>
            <Field icon={FolderTree} label="Status">{arsip.status}</Field>
          </div>

          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Deskripsi
            </p>
            <p className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm leading-relaxed text-foreground">
              {arsip.deskripsi}
            </p>
          </div>

          <ArsipLink id={arsip.id} />

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {onPreview && (
              <button
                onClick={onPreview}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <FileText className="h-3.5 w-3.5" /> Preview PDF
              </button>
            )}
            <ArsipQRCode id={arsip.id} nomorSurat={arsip.nomorSurat} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
