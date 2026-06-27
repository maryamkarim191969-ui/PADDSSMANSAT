import { classifyConfidence } from "../services/metadataNormalizer";
import type { ExtractedField } from "../types";

const COLOR = {
  good: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  warn: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  low: "bg-destructive/15 text-destructive",
  missing: "bg-muted text-muted-foreground",
} as const;

const LABEL = {
  good: "Akurat",
  warn: "Verifikasi",
  low: "Confidence Rendah",
  missing: "Perlu Diisi Manual",
} as const;

export function ConfidenceBadge({
  field,
}: {
  field: ExtractedField<unknown>;
}) {
  const level = classifyConfidence(field);
  const pct =
    level === "missing"
      ? null
      : `${Math.round((field.confidence ?? 0) * 100)}%`;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${COLOR[level]}`}
    >
      {LABEL[level]}
      {pct ? <span className="opacity-70">{pct}</span> : null}
    </span>
  );
}
