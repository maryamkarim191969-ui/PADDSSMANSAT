import { Languages } from "lucide-react";
import { SectionCard, Field, inputCls } from "./SectionCard";

type Props = { value: string; onChange: (v: string) => void };

export function LanguageSetting({ value, onChange }: Props) {
  return (
    <SectionCard title="Pengaturan Bahasa" subtitle="Multi bahasa akan tersedia segera." icon={Languages} tone="from-emerald-500 to-teal-600">
      <Field label="Bahasa Aplikasi">
        <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="id">Bahasa Indonesia</option>
          <option value="en" disabled>
            English (Segera)
          </option>
        </select>
      </Field>
    </SectionCard>
  );
}
