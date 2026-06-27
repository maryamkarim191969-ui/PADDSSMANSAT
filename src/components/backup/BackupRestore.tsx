import { useState } from "react";
import { Upload, AlertTriangle, RotateCcw } from "lucide-react";

type Props = { onRestore: (fileName: string) => void };

export function BackupRestore({ onRestore }: Props) {
  const [file, setFile] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <RotateCcw className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Restore Data</p>
          <p className="text-xs text-muted-foreground">Pulihkan data dari file backup.</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700" />
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Peringatan:</span> Restore akan menggantikan data yang ada saat ini.
            Pastikan Anda telah membuat backup sebelum melanjutkan.
          </p>
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:bg-muted/50">
        <Upload className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          {file ?? "Klik untuk pilih file backup (.zip)"}
        </p>
        <p className="text-[11px] text-muted-foreground">Maksimum 500 MB</p>
        <input
          type="file"
          accept=".zip"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f.name);
          }}
        />
      </label>

      <div className="mt-4 flex items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-foreground">
          <input
            type="checkbox"
            checked={confirm}
            onChange={(e) => setConfirm(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Saya memahami bahwa data saat ini akan diganti.
        </label>
      </div>

      <button
        disabled={!file || !confirm}
        onClick={() => file && onRestore(file)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RotateCcw className="h-4 w-4" /> Mulai Restore
      </button>
    </div>
  );
}
