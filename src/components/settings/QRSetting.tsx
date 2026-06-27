import { QrCode } from "lucide-react";
import { SectionCard, Field, inputCls } from "./SectionCard";
import type { SystemSettings } from "@/lib/settings-data";

type Props = {
  value: SystemSettings["qr"];
  onChange: (v: SystemSettings["qr"]) => void;
};

export function QRSetting({ value, onChange }: Props) {
  return (
    <SectionCard title="Pengaturan QR Code" subtitle="Konfigurasi QR Code arsip." icon={QrCode} tone="from-rose-500 to-pink-600">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Ukuran QR">
          <select className={inputCls} value={value.size} onChange={(e) => onChange({ ...value, size: e.target.value })}>
            <option>128px</option>
            <option>256px</option>
            <option>512px</option>
          </select>
        </Field>
        <Field label="Format QR">
          <select className={inputCls} value={value.format} onChange={(e) => onChange({ ...value, format: e.target.value })}>
            <option>PNG</option>
            <option>SVG</option>
            <option>JPG</option>
          </select>
        </Field>
        <Field label="Default Public Link">
          <label className="mt-1 inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={value.publicLink}
              onChange={(e) => onChange({ ...value, publicLink: e.target.checked })}
              className="peer sr-only"
            />
            <span className="relative h-5 w-9 rounded-full bg-muted transition-colors peer-checked:bg-primary">
              <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
            </span>
            <span className="text-xs text-muted-foreground">Aktifkan public link</span>
          </label>
        </Field>
      </div>
    </SectionCard>
  );
}
