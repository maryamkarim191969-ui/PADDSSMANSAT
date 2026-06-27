import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import type { RetensiRow } from "@/lib/retensi-data";
import { RetentionStatusBadge } from "./RetentionStatusBadge";

function formatDate(iso: string) {
  const d = new Date(iso);
  const bln = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${d.getUTCDate()} ${bln[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function RetentionDetail({
  row, open, onOpenChange,
}: {
  row: RetensiRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail Retensi Arsip</DialogTitle>
          <DialogDescription>Informasi lengkap retensi dokumen arsip.</DialogDescription>
        </DialogHeader>
        {row && (
          <div className="space-y-4">
            <Field label="Nomor Surat" value={row.nomorSurat} mono />
            <Field label="Judul" value={row.judul} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Kategori" value={row.kategori} />
              <Field label="Jenis" value={row.jenis} />
              <Field label="Tahun" value={String(row.tahun)} />
              <Field label="Lokasi Fisik" value={row.lokasiFisik} />
              <Field label="Tanggal Upload" value={formatDate(row.tanggalUpload)} />
              <Field label="Tanggal Retensi" value={formatDate(row.tanggalRetensi)} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Status Retensi</p>
              <div className="mt-1.5"><RetentionStatusBadge status={row.retensiStatus} /></div>
              <p className="mt-2 text-xs text-muted-foreground">
                Sisa {row.sisaHari < 0 ? `${Math.abs(row.sisaHari)} hari lewat` : `${row.sisaHari} hari`}.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Deskripsi</p>
              <p className="mt-1 text-sm text-foreground/80">{row.deskripsi}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm text-foreground ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}