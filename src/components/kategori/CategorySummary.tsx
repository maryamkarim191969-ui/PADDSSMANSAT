import { Tag, CheckCircle2, XCircle } from "lucide-react";

export function CategorySummary({
  total,
  aktif,
  nonaktif,
}: {
  total: number;
  aktif: number;
  nonaktif: number;
}) {
  const items = [
    {
      label: "Total Kategori",
      value: total,
      icon: Tag,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Kategori Aktif",
      value: aktif,
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Kategori Nonaktif",
      value: nonaktif,
      icon: XCircle,
      tone: "bg-slate-100 text-slate-500",
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