import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Lokasi, LokasiStatus } from "@/lib/lokasi-data";

export type LocationFormValues = {
  nama: string;
  kode: string;
  ruangan: string;
  rak: string;
  deskripsi: string;
  status: LokasiStatus;
};

export const EMPTY_LOCATION_FORM: LocationFormValues = {
  nama: "",
  kode: "",
  ruangan: "",
  rak: "",
  deskripsi: "",
  status: "Aktif",
};

export function LocationForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Simpan",
}: {
  initial?: Lokasi | null;
  onSubmit: (values: LocationFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<LocationFormValues>(EMPTY_LOCATION_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof LocationFormValues, string>>>({});

  useEffect(() => {
    if (initial) {
      setForm({
        nama: initial.nama,
        kode: initial.kode,
        ruangan: initial.ruangan,
        rak: initial.rak,
        deskripsi: initial.deskripsi,
        status: initial.status,
      });
    } else {
      setForm(EMPTY_LOCATION_FORM);
    }
    setErrors({});
  }, [initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.nama.trim()) next.nama = "Nama lokasi wajib diisi";
    if (!form.kode.trim()) next.kode = "Kode lokasi wajib diisi";
    else if (!/^[A-Z0-9-]{2,12}$/.test(form.kode.trim()))
      next.kode = "Gunakan 2-12 karakter huruf kapital/angka/dash";
    if (!form.ruangan.trim()) next.ruangan = "Ruangan wajib diisi";
    if (!form.rak.trim()) next.rak = "Rak / lemari wajib diisi";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit({
      ...form,
      nama: form.nama.trim(),
      kode: form.kode.trim().toUpperCase(),
      ruangan: form.ruangan.trim(),
      rak: form.rak.trim(),
      deskripsi: form.deskripsi.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Field label="Nama Lokasi" error={errors.nama}>
        <input
          autoFocus
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          placeholder="Contoh: Ruang TU - Lemari A1"
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Kode Lokasi" error={errors.kode} hint="Huruf kapital, 2-12 karakter">
          <input
            value={form.kode}
            onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })}
            placeholder="TU-A1"
            className={`${inputCls} font-mono uppercase`}
          />
        </Field>
        <Field label="Status">
          <Select
            value={form.status}
            onValueChange={(v) => setForm({ ...form, status: v as LokasiStatus })}
          >
            <SelectTrigger className="h-10 rounded-lg bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aktif">Aktif</SelectItem>
              <SelectItem value="Nonaktif">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Ruangan" error={errors.ruangan}>
          <input
            value={form.ruangan}
            onChange={(e) => setForm({ ...form, ruangan: e.target.value })}
            placeholder="Contoh: Ruang Tata Usaha"
            className={inputCls}
          />
        </Field>
        <Field label="Rak / Lemari" error={errors.rak}>
          <input
            value={form.rak}
            onChange={(e) => setForm({ ...form, rak: e.target.value })}
            placeholder="Contoh: Lemari A1"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Deskripsi">
        <textarea
          rows={3}
          value={form.deskripsi}
          onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
          placeholder="Jelaskan jenis arsip yang disimpan di lokasi ini..."
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
