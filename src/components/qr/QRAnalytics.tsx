import type { QRItem } from "@/lib/qr-data";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold tracking-tight text-foreground">
        {value.toLocaleString("id-ID")}
      </p>
    </div>
  );
}

export function QRAnalytics({ qr }: { qr: QRItem }) {
  const max = Math.max(1, ...qr.series);
  const labels = ["6h", "5h", "4h", "3h", "2h", "1h", "Hari ini"];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Total" value={qr.totalScan} />
        <Stat label="Hari Ini" value={qr.scanToday} />
        <Stat label="Minggu" value={qr.scanWeek} />
        <Stat label="Bulan" value={qr.scanMonth} />
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground">Scan 7 Hari Terakhir</p>
          <p className="text-[11px] text-muted-foreground">Maks {max} / hari</p>
        </div>
        <div className="flex h-32 items-end gap-2">
          {qr.series.map((v, i) => {
            const h = Math.round((v / max) * 100);
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-violet-500 transition-all hover:opacity-80"
                  style={{ height: `${Math.max(h, 4)}%` }}
                  title={`${v} scan`}
                />
                <span className="text-[10px] text-muted-foreground">{labels[i]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
