import type { LogStatus, LogAktivitasJenis } from "@/lib/log-data";

const STATUS_STYLE: Record<LogStatus, string> = {
  Berhasil: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Gagal: "bg-rose-50 text-rose-700 ring-rose-200",
};

const JENIS_STYLE: Record<LogAktivitasJenis, string> = {
  Login: "bg-violet-50 text-violet-700 ring-violet-200",
  Upload: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Edit: "bg-amber-50 text-amber-700 ring-amber-200",
  Hapus: "bg-rose-50 text-rose-700 ring-rose-200",
  Lihat: "bg-blue-50 text-blue-700 ring-blue-200",
  Export: "bg-cyan-50 text-cyan-700 ring-cyan-200",
};

export function StatusBadge({ status }: { status: LogStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLE[status]}`}>
      {status}
    </span>
  );
}

export function JenisBadge({ jenis }: { jenis: LogAktivitasJenis }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${JENIS_STYLE[jenis]}`}>
      {jenis}
    </span>
  );
}