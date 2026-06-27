import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import type { LogEntry } from "@/lib/log-data";
import { formatWaktu } from "@/lib/log-data";
import { JenisBadge, StatusBadge } from "./ActivityStatusBadge";

export function ActivityDetail({
  row, open, onOpenChange,
}: {
  row: LogEntry | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail Aktivitas</DialogTitle>
          <DialogDescription>Informasi lengkap aktivitas pengguna.</DialogDescription>
        </DialogHeader>
        {row && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <JenisBadge jenis={row.jenis} />
              <StatusBadge status={row.status} />
            </div>
            <Field label="Aktivitas" value={row.aktivitas} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="User" value={row.user} />
              <Field label="Role" value={row.role} />
              <Field label="Modul" value={row.modul} />
              <Field label="IP Address" value={row.ip} mono />
              <Field label="Waktu" value={formatWaktu(row.waktu)} />
              <Field label="ID Log" value={row.id} mono />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Detail</p>
              <p className="mt-1 text-sm text-foreground/80">{row.detail}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm text-foreground ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}