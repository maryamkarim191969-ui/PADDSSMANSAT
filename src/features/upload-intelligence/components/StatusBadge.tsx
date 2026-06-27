import { STATUS_LABEL, type UploadStatus } from "../constants";

const COLOR: Record<UploadStatus, string> = {
  menunggu: "bg-muted text-muted-foreground",
  dianalisis: "bg-primary/10 text-primary",
  ocr: "bg-primary/10 text-primary",
  ekstraksi: "bg-primary/10 text-primary",
  perlu_review: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  siap_upload: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  sedang_upload: "bg-primary/10 text-primary",
  berhasil: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  gagal: "bg-destructive/15 text-destructive",
};

export function StatusBadge({ status }: { status: UploadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${COLOR[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
