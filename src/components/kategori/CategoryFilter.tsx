import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CategorySortKey = "newest" | "oldest" | "az" | "za";

export const CATEGORY_SORT_OPTIONS: Array<{ value: CategorySortKey; label: string }> = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "az", label: "Nama A-Z" },
  { value: "za", label: "Nama Z-A" },
];

export function CategoryFilter({
  status,
  setStatus,
  sort,
  setSort,
}: {
  status: string;
  setStatus: (v: string) => void;
  sort: CategorySortKey;
  setSort: (v: CategorySortKey) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="h-10 w-[150px] rounded-lg bg-background">
          <Filter className="mr-1 h-4 w-4 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          <SelectItem value="Aktif">Aktif</SelectItem>
          <SelectItem value="Nonaktif">Nonaktif</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={(v) => setSort(v as CategorySortKey)}>
        <SelectTrigger className="h-10 w-[160px] rounded-lg bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}