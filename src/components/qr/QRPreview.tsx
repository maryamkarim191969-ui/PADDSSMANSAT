import { qrImageUrl } from "@/lib/qr-data";

export function QRPreview({
  link,
  label,
  size = 320,
}: {
  link: string;
  label?: string;
  size?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <img
          src={qrImageUrl(link, size)}
          alt={label ? `QR ${label}` : "QR Code"}
          width={size}
          height={size}
          className="block"
        />
      </div>
      {label && (
        <p className="text-center text-xs text-muted-foreground">
          Pindai untuk membuka <span className="font-medium text-foreground">{label}</span>
        </p>
      )}
    </div>
  );
}

export function QRThumb({ link, size = 56 }: { link: string; size?: number }) {
  return (
    <div className="grid place-items-center rounded-lg border border-border bg-white p-1 shadow-sm">
      <img
        src={qrImageUrl(link, size)}
        alt="QR"
        width={size}
        height={size}
        loading="lazy"
        className="block"
      />
    </div>
  );
}
