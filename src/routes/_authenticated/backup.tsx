import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DatabaseBackup, Play, Loader2 } from "lucide-react";
import { BackupSummary } from "@/components/backup/BackupSummary";
import { BackupStorage } from "@/components/backup/BackupStorage";
import { BackupGoogleDrive } from "@/components/backup/BackupGoogleDrive";
import { BackupSchedule, type Schedule } from "@/components/backup/BackupSchedule";
import { BackupTable } from "@/components/backup/BackupTable";
import { BackupRestore } from "@/components/backup/BackupRestore";
import { BackupDialog } from "@/components/backup/BackupDialog";
import { BackupEmptyState } from "@/components/backup/BackupEmptyState";
import { initialBackups, type BackupItem } from "@/lib/backup-data";

export const Route = createFileRoute("/_authenticated/backup")({
  head: () => ({ meta: [{ title: "Backup & Restore — SIPASTERA" }] }),
  component: BackupPage,
});

function BackupPage() {
  const [backups, setBackups] = useState<BackupItem[]>(initialBackups);
  const [schedule, setSchedule] = useState<Schedule>("harian");
  const [drive, setDrive] = useState(false);
  const [running, setRunning] = useState(false);
  const [del, setDel] = useState<BackupItem | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const summary = useMemo(() => {
    const ok = backups.filter((b) => b.status === "Berhasil");
    return {
      total: backups.length,
      last: ok[0]?.date ?? "—",
      size: "1.2 GB",
      status: ok.length > 0 ? "Aman" : "Perlu Backup",
    };
  }, [backups]);

  const handleBackupNow = () => {
    setRunning(true);
    setTimeout(() => {
      const now = new Date();
      const id = `bk-${now.getTime()}`;
      const item: BackupItem = {
        id,
        name: `backup-manual-${now.toISOString().slice(0, 10)}.zip`,
        date: now.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }),
        size: `${(240 + Math.random() * 10).toFixed(0)} MB`,
        type: "Manual",
        status: "Berhasil",
      };
      setBackups((p) => [item, ...p]);
      setRunning(false);
      setInfo("Backup berhasil dibuat.");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-sm shadow-blue-500/20">
            <DatabaseBackup className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Backup & Restore</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Lindungi seluruh data arsip dan konfigurasi SIPASTERA.
            </p>
          </div>
        </div>
        <button
          onClick={handleBackupNow}
          disabled={running}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 sm:self-auto"
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {running ? "Memproses..." : "Backup Sekarang"}
        </button>
      </div>

      <BackupSummary {...summary} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BackupSchedule value={schedule} onChange={setSchedule} />
        </div>
        <BackupStorage />
      </div>

      <BackupGoogleDrive connected={drive} onToggle={() => setDrive((v) => !v)} />

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Riwayat Backup</h3>
            <p className="text-xs text-muted-foreground">Daftar seluruh backup yang pernah dibuat.</p>
          </div>
          <span className="text-xs text-muted-foreground">{backups.length} backup</span>
        </div>
        {backups.length === 0 ? (
          <BackupEmptyState />
        ) : (
          <BackupTable
            data={backups}
            onDownload={(b) => setInfo(`Download "${b.name}" dimulai (simulasi).`)}
            onDelete={(b) => setDel(b)}
          />
        )}
      </div>

      <BackupRestore onRestore={(f) => setInfo(`Restore dari "${f}" berhasil disimulasikan.`)} />

      <BackupDialog
        open={!!del}
        title="Hapus Backup"
        subtitle="Tindakan ini tidak dapat dibatalkan."
        size="sm"
        onClose={() => setDel(null)}
      >
        <p className="text-sm text-foreground">
          Hapus backup <span className="font-semibold">{del?.name}</span>?
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={() => setDel(null)}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Batal
          </button>
          <button
            onClick={() => {
              if (del) setBackups((p) => p.filter((b) => b.id !== del.id));
              setDel(null);
            }}
            className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90"
          >
            Hapus
          </button>
        </div>
      </BackupDialog>

      <BackupDialog open={!!info} title="Informasi" size="sm" onClose={() => setInfo(null)}>
        <p className="text-sm text-foreground">{info}</p>
        <div className="mt-5 flex justify-end">
          <button
            onClick={() => setInfo(null)}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            OK
          </button>
        </div>
      </BackupDialog>
    </div>
  );
}