import { useState } from "react";
import { Download, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { publicLinkFor } from "./utils";

function qrUrl(data: string, size = 320) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=4&data=${encodeURIComponent(
    data,
  )}`;
}

export function ArsipQRCode({ id, nomorSurat }: { id: string; nomorSurat: string }) {
  const [open, setOpen] = useState(false);
  const url = publicLinkFor(id);
  const src = qrUrl(url);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted">
          <QrCode className="h-3.5 w-3.5" /> Lihat QR
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code Arsip</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
            <img src={src} alt={`QR ${nomorSurat}`} width={260} height={260} />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Pindai QR untuk membuka arsip <span className="font-medium text-foreground">{nomorSurat}</span>
          </p>
          <a
            href={qrUrl(url, 600)}
            download={`qr-${nomorSurat.replace(/\W+/g, "-")}.png`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Download className="h-3.5 w-3.5" /> Download QR
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
