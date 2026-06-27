import { Link } from "@tanstack/react-router";
import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";

export type RetensiAlertProps = {
  mendekati?: number;
  kadaluarsa?: number;
  nextItem?: {
    id: string;
    nomorSurat: string;
    judul: string;
    sisaHari: number;
  } | null;
};

export function RetensiAlert({
  mendekati = 0,
  kadaluarsa = 0,
  nextItem = null,
}: RetensiAlertProps) {
  const totalAlert = mendekati + kadaluarsa;
  const tone =
    kadaluarsa > 0
      ? "border-destructive/30 bg-destructive/5"
      : mendekati > 0
        ? "border-amber-300/50 bg-amber-50"
        : "border-border bg-card";
  const Icon = kadaluarsa > 0 ? ShieldAlert : mendekati > 0 ? AlertTriangle : ShieldCheck;
  const iconCls =
    kadaluarsa > 0
      ? "bg-destructive/10 text-destructive"
      : mendekati > 0
        ? "bg-amber-100 text-amber-700"
        : "bg-muted text-muted-foreground";

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border ${tone} p-4 shadow-sm sm:flex-row sm:items-center`}>
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconCls}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        {totalAlert === 0 ? (
          <>
            <p className="text-sm font-semibold text-foreground">Semua arsip aman</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tidak ada arsip yang mendekati atau melewati masa retensi.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-foreground">
              {kadaluarsa > 0 && `${kadaluarsa} arsip kadaluarsa`}
              {kadaluarsa > 0 && mendekati > 0 && " · "}
              {mendekati > 0 && `${mendekati} arsip mendekati retensi`}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {nextItem
                ? `Terdekat: ${nextItem.nomorSurat} — ${nextItem.judul}${
                    nextItem.sisaHari < 0
                      ? ` (terlewat ${Math.abs(nextItem.sisaHari)} hari)`
                      : ` (${nextItem.sisaHari} hari lagi)`
                  }`
                : "Tinjau daftar retensi untuk tindakan selanjutnya."}
            </p>
          </>
        )}
      </div>
      <Link
        to="/retensi"
        className="inline-flex h-9 shrink-0 items-center rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted"
      >
        Buka Retensi
      </Link>
    </div>
  );
}
