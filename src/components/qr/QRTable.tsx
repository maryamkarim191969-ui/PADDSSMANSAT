import {
  Copy,
  ExternalLink,
  Eye,
  MoreHorizontal,
  Power,
  PowerOff,
  RotateCw,
} from "lucide-react";
import { useState } from "react";
import type { QRItem } from "@/lib/qr-data";
import { QRStatus } from "./QRStatus";
import { QRThumb } from "./QRPreview";
import { QRDownloadIcon } from "./QRDownload";

export function QRTable({
  data,
  selected,
  onToggle,
  onToggleAll,
  onView,
  onCopy,
  onOpen,
  onToggleStatus,
  onRegenerate,
}: {
  data: QRItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (all: boolean) => void;
  onView: (qr: QRItem) => void;
  onCopy: (link: string) => void;
  onOpen: (link: string) => void;
  onToggleStatus: (qr: QRItem) => void;
  onRegenerate: (qr: QRItem) => void;
}) {
  const allChecked = data.length > 0 && data.every((d) => selected.has(d.id));
  const someChecked = data.some((d) => selected.has(d.id));

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="w-10 px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = !allChecked && someChecked;
                  }}
                  onChange={(e) => onToggleAll(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
              </th>
              <th className="px-3 py-3 text-left font-semibold">Nomor Surat</th>
              <th className="px-3 py-3 text-left font-semibold">Nama Arsip</th>
              <th className="px-3 py-3 text-left font-semibold">QR</th>
              <th className="px-3 py-3 text-left font-semibold">Public Link</th>
              <th className="px-3 py-3 text-right font-semibold">Scan</th>
              <th className="px-3 py-3 text-left font-semibold">Status</th>
              <th className="w-1 px-3 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((qr) => (
              <Row
                key={qr.id}
                qr={qr}
                checked={selected.has(qr.id)}
                onToggle={() => onToggle(qr.id)}
                onView={() => onView(qr)}
                onCopy={() => onCopy(qr.publicLink)}
                onOpen={() => onOpen(qr.publicLink)}
                onToggleStatus={() => onToggleStatus(qr)}
                onRegenerate={() => onRegenerate(qr)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  qr,
  checked,
  onToggle,
  onView,
  onCopy,
  onOpen,
  onToggleStatus,
  onRegenerate,
}: {
  qr: QRItem;
  checked: boolean;
  onToggle: () => void;
  onView: () => void;
  onCopy: () => void;
  onOpen: () => void;
  onToggleStatus: () => void;
  onRegenerate: () => void;
}) {
  const [menu, setMenu] = useState(false);
  return (
    <tr className="group border-b border-border last:border-0 transition-colors hover:bg-muted/30">
      <td className="px-3 py-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="h-4 w-4 rounded border-border accent-primary"
        />
      </td>
      <td className="px-3 py-3 font-mono text-xs font-medium text-foreground">{qr.nomorSurat}</td>
      <td className="px-3 py-3">
        <p className="line-clamp-1 max-w-[260px] text-sm font-medium text-foreground">
          {qr.namaArsip}
        </p>
      </td>
      <td className="px-3 py-3">
        <button onClick={onView} title="Lihat QR" className="transition-transform hover:scale-105">
          <QRThumb link={qr.publicLink} size={48} />
        </button>
      </td>
      <td className="px-3 py-3">
        <div className="flex max-w-[260px] items-center gap-1">
          <span className="line-clamp-1 truncate font-mono text-xs text-muted-foreground">
            {qr.publicLink}
          </span>
          <button
            onClick={onCopy}
            title="Salin link"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onOpen}
            title="Buka link"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
      <td className="px-3 py-3 text-right font-mono text-xs font-semibold text-foreground">
        {qr.totalScan.toLocaleString("id-ID")}
      </td>
      <td className="px-3 py-3">
        <QRStatus status={qr.status} />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onView}
            title="Detail"
            className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <QRDownloadIcon link={qr.publicLink} baseName={qr.nomorSurat} />
          <div className="relative">
            <button
              onClick={() => setMenu((v) => !v)}
              onBlur={() => setTimeout(() => setMenu(false), 150)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menu && (
              <div className="absolute right-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-lg animate-in fade-in-0 zoom-in-95">
                <button
                  onClick={onToggleStatus}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-foreground hover:bg-muted"
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
                  onClick={onRegenerate}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-foreground hover:bg-muted"
                >
                  <RotateCw className="h-3.5 w-3.5" /> Regenerate QR
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
