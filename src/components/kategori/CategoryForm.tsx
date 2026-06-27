import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Kategori, KategoriStatus } from "@/lib/kategori-data";

export type CategoryFormValues = {
  nama: string;
  kode: string;
  deskripsi: string;
  status: KategoriStatus;
};

export const EMPTY_FORM: CategoryFormValues = {
  nama: "",
  kode: "",
  deskripsi: "",
  status: "Aktif",
};

export function CategoryForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Simpan",
}: {
  initial?: Kategori | null;
  onSubmit: (values: CategoryFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<CategoryFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormValues, string>>>({});

  useEffect(() => {
    if (initial) {
      setForm({
        nama: initial.nama,
        kode: initial.kode,
        deskripsi: initial.deskripsi,
        status: initial.status,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.nama.trim()) next.nama = "Nama kategori wajib diisi";
    if (!form.kode.trim()) next.kode = "Kode kategori wajib diisi";
    else if (!/^[A-Z0-9-]{2,8}$/.test(form.kode.trim()))
      next.kode = "Gunakan 2-8 karakter huruf kapital/angka";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit({
      ...form,
      nama: form.nama.trim(),
      kode: form.kode.trim().toUpperCase(),
      deskripsi: form.deskripsi.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Field label="Nama Kategori" error={errors.nama}>
        <input
          autoFocus
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          placeholder="Contoh: Administrasi"
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Kode Kategori" error={errors.kode} hint="Huruf kapital, 2-8 karakter">
          <input
            value={form.kode}
            onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })}
            placeholder="ADM"
            className={`${inputCls} font-mono uppercase`}
          />
        </Field>
        <Field label="Status">
          <Select
            value={form.status}
            onValueChange={(v) => setForm({ ...form, status: v as KategoriStatus })}
          >
            <SelectTrigger className="h-10 rounded-lg bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aktif">Aktif</SelectItem>
              <SelectItem value="Nonaktif">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Deskripsi">
        <textarea
          rows={3}
          value={form.deskripsi}
          onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
          placeholder="Jelaskan fungsi kategori ini secara singkat..."
          className={`${inputCls} min-h-[88px] resize-y py-2`}
        />
      </Field>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          Batal
        </button>
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-[11px] font-medium text-destructive">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}