import { useEffect, useState } from "react";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
function formatTime(d: Date) {
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function WelcomeBanner({ name = "Pengguna", role = "—" }: { name?: string; role?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 text-white shadow-sm sm:p-7"
      style={{ backgroundImage: "var(--gradient-welcome)" }}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute right-20 top-8 h-24 w-24 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-10 right-1/3 h-32 w-32 rounded-full bg-white/5" />

      <div className="relative grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-wide text-white/80">
            {now ? `${formatDate(now)} · ${formatTime(now)} WITA` : "\u00A0"}
          </p>
          <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
            Selamat Datang, {name}!
          </h2>
          <p className="mt-1 text-sm text-white/85">
            Sistem Informasi Arsip Digital Sekolah Berbasis QR Code
          </p>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-white/70">Role Aktif</p>
            <p className="text-base font-semibold">{role}</p>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/15 text-base font-semibold ring-2 ring-white/30">
            {name.charAt(0)}
          </div>
        </div>
      </div>
    </div>
  );
}