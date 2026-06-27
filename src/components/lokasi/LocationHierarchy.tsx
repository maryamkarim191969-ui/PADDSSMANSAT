import { Building2, Archive, Layers, FolderArchive, ChevronRight } from "lucide-react";

export function LocationHierarchy({
  ruangan,
  rak,
  kode,
  ordner = "Ordner",
}: {
  ruangan: string;
  rak: string;
  kode: string;
  ordner?: string;
}) {
  const steps = [
    { label: ruangan, icon: Building2, tone: "bg-primary/10 text-primary" },
    { label: rak, icon: Archive, tone: "bg-sky-50 text-sky-600" },
    { label: `Rak ${kode}`, icon: Layers, tone: "bg-amber-50 text-amber-600" },
    { label: `${ordner} ${kode}`, icon: FolderArchive, tone: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Hierarki Penyimpanan
      </p>
      <div className="rounded-xl border border-border bg-card p-3">
        {/* Desktop horizontal flow */}
        <div className="hidden flex-wrap items-center gap-2 sm:flex">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${step.tone}`}>
                <step.icon className="h-3.5 w-3.5" />
                <span>{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
              )}
            </div>
          ))}
        </div>
        {/* Mobile vertical tree */}
        <ol className="space-y-1.5 sm:hidden">
          {steps.map((step, i) => (
            <li key={i} className="flex items-center gap-2" style={{ paddingLeft: `${i * 12}px` }}>
              {i > 0 && <span className="text-muted-foreground/60">↳</span>}
              <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${step.tone}`}>
                <step.icon className="h-3.5 w-3.5" />
                <span>{step.label}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
