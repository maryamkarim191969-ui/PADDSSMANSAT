import { Users } from "lucide-react";

export function UserEmptyState() {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
        <Users className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">Tidak ada user ditemukan</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Sesuaikan pencarian atau filter, atau tambahkan user baru.
      </p>
    </div>
  );
}