import { CheckCircle2, FileText, Link2, QrCode, Save, UploadCloud } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const STEPS = [
  { label: "Upload PDF", icon: UploadCloud, threshold: 20 },
  { label: "Generate QR Code", icon: QrCode, threshold: 40 },
  { label: "Generate Public Link", icon: Link2, threshold: 60 },
  { label: "Backup Google Drive", icon: FileText, threshold: 80 },
  { label: "Simpan Metadata", icon: Save, threshold: 100 },
];

export function UploadLoading({ progress }: { progress: number }) {
  return (
    <div className="space-y-4 py-2">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Memproses arsip...</p>
          <span className="text-xs font-semibold text-primary">{progress}%</span>
        </div>
        <Progress value={progress} />
      </div>
      <ul className="space-y-1.5">
        {STEPS.map((s) => {
          const done = progress >= s.threshold;
          const active = !done && progress >= s.threshold - 20;
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
                className={`h-4 w-4 ${done ? "text-emerald-600" : active ? "text-primary animate-pulse" : "text-muted-foreground"}`}
              />
              <span className={done ? "font-medium" : ""}>{s.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
