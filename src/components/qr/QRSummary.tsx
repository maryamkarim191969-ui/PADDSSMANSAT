import { QrCode, PowerOff, ScanLine, CalendarPlus } from "lucide-react";

type Props = {
  active: number;
  inactive: number;
  totalScan: number;
  createdThisMonth: number;
};

const items = (p: Props) => [
  {
    label: "QR Aktif",
    value: p.active,
    icon: QrCode,
    tone: "from-blue-500 to-violet-600",
    ring: "ring-blue-100",
  },
  {
    label: "QR Nonaktif",
    value: p.inactive,
    icon: PowerOff,
    tone: "from-slate-500 to-slate-700",
    ring: "ring-slate-100",
  },
  {
    label: "Total Scan",
    value: p.totalScan,
    icon: ScanLine,
    tone: "from-emerald-500 to-teal-600",
    ring: "ring-emerald-100",
  },
  {
    label: "Dibuat Bulan Ini",
    value: p.createdThisMonth,
    icon: CalendarPlus,
    tone: "from-amber-500 to-orange-600",
    ring: "ring-amber-100",
  },
];

export function QRSummary(props: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items(props).map((it) => {
        const Icon = it.icon;
        return (
          <div
            key={it.label}
            className="group rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{it.label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                  {it.value.toLocaleString("id-ID")}
                </p>
              </div>
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${it.tone} text-white shadow-sm ring-4 ${it.ring}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
