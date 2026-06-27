import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FilterValue = string; // "all" or specific

function FilterSelect({
  label,
  value,
  onChange,
  options,
  width = "w-[140px]",
}: {
  label: string;
  value: FilterValue;
  onChange: (v: FilterValue) => void;
  options: Array<{ value: string; label: string }>;
  width?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`h-10 ${width} rounded-lg bg-background`}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua {label}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ArsipFilter({
  tahun,
  setTahun,
  kategori,
  setKategori,
  jenis,
  setJenis,
  status,
  setStatus,
  tahunList,
  kategoriList,
  jenisList,
  statusList,
}: {
  tahun: string;
  setTahun: (v: string) => void;
  kategori: string;
  setKategori: (v: string) => void;
  jenis: string;
  setJenis: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  tahunList: number[];
  kategoriList: string[];
  jenisList: string[];
  statusList: string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect
        label="Tahun"
        value={tahun}
        onChange={setTahun}
        options={tahunList.map((y) => ({ value: String(y), label: String(y) }))}
      />
      <FilterSelect
        label="Kategori"
        value={kategori}
        onChange={setKategori}
        options={kategoriList.map((k) => ({ value: k, label: k }))}
        width="w-[170px]"
      />
      <FilterSelect
        label="Jenis"
        value={jenis}
        onChange={setJenis}
        options={jenisList.map((j) => ({ value: j, label: j }))}
        width="w-[150px]"
      />
      <FilterSelect
        label="Status"
        value={status}
        onChange={setStatus}
        options={statusList.map((s) => ({ value: s, label: s }))}
      />
    </div>
  );
}
