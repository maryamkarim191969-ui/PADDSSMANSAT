import { FileText } from "lucide-react";
import type { UploadForm } from "./types";

export function UploadSummary({ form }: { form: UploadForm }) {
  const items: Array<{ label: string; value: string }> = [
    { label: "Nomor Surat", value: form.nomorSurat || "—" },
    { label: "Judul Arsip", value: form.judul || "—" },
    { label: "Kategori", value: form.kategori || "—" },
    { label: "Tahun", value: form.tahun || "—" },
    { label: "Lokasi Fisik", value: form.lokasiFisik || "—" },
    { label: "Nama File", value: form.file?.name || "—" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Preview Data</h3>
          <p className="text-[11px] text-muted-foreground">
            Periksa kembali sebelum menyimpan arsip
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-2.5">
        {items.map((i) => (
          <div
            key={i.label}
            className="flex items-start justify-between gap-3 border-b border-dashed border-border/60 pb-2 last:border-0 last:pb-0"
          >
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {i.label}
            </dt>
            <dd className="max-w-[60%] text-right text-xs font-medium text-foreground break-words">
              {i.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
