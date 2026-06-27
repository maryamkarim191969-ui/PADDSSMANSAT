import { ArrowRight, Activity, Eye } from "lucide-react";

export type AktivitasItem = { title: string; user: string; time: string };

export function AktivitasTerkini({ items = [] }: { items?: AktivitasItem[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h3 className="truncate text-sm font-semibold text-foreground">Aktivitas Terkini</h3>
        </div>
        <button className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline">
          Semua <ArrowRight className="h-3 w-3" />
        </button>
      </header>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-muted">
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">Belum ada aktivitas</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Aktivitas pengguna akan muncul di sini saat sistem mulai digunakan.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((a, i) => (
            <li key={i} className="flex items-start gap-3 px-5 py-3">
              <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                <Eye className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.user} · {a.time}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
