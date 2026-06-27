import { MapPin, CheckCircle2, Archive } from "lucide-react";

export function LocationSummary({
  total,
  aktif,
  totalArsip,
}: {
  total: number;
  aktif: number;
  totalArsip: number;
}) {
  const items = [
    {
      label: "Total Lokasi",
      value: total.toLocaleString("id-ID"),
      icon: MapPin,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Lokasi Aktif",
      value: aktif.toLocaleString("id-ID"),
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Total Arsip Tersimpan",
      value: totalArsip.toLocaleString("id-ID"),
      icon: Archive,
      tone: "bg-sky-50 text-sky-600",
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <div
          key={it.label}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/30"
        >
          <div className={`grid h-11 w-11 place-items-center rounded-xl ${it.tone}`}>
            <it.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {it.label}
            </p>
            <p className="mt-0.5 text-xl font-semibold text-foreground">{it.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
