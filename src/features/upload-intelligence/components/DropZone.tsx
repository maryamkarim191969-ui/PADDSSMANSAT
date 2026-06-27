import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { ACCEPT_ATTR, MAX_FILES, MAX_FILE_SIZE_BYTES } from "../constants";

export function DropZone({
  onFiles,
  remainingSlots,
}: {
  onFiles: (files: File[]) => void;
  remainingSlots: number;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  function handle(list: FileList | null) {
    if (!list || list.length === 0) return;
    onFiles(Array.from(list));
    if (ref.current) ref.current.value = "";
  }

  const disabled = remainingSlots <= 0;

  return (
    <div>
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
          PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, PNG, JPG • Maks{" "}
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
    </div>
  );
}
