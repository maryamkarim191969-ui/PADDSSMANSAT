import { Copy, Download, Eye, FileText, MapPin, QrCode } from "lucide-react";
import type { Arsip } from "@/lib/arsip-data";
import { statusTone } from "@/components/arsip/utils";

export type SearchActions = {
  onView: (a: Arsip) => void;
  onPreview: (a: Arsip) => void;
  onDownload: (a: Arsip) => void;
  onCopyLink: (a: Arsip) => void;
  onQr: (a: Arsip) => void;
};

export function SearchCard({ arsip, actions }: { arsip: Arsip; actions: SearchActions }) {
  return (
    <article className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <code className="font-mono text-[11px] text-muted-foreground">
              {arsip.nomorSurat}
            </code>
            <span
              className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium ${statusTone(arsip.status)}`}
            >
              {arsip.status}
            </span>
          </div>
          <button
            onClick={() => actions.onView(arsip)}
            className="mt-1 line-clamp-2 text-left text-sm font-semibold text-foreground transition-colors hover:text-primary"
          >
            {arsip.judul}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span>{arsip.kategori}</span>
        <span>•</span>
        <span>{arsip.tahun}</span>
        <span>•</span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {arsip.lokasiFisik}
        </span>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-1 border-t border-border pt-3">
        <ActionBtn label="Lihat Detail" onClick={() => actions.onView(arsip)} icon={Eye} />
        <ActionBtn label="Preview" onClick={() => actions.onPreview(arsip)} icon={FileText} />
        <ActionBtn label="Download" onClick={() => actions.onDownload(arsip)} icon={Download} />
        <ActionBtn label="Copy Link" onClick={() => actions.onCopyLink(arsip)} icon={Copy} />
        <ActionBtn label="QR Code" onClick={() => actions.onQr(arsip)} icon={QrCode} />
      </div>
    </article>
  );
}

function ActionBtn({
  label,
  onClick,
  icon: Icon,
}: {
  label: string;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
