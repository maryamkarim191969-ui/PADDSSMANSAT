import { Activity } from "lucide-react";

export function ActivityEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
        <Activity className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">Belum ada aktivitas</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Tidak ditemukan log aktivitas untuk filter yang dipilih.
      </p>
    </div>
  );
}