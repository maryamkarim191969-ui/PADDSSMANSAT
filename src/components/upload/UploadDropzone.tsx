import { useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { formatBytes } from "./types";

export function UploadDropzone({
  file,
  onFile,
  error,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
  error?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  function handle(files: FileList | null) {
    if (!files || !files[0]) return;
    const f = files[0];
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      onFile(null);
      return;
    }
    onFile(f);
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3 transition-colors">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(file.size)} • PDF
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            onFile(null);
            if (ref.current) ref.current.value = "";
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Hapus file"
        >
          <X className="h-4 w-4" />
        </button>
        <input
          ref={ref}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handle(e.target.files)}
        />
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all ${
          drag
            ? "border-primary bg-primary/5"
            : error
              ? "border-destructive/40 bg-destructive/5"
              : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <UploadCloud className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-foreground">
          Tarik & lepas file PDF di sini
        </p>
        <p className="text-xs text-muted-foreground">
          atau <span className="font-medium text-primary">klik untuk memilih file</span>
        </p>
        <p className="text-[11px] text-muted-foreground">Format: PDF • Maks 20MB</p>
        <input
          ref={ref}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handle(e.target.files)}
        />
      </button>
      {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
