import { Clock } from "lucide-react";
import { SectionCard, Field, inputCls } from "./SectionCard";
import type { SystemSettings } from "@/lib/settings-data";

type Props = {
  value: SystemSettings["time"];
  onChange: (v: SystemSettings["time"]) => void;
};

export function TimezoneSetting({ value, onChange }: Props) {
  return (
    <SectionCard title="Pengaturan Waktu" subtitle="Zona waktu dan format tanggal." icon={Clock} tone="from-sky-500 to-blue-600">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Timezone">
          <select className={inputCls} value={value.timezone} onChange={(e) => onChange({ ...value, timezone: e.target.value })}>
            <option>WIB (UTC+7)</option>
            <option>WITA (UTC+8)</option>
            <option>WIT (UTC+9)</option>
          </select>
        </Field>
        <Field label="Format Tanggal">
          <select className={inputCls} value={value.dateFormat} onChange={(e) => onChange({ ...value, dateFormat: e.target.value })}>
            <option>DD MMM YYYY</option>
            <option>DD/MM/YYYY</option>
            <option>YYYY-MM-DD</option>
          </select>
        </Field>
        <Field label="Format Waktu">
          <select className={inputCls} value={value.timeFormat} onChange={(e) => onChange({ ...value, timeFormat: e.target.value })}>
            <option>24 jam</option>
            <option>12 jam</option>
          </select>
        </Field>
      </div>
    </SectionCard>
  );
}
