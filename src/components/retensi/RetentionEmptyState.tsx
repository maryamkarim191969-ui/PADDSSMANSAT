import { ShieldCheck } from "lucide-react";

export function RetentionEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">Tidak ada arsip ditemukan</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Coba ubah filter atau kata kunci pencarian Anda.
      </p>
    </div>
  );
}