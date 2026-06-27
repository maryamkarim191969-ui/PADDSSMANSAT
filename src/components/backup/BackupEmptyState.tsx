import { Database } from "lucide-react";

export function BackupEmptyState() {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
        <Database className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-medium text-foreground">Belum ada backup</p>
      <p className="mt-1 text-xs text-muted-foreground">Buat backup pertama Anda untuk melindungi data.</p>
    </div>
  );
}
