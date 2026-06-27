import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
};

export function PagePlaceholder({ title, subtitle, icon: Icon = Construction }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">Segera Hadir</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Halaman ini akan dikembangkan pada sprint berikutnya.
        </p>
      </div>
    </div>
  );
}