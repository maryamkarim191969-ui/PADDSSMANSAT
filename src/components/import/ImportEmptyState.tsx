import { FolderInput } from "lucide-react";

export function ImportEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-muted">
        <FolderInput className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">Belum ada file</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Unggah beberapa file PDF atau sebuah file ZIP untuk memulai migrasi arsip
        massal.
      </p>
    </div>
  );
}
