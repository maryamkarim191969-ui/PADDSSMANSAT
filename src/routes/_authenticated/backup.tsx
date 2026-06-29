import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DatabaseBackup, Play, Loader2, Info } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BackupSummary } from "@/components/backup/BackupSummary";
import { BackupStorage } from "@/components/backup/BackupStorage";
import { BackupSchedule, type Schedule } from "@/components/backup/BackupSchedule";
import { BackupTable } from "@/components/backup/BackupTable";
import { BackupDialog } from "@/components/backup/BackupDialog";
import { BackupEmptyState } from "@/components/backup/BackupEmptyState";
import type { BackupItem } from "@/lib/backup-data";
import {
  createBackup,
  listBackups,
  deleteBackup,
  getBackupDownloadUrl,
  restoreBackup,
  type BackupRow,
} from "@/lib/backup.functions";
import { useCurrentUser } from "@/hooks/use-current-user";

export const Route = createFileRoute("/_authenticated/backup")({
  head: () => ({ meta: [{ title: "Backup & Restore — PADDS SMANSAT" }] }),
  component: BackupPage,
});

function toItem(r: BackupRow): BackupItem {
  return {
    id: r.id,
    name: r.name,
    date: new Date(r.createdAt).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    size: r.size || "—",
    type: r.type,
    status: r.status,
  };
}

function BackupPage() {
  const { user } = useCurrentUser();
  const isAdmin = user?.role === "Admin";

  const qc = useQueryClient();
  const list = useServerFn(listBackups);
  const create = useServerFn(createBackup);
  const del = useServerFn(deleteBackup);
  const dlUrl = useServerFn(getBackupDownloadUrl);
  const restore = useServerFn(restoreBackup);

  const backupsQ = useQuery({
    queryKey: ["backups"],
    queryFn: () => list(),
  });
  const backups = backupsQ.data ?? [];

  const [schedule, setSchedule] = useState<Schedule>("off");
  const [delItem, setDelItem] = useState<BackupRow | null>(null);
  const [restoreItem, setRestoreItem] = useState<BackupRow | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: () => create(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["backups"] });
      void qc.invalidateQueries({ queryKey: ["storage-stats"] });
      setInfo("Backup berhasil dibuat dan tersimpan di Cloudflare R2.");
    },
    onError: (e: Error) => setInfo(`Gagal membuat backup: ${e.message}`),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["backups"] });
      void qc.invalidateQueries({ queryKey: ["storage-stats"] });
    },
    onError: (e: Error) => setInfo(`Gagal menghapus backup: ${e.message}`),
  });
  const restoreMut = useMutation({
    mutationFn: (id: string) => restore({ data: { id } }),
    onSuccess: (res) => {
      void qc.invalidateQueries();
      const lines = Object.entries(res.restored)
        .map(([t, n]) => `${t}: ${n < 0 ? "gagal" : `${n} baris`}`)
        .join(", ");
      setInfo(`Restore selesai. ${lines}`);
    },
    onError: (e: Error) => setInfo(`Gagal restore: ${e.message}`),
  });

  const summary = useMemo(() => {
    const ok = backups.filter((b) => b.status === "Berhasil");
    const totalBytes = ok.reduce((acc, b) => acc + (b.bytes ?? 0), 0);
    const fmt = (n: number) => {
      if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
      if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
      return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
    };
    return {
      total: backups.length,
      last: ok[0]
        ? new Date(ok[0].createdAt).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "—",
      size: totalBytes ? fmt(totalBytes) : "—",
      status: ok.length > 0 ? "Aman" : "Perlu Backup",
    };
  }, [backups]);

  const handleDownload = async (b: BackupRow) => {
    try {
      const { url } = await dlUrl({ data: { id: b.id } });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setInfo(`Gagal menyiapkan download: ${(e as Error).message}`);
    }
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
              Lindungi seluruh data arsip dan konfigurasi PADDS SMANSAT.
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => createMut.mutate()}
            disabled={createMut.isPending}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 sm:self-auto"
          >
            {createMut.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {createMut.isPending ? "Memproses..." : "Backup Sekarang"}
          </button>
        )}
      </div>

      <BackupSummary {...summary} />

      <div className="flex items-start gap-2 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <p>
          Backup menyimpan snapshot seluruh tabel utama (arsip, kategori, lokasi, QR, log,
          pengaturan, profil) ke Cloudflare R2 sebagai file JSON. <b>Restore</b> akan menulis ulang
          data tabel arsip, kategori, lokasi, QR, dan pengaturan dari snapshot terpilih.
          Hanya Admin yang dapat membuat, mengunduh, menghapus, atau merestore backup.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BackupSchedule value={schedule} onChange={setSchedule} />
        </div>
        <BackupStorage />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Riwayat Backup</h3>
            <p className="text-xs text-muted-foreground">
              Daftar seluruh backup yang tersimpan di Cloudflare R2.
            </p>
          </div>
          <span className="text-xs text-muted-foreground">{backups.length} backup</span>
        </div>
        {backupsQ.isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Memuat...</div>
        ) : backups.length === 0 ? (
          <BackupEmptyState />
        ) : (
          <BackupTable
            data={backups.map(toItem)}
            onDownload={(b) => {
              const row = backups.find((x) => x.id === b.id);
              if (row) void handleDownload(row);
            }}
            onDelete={(b) => {
              const row = backups.find((x) => x.id === b.id);
              if (row) setDelItem(row);
            }}
          />
        )}
      </div>

      {isAdmin && backups.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Restore Data</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Pilih backup yang akan di-restore. Data tabel terkait akan ditimpa berdasarkan id.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {backups
              .filter((b) => b.status === "Berhasil" && b.storagePath)
              .slice(0, 5)
              .map((b) => (
                <button
                  key={b.id}
                  onClick={() => setRestoreItem(b)}
                  className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  {b.name}
                </button>
              ))}
          </div>
        </div>
      )}

      <BackupDialog
        open={!!delItem}
        title="Hapus Backup"
        subtitle="Tindakan ini tidak dapat dibatalkan."
        size="sm"
        onClose={() => setDelItem(null)}
      >
        <p className="text-sm text-foreground">
          Hapus backup <span className="font-semibold">{delItem?.name}</span>?
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={() => setDelItem(null)}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Batal
          </button>
          <button
            onClick={() => {
              if (delItem) deleteMut.mutate(delItem.id);
              setDelItem(null);
            }}
            className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90"
          >
            Hapus
          </button>
        </div>
      </BackupDialog>

      <BackupDialog
        open={!!restoreItem}
        title="Restore Backup"
        subtitle="Data tabel terkait akan ditimpa dengan data dari snapshot."
        size="sm"
        onClose={() => setRestoreItem(null)}
      >
        <p className="text-sm text-foreground">
          Restore dari <span className="font-semibold">{restoreItem?.name}</span>?
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={() => setRestoreItem(null)}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Batal
          </button>
          <button
            onClick={() => {
              if (restoreItem) restoreMut.mutate(restoreItem.id);
              setRestoreItem(null);
            }}
            disabled={restoreMut.isPending}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {restoreMut.isPending ? "Memproses..." : "Restore"}
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