import { Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  LOG_JENIS_LIST, LOG_MODUL_LIST, LOG_USER_LIST,
  type LogAktivitasJenis, type LogModul,
} from "@/lib/log-data";

export type ActivityFilterValue = {
  user?: string;
  modul?: LogModul;
  jenis?: LogAktivitasJenis;
  tanggal?: string;
};

const ALL = "__all__";

export function ActivityFilter({
  value, onChange,
}: {
  value: ActivityFilterValue;
  onChange: (v: ActivityFilterValue) => void;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter className="h-4 w-4 text-muted-foreground" /> Filter
        </div>
        <div className="ml-auto flex flex-wrap items-end gap-3">
          <SelectField
            label="User"
            value={value.user ?? ALL}
            onChange={(v) => onChange({ ...value, user: v === ALL ? undefined : v })}
            options={[{ value: ALL, label: "Semua User" }, ...LOG_USER_LIST.map((u) => ({ value: u, label: u }))]}
          />
          <SelectField
            label="Modul"
            value={value.modul ?? ALL}
            onChange={(v) => onChange({ ...value, modul: v === ALL ? undefined : (v as LogModul) })}
            options={[{ value: ALL, label: "Semua Modul" }, ...LOG_MODUL_LIST.map((m) => ({ value: m, label: m }))]}
          />
          <SelectField
            label="Aktivitas"
            value={value.jenis ?? ALL}
            onChange={(v) => onChange({ ...value, jenis: v === ALL ? undefined : (v as LogAktivitasJenis) })}
            options={[{ value: ALL, label: "Semua Aktivitas" }, ...LOG_JENIS_LIST.map((j) => ({ value: j, label: j }))]}
          />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Tanggal</span>
            <Input
              type="date"
              className="h-9 w-44"
              value={value.tanggal ?? ""}
              onChange={(e) => onChange({ ...value, tanggal: e.target.value || undefined })}
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => onChange({})}>Reset</Button>
        </div>
      </div>
    </section>
  );
}

function SelectField({
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
        <SelectTrigger className="h-9 w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}