import { Download, FileImage, FileCode2 } from "lucide-react";
import { qrImageUrl, qrSvgUrl } from "@/lib/qr-data";

export function QRDownload({
  link,
  baseName,
  variant = "row",
}: {
  link: string;
  baseName: string;
  variant?: "row" | "stack";
}) {
  const fileBase = baseName.replace(/\W+/g, "-").toLowerCase();
  return (
    <div className={variant === "row" ? "flex items-center gap-2" : "grid grid-cols-2 gap-2"}>
      <a
        href={qrImageUrl(link, 800)}
        download={`qr-${fileBase}.png`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
      >
        <FileImage className="h-3.5 w-3.5" />
        PNG
      </a>
      <a
        href={qrSvgUrl(link, 800)}
        download={`qr-${fileBase}.svg`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
      >
        <FileCode2 className="h-3.5 w-3.5" />
        SVG
      </a>
    </div>
  );
}

export function QRDownloadIcon({ link, baseName }: { link: string; baseName: string }) {
  const fileBase = baseName.replace(/\W+/g, "-").toLowerCase();
  return (
    <a
      href={qrImageUrl(link, 800)}
      download={`qr-${fileBase}.png`}
      target="_blank"
      rel="noreferrer"
      title="Download PNG"
      className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Download className="h-3.5 w-3.5" />
    </a>
  );
}
