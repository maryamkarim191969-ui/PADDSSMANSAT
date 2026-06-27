import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Download, FileArchive, Trash2, UploadCloud } from "lucide-react";
import { ImportDropzone } from "@/components/import/ImportDropzone";
import { ImportZip } from "@/components/import/ImportZip";
import { ImportSummary } from "@/components/import/ImportSummary";
import { ImportTable } from "@/components/import/ImportTable";
import { ImportMetadata } from "@/components/import/ImportMetadata";
import { ImportProgress } from "@/components/import/ImportProgress";
import { ImportSuccessDialog } from "@/components/import/ImportSuccessDialog";
import { ImportErrorDialog } from "@/components/import/ImportErrorDialog";
import { ImportEmptyState } from "@/components/import/ImportEmptyState";
import { ImportLoading } from "@/components/import/ImportLoading";
import {
  buildItemFromFile,
  simulateZipExtract,
  type ImportItem,
} from "@/components/import/types";

export const Route = createFileRoute("/_authenticated/import")({
  head: () => ({
    meta: [
      { title: "Import Arsip — SIPASTERA" },
      {
        name: "description",
        content: "Migrasi arsip lama secara massal ke dalam sistem SIPASTERA.",
      },
    ],
  }),
  component: ImportPage,
});

type Tab = "multi" | "zip";

function ImportPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("multi");
  const [items, setItems] = useState<ImportItem[]>([]);
  const [scanning, setScanning] = useState(false);

  const [edit, setEdit] = useState<ImportItem | null>(null);

  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [success, setSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [errorOpen, setErrorOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  function addFiles(files: File[]) {
    setScanning(true);
    setTimeout(() => {
      const next = files.map(buildItemFromFile);
      setItems((prev) => [...prev, ...next]);
      setScanning(false);
    }, 500);
  }

  function addZip(zip: File) {
    setScanning(true);
    setTimeout(() => {
      const next = simulateZipExtract(zip);
      setItems((prev) => [...prev, ...next]);
      setScanning(false);
    }, 800);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clearAll() {
    setItems([]);
  }

  function saveEdit(next: ImportItem) {
    setItems((prev) => prev.map((i) => (i.id === next.id ? next : i)));
    setEdit(null);
  }

  function startImport() {
    const valid = items.filter((i) => i.status === "valid");
    if (valid.length === 0) return;
    setImporting(true);
    setProgress(0);
    setCurrent(1);
    const totalSteps = valid.length;
    timer.current = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 4);
        setCurrent(Math.max(1, Math.ceil((next / 100) * totalSteps)));
        if (next >= 100) {
          if (timer.current) clearInterval(timer.current);
          setTimeout(() => {
            setImporting(false);
            setImportedCount(valid.length);
            setItems((prev) =>
              prev.map((i) =>
                i.status === "valid" ? { ...i, status: "imported" } : i,
              ),
            );
            setSuccess(true);
          }, 250);
        }
        return next;
      });
    }, 120);
  }

  const validCount = items.filter((i) => i.status === "valid").length;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Import Arsip</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Migrasi puluhan hingga ribuan dokumen PDF dalam sekali jalan.
              </p>
            </div>
          </div>
          {items.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={clearAll}
                disabled={importing}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Kosongkan
              </button>
              <button
                onClick={startImport}
                disabled={importing || validCount === 0}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {importing ? "Memproses..." : `Import ${validCount} Arsip`}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Source picker */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 inline-flex rounded-lg bg-muted p-1">
          <button
            onClick={() => setTab("multi")}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${
              tab === "multi"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" /> Multi PDF
          </button>
          <button
            onClick={() => setTab("zip")}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${
              tab === "zip"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileArchive className="h-3.5 w-3.5" /> File ZIP
          </button>
        </div>

        {tab === "multi" ? (
          <ImportDropzone onFiles={addFiles} />
        ) : (
          <ImportZip onZip={addZip} />
        )}
      </section>

      {/* Statistik */}
      {items.length > 0 && <ImportSummary items={items} />}

      {/* Progress */}
      {importing && (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <ImportProgress
            progress={progress}
            current={current}
            total={validCount || 1}
          />
        </section>
      )}

      {/* Table / states */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Preview Metadata</h3>
            <p className="text-[11px] text-muted-foreground">
              Periksa dan sesuaikan metadata sebelum import.
            </p>
          </div>
          {items.length > 0 && (
            <p className="text-[11px] text-muted-foreground">
              {items.length} file • {validCount} valid
            </p>
          )}
        </div>

        {scanning ? (
          <ImportLoading rows={5} />
        ) : items.length === 0 ? (
          <ImportEmptyState />
        ) : (
          <ImportTable items={items} onEdit={setEdit} onRemove={removeItem} />
        )}
      </section>

      <ImportMetadata
        item={edit}
        open={!!edit}
        onOpenChange={(o) => !o && setEdit(null)}
        onSave={saveEdit}
      />
      <ImportSuccessDialog
        open={success}
        onOpenChange={setSuccess}
        count={importedCount}
        onClose={() => {
          setSuccess(false);
          setItems([]);
          setProgress(0);
        }}
        onGoToArsip={() => {
          setSuccess(false);
          navigate({ to: "/arsip" });
        }}
      />
      <ImportErrorDialog
        open={errorOpen}
        onOpenChange={setErrorOpen}
        onRetry={() => {
          setErrorOpen(false);
          startImport();
        }}
      />
    </div>
  );
}
