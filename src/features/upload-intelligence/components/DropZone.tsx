import { useRef, useState } from "react";
import { Camera, UploadCloud } from "lucide-react";
import { ACCEPT_ATTR, MAX_FILES, MAX_FILE_SIZE_BYTES } from "../constants";

export function DropZone({
  onFiles,
  remainingSlots,
}: {
  onFiles: (files: File[]) => void;
  remainingSlots: number;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  function handle(list: FileList | null) {
    if (!list || list.length === 0) return;
    onFiles(Array.from(list));
    if (ref.current) ref.current.value = "";
  }

  const disabled = remainingSlots <= 0;

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => ref.current?.click()}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-10 text-center transition-all ${
          disabled
            ? "cursor-not-allowed border-border bg-muted/20 opacity-60"
            : drag
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UploadCloud className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-foreground">
          {disabled
            ? `Antrian penuh (${MAX_FILES} file).`
            : "Tarik & lepas dokumen di sini"}
        </p>
        <p className="text-xs text-muted-foreground">
          atau{" "}
          <span className="font-medium text-primary">
            klik untuk memilih file
          </span>{" "}
          dari perangkat
        </p>
        <p className="text-[11px] text-muted-foreground">
          PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, PNG, JPG (foto dokumen) • Maks{" "}
          {MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB / file • Hingga {MAX_FILES} file
        </p>
        <input
          ref={ref}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          className="hidden"
          onChange={(e) => handle(e.target.files)}
        />
      </button>
      <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
        <span>Tidak memiliki PDF? Ambil foto dokumen langsung:</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => cameraRef.current?.click()}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[11px] font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Camera className="h-3.5 w-3.5" /> Ambil dari kamera
        </button>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handle(e.target.files)}
        />
      </div>
    </div>
  );
}
