import { Database, Clock, HardDrive, ShieldCheck } from "lucide-react";

type Props = {
  total: number;
  last: string;
  size: string;
  status: string;
};

export function BackupSummary({ total, last, size, status }: Props) {
  const items = [
    { label: "Total Backup", value: String(total), icon: Database, tone: "from-blue-500 to-violet-600" },
    { label: "Backup Terakhir", value: last, icon: Clock, tone: "from-emerald-500 to-teal-600" },
    { label: "Ukuran Data", value: size, icon: HardDrive, tone: "from-amber-500 to-orange-600" },
    { label: "Status", value: status, icon: ShieldCheck, tone: "from-fuchsia-500 to-pink-600" },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{it.label}</p>
            <div className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${it.tone} text-white`}>
              <it.icon className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-lg font-semibold text-foreground">{it.value}</p>
        </div>
      ))}
    </div>
  );
}
