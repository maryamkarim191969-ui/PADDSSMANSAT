import { Filter } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RETENSI_STATUS_LIST, type RetensiStatus } from "@/lib/retensi-data";

export type RetentionFilterValue = {
  tahun?: number;
  kategori?: string;
  status?: RetensiStatus;
};

const ALL = "__all__";

export function RetentionFilter({
  value,
  onChange,
  tahunList = [],
  kategoriList = [],
}: {
  value: RetentionFilterValue;
  onChange: (v: RetentionFilterValue) => void;
  tahunList?: number[];
  kategoriList?: string[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter className="h-4 w-4 text-muted-foreground" /> Filter
        </div>
        <div className="ml-auto flex flex-wrap items-end gap-3">
          <FilterSelect
            label="Tahun"
            value={value.tahun ? String(value.tahun) : ALL}
            onChange={(v) => onChange({ ...value, tahun: v === ALL ? undefined : Number(v) })}
            options={[{ value: ALL, label: "Semua Tahun" }, ...tahunList.map((y: number) => ({ value: String(y), label: String(y) }))]}
          />
          <FilterSelect
            label="Kategori"
            value={value.kategori ?? ALL}
            onChange={(v) => onChange({ ...value, kategori: v === ALL ? undefined : v })}
            options={[{ value: ALL, label: "Semua Kategori" }, ...kategoriList.map((k: string) => ({ value: k, label: k }))]}
          />
          <FilterSelect
            label="Status"
            value={value.status ?? ALL}
            onChange={(v) => onChange({ ...value, status: v === ALL ? undefined : (v as RetensiStatus) })}
            options={[{ value: ALL, label: "Semua Status" }, ...RETENSI_STATUS_LIST.map((s) => ({ value: s, label: s }))]}
          />
          <Button variant="outline" size="sm" onClick={() => onChange({})}>Reset</Button>
        </div>
      </div>
    </section>
  );
}

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}