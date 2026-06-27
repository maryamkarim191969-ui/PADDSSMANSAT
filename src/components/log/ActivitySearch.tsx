import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ActivitySearch({
  value, onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cari user, modul, aktivitas…"
        className="h-9 pl-9"
      />
    </div>
  );
}