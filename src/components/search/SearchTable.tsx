import { Copy, Download, Eye, FileText, QrCode } from "lucide-react";
import type { Arsip } from "@/lib/arsip-data";
import { statusTone } from "@/components/arsip/utils";
import type { SearchActions } from "./SearchCard";

export function SearchTable({
  data,
  actions,
}: {
  data: Arsip[];
  actions: SearchActions;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3">Nomor Surat</th>
            <th className="px-3 py-3">Judul</th>
            <th className="px-3 py-3">Kategori</th>
            <th className="px-3 py-3">Tahun</th>
            <th className="px-3 py-3">Lokasi</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-muted/40">
              <td className="px-4 py-3 align-top">
                <code className="font-mono text-xs text-foreground">{r.nomorSurat}</code>
              </td>
              <td className="max-w-[280px] px-3 py-3 align-top">
                <button
                  onClick={() => actions.onView(r)}
                  className="line-clamp-2 text-left text-sm font-medium text-foreground hover:text-primary hover:underline"
                >
                  {r.judul}
                </button>
              </td>
              <td className="px-3 py-3 align-top text-xs text-muted-foreground">
                {r.kategori}
              </td>
              <td className="px-3 py-3 align-top text-xs text-muted-foreground">
                {r.tahun}
              </td>
              <td className="px-3 py-3 align-top text-xs text-muted-foreground">
                {r.lokasiFisik}
              </td>
              <td className="px-3 py-3 align-top">
                <span
                  className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${statusTone(r.status)}`}
                >
                  {r.status}
                </span>
              </td>
              <td className="px-3 py-3 align-top">
                <div className="flex items-center justify-end gap-0.5">
                  <Icon label="Detail" onClick={() => actions.onView(r)}>
                    <Eye className="h-4 w-4" />
                  </Icon>
                  <Icon label="Preview" onClick={() => actions.onPreview(r)}>
                    <FileText className="h-4 w-4" />
                  </Icon>
                  <Icon label="Download" onClick={() => actions.onDownload(r)}>
                    <Download className="h-4 w-4" />
                  </Icon>
                  <Icon label="Copy Link" onClick={() => actions.onCopyLink(r)}>
                    <Copy className="h-4 w-4" />
                  </Icon>
                  <Icon label="QR Code" onClick={() => actions.onQr(r)}>
                    <QrCode className="h-4 w-4" />
                  </Icon>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Icon({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
    >
      {children}
    </button>
  );
}
