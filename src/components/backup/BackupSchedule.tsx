import { Calendar } from "lucide-react";

export type Schedule = "off" | "harian" | "mingguan" | "bulanan";

type Props = { value: Schedule; onChange: (v: Schedule) => void };

export function BackupSchedule({ value, onChange }: Props) {
  const opts: { id: Schedule; label: string; desc: string }[] = [
    { id: "harian", label: "Harian", desc: "Setiap hari pukul 08:00" },
    { id: "mingguan", label: "Mingguan", desc: "Setiap Senin pukul 02:00" },
    { id: "bulanan", label: "Bulanan", desc: "Setiap tanggal 1 pukul 02:00" },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Auto Backup</p>
            <p className="text-xs text-muted-foreground">Atur jadwal backup otomatis.</p>
          </div>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
          <span>Aktif</span>
          <input
            type="checkbox"
            checked={value !== "off"}
            onChange={(e) => onChange(e.target.checked ? "harian" : "off")}
            className="peer sr-only"
          />
          <span className="relative h-5 w-9 rounded-full bg-muted transition-colors peer-checked:bg-primary">
            <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </span>
        </label>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {opts.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              disabled={value === "off"}
              onClick={() => onChange(o.id)}
              className={`rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                active
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              <p className="text-sm font-semibold text-foreground">{o.label}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{o.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
