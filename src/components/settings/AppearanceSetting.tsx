import { Palette, Sun, Moon, Monitor } from "lucide-react";
import { SectionCard } from "./SectionCard";
import type { ThemeMode } from "@/lib/settings-data";

type Props = { value: ThemeMode; onChange: (v: ThemeMode) => void };

export function AppearanceSetting({ value, onChange }: Props) {
  const opts: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ];
  return (
    <SectionCard title="Pengaturan Tampilan" subtitle="Pilih mode tampilan aplikasi." icon={Palette} tone="from-amber-500 to-orange-600">
      <div className="grid grid-cols-3 gap-2">
        {opts.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-colors ${
                active
                  ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/30"
                  : "border-border bg-card text-foreground hover:bg-accent"
              }`}
            >
              <o.icon className="h-4 w-4" />
              {o.label}
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}
