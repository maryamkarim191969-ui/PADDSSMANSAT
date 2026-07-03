import { useEffect, useState } from "react";
import {
  FileText,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JENIS_OPTIONS, RETENSI_OPTIONS, STATUS_OPTIONS } from "../constants";
import { DEFAULT_FORM, validateForm } from "../services/formMapping";
import type {
  ArsipFormErrors,
  ArsipFormValues,
  MasterOption,
  QueuedFile,
} from "../types";
import { formatBytes } from "./utils";

type Props = {
  item: QueuedFile | null;
  masters: { kategori: MasterOption[]; lokasi: MasterOption[] };
  onClose: () => void;
  onChange: (id: string, patch: Partial<ArsipFormValues>) => void;
  onUpload: (id: string) => void;
  busy: boolean;
  categoryProposal?: { value: string; alasan: string } | null;
  approvingCategory?: boolean;
  onApproveCategory?: (id: string) => void;
  onDismissCategoryProposal?: (id: string) => void;
};

export function ArsipFormSheet({
  item,
  masters,
  onClose,
  onChange,
  onUpload,
  busy,
  categoryProposal = null,
  approvingCategory = false,
  onApproveCategory,
  onDismissCategoryProposal,
}: Props) {
  const [errors, setErrors] = useState<ArsipFormErrors>({});

  useEffect(() => {
    setErrors({});
  }, [item?.id]);

  const open = item !== null;
  const form = item?.form ?? DEFAULT_FORM;
  const aiFilled = item?.aiFilled ?? {};

  function patch<K extends keyof ArsipFormValues>(
    key: K,
    value: ArsipFormValues[K],
  ) {
    if (!item) return;
    onChange(item.id, { [key]: value } as Partial<ArsipFormValues>);
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function submit() {
    if (!item) return;
    const next = validateForm(form);
    setErrors(next);
    if (Object.keys(next).length === 0) onUpload(item.id);
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="text-base">Form Arsip</SheetTitle>
          <SheetDescription className="text-xs">
            Tinjau data hasil AI Analisis Metadata. AI Pengecekan Nomor Surat
            dijalankan pada tahapan tersendiri di halaman Upload Arsip.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {item ? (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(item.file.size)} •{" "}
                  {item.file.type || "tipe tidak dikenal"}
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nomor Surat" required ai={aiFilled.nomorSurat} error={errors.nomorSurat}>
              <Input
                value={form.nomorSurat}
                onChange={(e) => patch("nomorSurat", e.target.value)}
                placeholder="Contoh: SK-L/2026/0001"
                className="h-10"
              />
            </Field>

            <Field label="Judul Arsip" required ai={aiFilled.judul} error={errors.judul}>
              <Input
                value={form.judul}
                onChange={(e) => patch("judul", e.target.value)}
                placeholder="Contoh: Surat Tugas Kepala Sekolah"
                className="h-10"
              />
            </Field>

            <Field label="Kategori" required ai={aiFilled.kategori} error={errors.kategori}>
              <Select
                value={form.kategori || undefined}
                onValueChange={(v) => patch("kategori", v)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {masters.kategori.length === 0 ? (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      Belum ada kategori. Tambahkan via Manajemen Kategori.
                    </div>
                  ) : (
                    masters.kategori.map((k) => (
                      <SelectItem key={k.id} value={k.nama}>
                        {k.nama}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Tahun" required ai={aiFilled.tahun} error={errors.tahun}>
              <Input
                type="number"
                min={2000}
                max={2100}
                value={form.tahun}
                onChange={(e) => patch("tahun", e.target.value)}
                placeholder="2026"
                className="h-10"
              />
            </Field>

            <Field label="Status Surat" required ai={aiFilled.jenis}>
              <Select
                value={form.jenis}
                onValueChange={(v) => patch("jenis", v as ArsipFormValues["jenis"])}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Pilih status surat" />
                </SelectTrigger>
                <SelectContent>
                  {JENIS_OPTIONS.map((j) => (
                    <SelectItem key={j} value={j}>
                      {j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Tanggal Surat" ai={aiFilled.tanggalSurat}>
              <Input
                type="date"
                value={form.tanggalSurat}
                onChange={(e) => patch("tanggalSurat", e.target.value)}
                className="h-10"
              />
            </Field>

            <Field label="Lokasi Fisik" ai={aiFilled.lokasiFisik}>
              <Select
                value={form.lokasiFisik || undefined}
                onValueChange={(v) => patch("lokasiFisik", v)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Pilih lokasi penyimpanan" />
                </SelectTrigger>
                <SelectContent>
                  {masters.lokasi.length === 0 ? (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      Belum ada lokasi. Tambahkan via Manajemen Lokasi.
                    </div>
                  ) : (
                    masters.lokasi.map((l) => (
                      <SelectItem key={l.id} value={l.nama}>
                        {l.nama}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Masa Retensi">
              <Select
                value={form.masaRetensi || undefined}
                onValueChange={(v) => patch("masaRetensi", v)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Pilih masa retensi" />
                </SelectTrigger>
                <SelectContent>
                  {RETENSI_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Status Arsip">
              <Select
                value={form.status}
                onValueChange={(v) => patch("status", v as ArsipFormValues["status"])}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Deskripsi" ai={aiFilled.deskripsi}>
                <Textarea
                  rows={4}
                  value={form.deskripsi}
                  onChange={(e) => patch("deskripsi", e.target.value)}
                  placeholder="Tuliskan deskripsi singkat dokumen (opsional)"
                  className="min-h-[96px] resize-y"
                />
              </Field>
            </div>
          </div>

          {item?.error ? (
            <div className="mt-4 flex items-start justify-between gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs">
              <p className="text-destructive">{item.error}</p>
              <X className="h-3.5 w-3.5 text-destructive/70" />
            </div>
          ) : null}

          {categoryProposal && item ? (
            <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">
                    AI Smart Category — usulan kategori baru
                  </p>
                  <p className="mt-0.5 text-muted-foreground">
                    AI menilai dokumen ini tidak sesuai dengan kategori aktif
                    yang tersedia dan mengusulkan kategori baru berikut.
                    Kategori baru hanya dibuat setelah Anda menyetujui.
                  </p>
                  <div className="mt-2 rounded-md border border-border bg-background p-2">
                    <p className="text-sm font-semibold text-foreground">
                      {categoryProposal.value}
                    </p>
                    {categoryProposal.alasan ? (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Alasan AI: {categoryProposal.alasan}
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onApproveCategory?.(item.id)}
                      disabled={approvingCategory}
                    >
                      {approvingCategory ? (
                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                      ) : null}
                      Setujui &amp; Tambahkan
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onDismissCategoryProposal?.(item.id)}
                      disabled={approvingCategory}
                    >
                      Abaikan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <SheetFooter className="gap-2 border-t border-border px-5 py-3 sm:gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Tutup
          </Button>
          <Button type="button" onClick={submit} disabled={busy || !item}>
            Simpan &amp; Upload
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  required,
  ai,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  ai?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label} {required ? <span className="text-destructive">*</span> : null}
        </Label>
        {ai ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            Diisi AI
          </span>
        ) : null}
      </div>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : null}
    </div>
  );
}