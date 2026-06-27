import { RotateCcw, Save, X } from "lucide-react";

export function UploadButtons({
  onSubmit,
  onReset,
  onCancel,
  loading,
}: {
  onSubmit: () => void;
  onReset: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
      >
        <X className="h-4 w-4" /> Batal
      </button>
      <button
        type="button"
        onClick={onReset}
        disabled={loading}
        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
      >
        <RotateCcw className="h-4 w-4" /> Reset Form
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        <Save className="h-4 w-4" /> {loading ? "Menyimpan..." : "Simpan Arsip"}
      </button>
    </div>
  );
}
