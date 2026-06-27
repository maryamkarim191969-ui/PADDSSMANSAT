import { AlertTriangle } from "lucide-react";

export function SearchError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">
        Gagal memuat hasil pencarian
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {message ?? "Terjadi kesalahan saat mencari arsip. Silakan coba lagi."}
      </p>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Coba Lagi
      </button>
    </div>
  );
}
