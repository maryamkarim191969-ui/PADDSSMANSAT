import { Box } from "lucide-react";
import { SectionCard, Field, inputCls } from "./SectionCard";
import type { SystemSettings } from "@/lib/settings-data";

type Props = {
  value: SystemSettings["app"];
  onChange: (v: SystemSettings["app"]) => void;
};

export function SystemIdentity({ value, onChange }: Props) {
  return (
    <SectionCard title="Identitas Sistem" subtitle="Branding aplikasi." icon={Box} tone="from-fuchsia-500 to-pink-600">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nama Aplikasi">
          <input className={inputCls} value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
        </Field>
        <Field label="Versi Aplikasi">
          <input className={inputCls} value={value.version} onChange={(e) => onChange({ ...value, version: e.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Deskripsi Sistem">
            <textarea
              className={`${inputCls} min-h-[72px]`}
              value={value.description}
              onChange={(e) => onChange({ ...value, description: e.target.value })}
            />
          </Field>
        </div>
      </div>
    </SectionCard>
  );
}
