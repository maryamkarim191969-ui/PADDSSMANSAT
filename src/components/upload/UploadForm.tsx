import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadDropzone } from "./UploadDropzone";
import {
  UPLOAD_KATEGORI,
  UPLOAD_LOKASI,
  UPLOAD_RETENSI,
  UPLOAD_STATUS,
  type UploadErrors,
  type UploadForm as TForm,
} from "./types";

type Props = {
  form: TForm;
  errors: UploadErrors;
  onChange: <K extends keyof TForm>(key: K, value: TForm[K]) => void;
};

export function UploadForm({ form, errors, onChange }: Props) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Field label="Nomor Surat" required error={errors.nomorSurat}>
        <input
          value={form.nomorSurat}
          onChange={(e) => onChange("nomorSurat", e.target.value)}
          placeholder="Contoh: SK-L/2026/0001"
          className={inputCls(!!errors.nomorSurat)}
        />
      </Field>

      <Field label="Judul Arsip" required error={errors.judul}>
        <input
          value={form.judul}
          onChange={(e) => onChange("judul", e.target.value)}
          placeholder="Contoh: Surat Tugas Kepala Sekolah"
          className={inputCls(!!errors.judul)}
        />
      </Field>

      <Field label="Kategori" required error={errors.kategori}>
        <Select value={form.kategori} onValueChange={(v) => onChange("kategori", v)}>
          <SelectTrigger className={selectCls(!!errors.kategori)}>
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {UPLOAD_KATEGORI.map((k) => (
              <SelectItem key={k} value={k}>{k}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Tahun" required error={errors.tahun}>
        <input
          type="number"
          min={2000}
          max={2100}
          value={form.tahun}
          onChange={(e) => onChange("tahun", e.target.value)}
          placeholder="2026"
          className={inputCls(!!errors.tahun)}
        />
      </Field>

      <Field label="Tanggal Surat">
        <input
          type="date"
          value={form.tanggalSurat}
          onChange={(e) => onChange("tanggalSurat", e.target.value)}
          className={inputCls(false)}
        />
      </Field>

      <Field label="Lokasi Fisik">
        <Select
          value={form.lokasiFisik}
          onValueChange={(v) => onChange("lokasiFisik", v)}
        >
          <SelectTrigger className={selectCls(false)}>
            <SelectValue placeholder="Pilih lokasi penyimpanan" />
          </SelectTrigger>
          <SelectContent>
            {UPLOAD_LOKASI.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Masa Retensi">
        <Select value={form.masaRetensi} onValueChange={(v) => onChange("masaRetensi", v)}>
          <SelectTrigger className={selectCls(false)}>
            <SelectValue placeholder="Pilih masa retensi" />
          </SelectTrigger>
          <SelectContent>
            {UPLOAD_RETENSI.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Status Arsip">
        <Select
          value={form.status}
          onValueChange={(v) => onChange("status", v as TForm["status"])}
        >
          <SelectTrigger className={selectCls(false)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UPLOAD_STATUS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="lg:col-span-2">
        <Field label="Deskripsi">
          <textarea
            rows={3}
            value={form.deskripsi}
            onChange={(e) => onChange("deskripsi", e.target.value)}
            placeholder="Tuliskan deskripsi singkat dokumen (opsional)"
            className={`${inputCls(false)} min-h-[96px] resize-y py-2`}
          />
        </Field>
      </div>

      <div className="lg:col-span-2">
        <Field label="Upload PDF" required error={errors.file}>
          <UploadDropzone
            file={form.file}
            onFile={(f) => onChange("file", f)}
            error={errors.file}
          />
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
    </label>
  );
}

const inputCls = (err: boolean) =>
  `h-10 w-full rounded-lg border ${err ? "border-destructive/60" : "border-input"} bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20`;

const selectCls = (err: boolean) =>
  `h-10 rounded-lg bg-background ${err ? "border-destructive/60" : ""}`;
