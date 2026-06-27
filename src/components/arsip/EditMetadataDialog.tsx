import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Arsip } from "@/lib/arsip-data";
import { STATUS_LIST, JENIS_LIST } from "@/lib/arsip-data";
import { useUpdateArsip } from "@/hooks/use-arsip";

export function EditMetadataDialog({
  arsip,
  open,
  onOpenChange,
  onSaved,
  kategoriList,
  tahunList,
  lokasiList,
}: {
  arsip: Arsip | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved?: (next: Arsip) => void;
  kategoriList: string[];
  tahunList: number[];
  lokasiList: string[];
}) {
  const [form, setForm] = useState<Arsip | null>(arsip);
  const update = useUpdateArsip();

  useEffect(() => {
    setForm(arsip);
  }, [arsip]);

  if (!form) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    try {
      const saved = await update.mutateAsync({
        id: form.id,
        nomorSurat: form.nomorSurat,
        judul: form.judul,
        kategori: form.kategori,
        jenis: form.jenis,
        tahun: form.tahun,
        lokasiFisik: form.lokasiFisik || null,
        status: form.status,
        deskripsi: form.deskripsi || null,
      });
      toast.success("Metadata arsip diperbarui.");
      onSaved?.(saved);
      onOpenChange(false);
    } catch (e) {
      toast.error("Gagal memperbarui metadata.", {
        description: (e as Error).message,
      });
    }
  }

  // Make sure the active values always appear in their dropdowns.
  const kategoriOpts = Array.from(new Set([...(kategoriList ?? []), form.kategori].filter(Boolean)));
  const tahunOpts = Array.from(new Set([...(tahunList ?? []), form.tahun])).sort((a, b) => b - a);
  const lokasiOpts = Array.from(
    new Set([...(lokasiList ?? []), form.lokasiFisik].filter((v): v is string => !!v)),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Metadata Arsip</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3">
          <Row label="Nomor Surat">
            <input
              required
              value={form.nomorSurat}
              onChange={(e) => setForm({ ...form, nomorSurat: e.target.value })}
              className={inputCls}
            />
          </Row>
          <Row label="Judul">
            <input
              required
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              className={inputCls}
            />
          </Row>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Row label="Kategori">
              {kategoriOpts.length > 0 ? (
                <Select
                  value={form.kategori}
                  onValueChange={(v) => setForm({ ...form, kategori: v })}
                >
                  <SelectTrigger className="h-10 rounded-lg bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {kategoriOpts.map((k) => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <input
                  required
                  value={form.kategori}
                  onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  className={inputCls}
                />
              )}
            </Row>
            <Row label="Tahun">
              <Select
                value={String(form.tahun)}
                onValueChange={(v) => setForm({ ...form, tahun: Number(v) })}
              >
                <SelectTrigger className="h-10 rounded-lg bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tahunOpts.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Row label="Jenis">
              <Select
                value={form.jenis}
                onValueChange={(v) => setForm({ ...form, jenis: v as Arsip["jenis"] })}
              >
                <SelectTrigger className="h-10 rounded-lg bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JENIS_LIST.map((j) => (
                    <SelectItem key={j} value={j}>{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
            <Row label="Status">
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as Arsip["status"] })}
              >
                <SelectTrigger className="h-10 rounded-lg bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_LIST.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
          </div>
          <Row label="Lokasi Fisik">
            {lokasiOpts.length > 0 ? (
              <Select
                value={form.lokasiFisik}
                onValueChange={(v) => setForm({ ...form, lokasiFisik: v })}
              >
                <SelectTrigger className="h-10 rounded-lg bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lokasiOpts.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <input
                value={form.lokasiFisik}
                onChange={(e) => setForm({ ...form, lokasiFisik: e.target.value })}
                className={inputCls}
              />
            )}
          </Row>
          <Row label="Deskripsi">
            <textarea
              rows={3}
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              className={`${inputCls} min-h-[88px] resize-y py-2`}
            />
          </Row>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-4 text-xs font-medium text-foreground hover:bg-muted"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={update.isPending}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60"
            >
              {update.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Simpan
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const inputCls =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
