import { useEffect, useState } from "react";
import { Save } from "lucide-react";
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
import { IMPORT_KATEGORI, IMPORT_LOKASI, type ImportItem } from "./types";

export function ImportMetadata({
  item,
  open,
  onOpenChange,
  onSave,
}: {
  item: ImportItem | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (next: ImportItem) => void;
}) {
  const [form, setForm] = useState<ImportItem | null>(item);

  useEffect(() => setForm(item), [item]);
  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Metadata</DialogTitle>
          <p className="truncate text-xs text-muted-foreground">{form.fileName}</p>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form);
          }}
          className="space-y-3"
        >
          <Row label="Judul">
            <input
              required
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              className={inputCls}
            />
          </Row>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Row label="Tahun">
              <input
                type="number"
                value={form.tahun}
                onChange={(e) => setForm({ ...form, tahun: e.target.value })}
                className={inputCls}
              />
            </Row>
            <Row label="Kategori">
              <Select
                value={form.kategori}
                onValueChange={(v) => setForm({ ...form, kategori: v })}
              >
                <SelectTrigger className="h-10 rounded-lg bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMPORT_KATEGORI.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
          </div>
          <Row label="Lokasi Fisik">
            <Select
              value={form.lokasiFisik}
              onValueChange={(v) => setForm({ ...form, lokasiFisik: v })}
            >
              <SelectTrigger className="h-10 rounded-lg bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMPORT_LOKASI.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-background px-4 text-xs font-medium hover:bg-muted"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Save className="h-3.5 w-3.5" /> Simpan
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
