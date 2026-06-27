import {
  CheckCircle2,
  Database,
  FileText,
  Link2,
  QrCode,
  Save,
  UploadCloud,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const STEPS = [
  { label: "Upload File", icon: UploadCloud, threshold: 15 },
  { label: "Generate Metadata", icon: FileText, threshold: 30 },
  { label: "Generate QR Code", icon: QrCode, threshold: 50 },
  { label: "Generate Public Link", icon: Link2, threshold: 70 },
  { label: "Backup Google Drive", icon: Database, threshold: 85 },
  { label: "Simpan Arsip", icon: Save, threshold: 100 },
];

export function ImportProgress({
  progress,
  current,
  total,
}: {
  progress: number;
  current: number;
  total: number;
}) {
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            Memproses arsip {current} dari {total}...
          </p>
          <span className="text-xs font-semibold text-primary">{progress}%</span>
        </div>
        <Progress value={progress} />
      </div>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {STEPS.map((s) => {
          const done = progress >= s.threshold;
          const active = !done && progress >= s.threshold - 15;
          const Icon = done ? CheckCircle2 : s.icon;
          return (
            <li
              key={s.label}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                done
                  ? "text-foreground"
                  : active
                    ? "bg-primary/5 text-foreground"
                    : "text-muted-foreground"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  done
                    ? "text-emerald-600"
                    : active
                      ? "text-primary animate-pulse"
                      : "text-muted-foreground"
                }`}
              />
              <span className={done ? "font-medium" : ""}>{s.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
