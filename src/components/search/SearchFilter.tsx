import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LIST } from "@/lib/arsip-data";
import type { SearchSort } from "./utils";

export function SearchFilter({
  kategori,
  setKategori,
  tahun,
  setTahun,
  status,
  setStatus,
  lokasi,
  setLokasi,
  sort,
  setSort,
  kategoriList = [],
  tahunList = [],
  lokasiList = [],
}: {
  kategori: string;
  setKategori: (v: string) => void;
  tahun: string;
  setTahun: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  lokasi: string;
  setLokasi: (v: string) => void;
  sort: SearchSort;
  setSort: (v: SearchSort) => void;
  kategoriList?: string[];
  tahunList?: number[];
  lokasiList?: string[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      <Box label="Kategori">
        <Select value={kategori} onValueChange={setKategori}>
          <SelectTrigger className="h-9 rounded-lg bg-background text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {kategoriList.map((k) => (
              <SelectItem key={k} value={k}>{k}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Box>
      <Box label="Tahun">
        <Select value={tahun} onValueChange={setTahun}>
          <SelectTrigger className="h-9 rounded-lg bg-background text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tahun</SelectItem>
            {tahunList.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Box>
      <Box label="Status">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 rounded-lg bg-background text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {STATUS_LIST.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Box>
      <Box label="Lokasi">
        <Select value={lokasi} onValueChange={setLokasi}>
          <SelectTrigger className="h-9 rounded-lg bg-background text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Lokasi</SelectItem>
            {lokasiList.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Box>
      <Box label="Urutkan">
        <Select value={sort} onValueChange={(v) => setSort(v as SearchSort)}>
          <SelectTrigger className="h-9 rounded-lg bg-background text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Terbaru</SelectItem>
            <SelectItem value="oldest">Terlama</SelectItem>
            <SelectItem value="az">Judul A-Z</SelectItem>
            <SelectItem value="za">Judul Z-A</SelectItem>
          </SelectContent>
        </Select>
      </Box>
    </div>
  );
}

function Box({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}
