import { Copy, ExternalLink, Power, PowerOff, RotateCw } from "lucide-react";
import { formatDateID, type QRItem } from "@/lib/qr-data";
import { QRPreview } from "./QRPreview";
import { QRDownload } from "./QRDownload";
import { QRStatus } from "./QRStatus";
import { QRAnalytics } from "./QRAnalytics";
import { QRHistory } from "./QRHistory";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}

export function QRDetail({
  qr,
  onCopy,
  onOpen,
  onToggleStatus,
  onRegenerate,
}: {
  qr: QRItem;
  onCopy: (link: string) => void;
  onOpen: (link: string) => void;
  onToggleStatus: (qr: QRItem) => void;
  onRegenerate: (qr: QRItem) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-[260px_1fr]">
      <div className="space-y-3">
        <QRPreview link={qr.publicLink} size={240} />
        <QRDownload link={qr.publicLink} baseName={qr.nomorSurat} variant="stack" />
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="Nomor Surat"
            value={<span className="font-mono font-semibold">{qr.nomorSurat}</span>}
          />
          <Field label="Status" value={<QRStatus status={qr.status} />} />
          <Field
            label="Nama Arsip"
            value={<span className="font-medium">{qr.namaArsip}</span>}
          />
          <Field label="Tanggal Dibuat" value={formatDateID(qr.createdAt)} />
          <Field label="Total Scan" value={qr.totalScan.toLocaleString("id-ID")} />
          <Field label="Scan Terakhir" value={formatDateID(qr.lastScanAt)} />
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Public Link
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-2">
            <code className="flex-1 truncate px-2 text-xs text-foreground">{qr.publicLink}</code>
            <button
              onClick={() => onCopy(qr.publicLink)}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Copy className="h-3.5 w-3.5" /> Salin
            </button>
            <button
              onClick={() => onOpen(qr.publicLink)}
              className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-2.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Buka
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onToggleStatus(qr)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            {qr.status === "Aktif" ? (
              <>
                <PowerOff className="h-3.5 w-3.5" /> Nonaktifkan
              </>
            ) : (
              <>
                <Power className="h-3.5 w-3.5" /> Aktifkan
              </>
            )}
          </button>
          <button
            onClick={() => onRegenerate(qr)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
          >
            <RotateCw className="h-3.5 w-3.5" /> Regenerate
          </button>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold text-foreground">Analitik</h4>
          <QRAnalytics qr={qr} />
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold text-foreground">Riwayat Aktivitas</h4>
          <QRHistory items={qr.history} />
        </div>
      </div>
    </div>
  );
}
