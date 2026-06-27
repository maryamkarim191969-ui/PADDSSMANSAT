import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

export function ImportDropzone({
  onFiles,
}: {
  onFiles: (files: File[]) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  function handle(list: FileList | null) {
    if (!list) return;
    const files = Array.from(list);
    if (files.length) onFiles(files);
  }

  return (
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
          : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
      }`}
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
        <UploadCloud className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-foreground">
        Tarik & lepas beberapa PDF di sini
      </p>
      <p className="text-xs text-muted-foreground">
        atau <span className="font-medium text-primary">klik untuk pilih file</span>
      </p>
      <p className="text-[11px] text-muted-foreground">
        Multi-file • Format PDF
      </p>
      <input
        ref={ref}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
    </button>
  );
}
