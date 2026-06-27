import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { QrCode } from "lucide-react";
import { QRSummary } from "@/components/qr/QRSummary";
import { QRSearch } from "@/components/qr/QRSearch";
import { QRFilter, type QRFilterValue, type QRSortValue } from "@/components/qr/QRFilter";
import { QRTable } from "@/components/qr/QRTable";
import { QREmptyState } from "@/components/qr/QREmptyState";
import { QRBulkAction } from "@/components/qr/QRBulkAction";
import { QRDialog } from "@/components/qr/QRDialog";
import { QRDetail } from "@/components/qr/QRDetail";
import { initialQR, type QRItem } from "@/lib/qr-data";

export const Route = createFileRoute("/_authenticated/qr-code")({
  head: () => ({
    meta: [
      { title: "QR Code Management — SIPASTERA" },
      {
        name: "description",
        content: "Kelola seluruh QR Code arsip SIPASTERA: preview, analitik, dan aktivasi.",
      },
    ],
  }),
  component: QRCodePage,
});

function QRCodePage() {
  const [items, setItems] = useState<QRItem[]>(initialQR);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<QRFilterValue>("all");
  const [sort, setSort] = useState<QRSortValue>("terbaru");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [detail, setDetail] = useState<QRItem | null>(null);
  const [regen, setRegen] = useState<QRItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = items.filter((qr) => {
      if (q) {
        const hit =
          qr.nomorSurat.toLowerCase().includes(q) ||
          qr.namaArsip.toLowerCase().includes(q) ||
          qr.publicLink.toLowerCase().includes(q);
        if (!hit) return false;
      }
      switch (filter) {
        case "aktif":
          return qr.status === "Aktif";
        case "nonaktif":
          return qr.status === "Nonaktif";
        case "banyak":
          return qr.totalScan >= 100;
        case "belum":
          return qr.totalScan === 0;
        default:
          return true;
      }
    });
    out = [...out].sort((a, b) => {
      switch (sort) {
        case "terlama":
          return +new Date(a.createdAt) - +new Date(b.createdAt);
        case "scan-banyak":
          return b.totalScan - a.totalScan;
        case "scan-sedikit":
          return a.totalScan - b.totalScan;
        default:
          return +new Date(b.createdAt) - +new Date(a.createdAt);
      }
    });
    return out;
  }, [items, search, filter, sort]);

  const summary = useMemo(() => {
    const now = new Date();
    return {
      active: items.filter((q) => q.status === "Aktif").length,
      inactive: items.filter((q) => q.status === "Nonaktif").length,
      totalScan: items.reduce((a, b) => a + b.totalScan, 0),
      createdThisMonth: items.filter((q) => {
        const d = new Date(q.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
    };
  }, [items]);

  const toggleStatus = (qr: QRItem) => {
    const next = qr.status === "Aktif" ? "Nonaktif" : "Aktif";
    setItems((prev) =>
      prev.map((q) =>
        q.id === qr.id
          ? {
              ...q,
              status: next,
              history: [
                ...q.history,
                {
                  id: `h-${q.id}-${Date.now()}`,
                  action: next === "Aktif" ? "Diaktifkan" : "Dinonaktifkan",
                  at: new Date().toISOString(),
                  by: "Admin Sistem",
                },
              ],
            }
          : q,
      ),
    );
    if (detail?.id === qr.id) {
      setDetail((d) => (d ? { ...d, status: next } : d));
    }
    showToast(`QR ${qr.nomorSurat} ${next === "Aktif" ? "diaktifkan" : "dinonaktifkan"}.`);
  };

  const handleRegenerate = (qr: QRItem) => {
    const stamp = Date.now().toString(36).slice(-4);
    const newLink = `${qr.publicLink.split("?")[0]}?v=${stamp}`;
    setItems((prev) =>
      prev.map((q) =>
        q.id === qr.id
          ? {
              ...q,
              publicLink: newLink,
              history: [
                ...q.history,
                {
                  id: `h-${q.id}-${Date.now()}`,
                  action: "Regenerasi",
                  at: new Date().toISOString(),
                  by: "Admin Sistem",
                  note: "Public link diperbarui",
                },
              ],
            }
          : q,
      ),
    );
    setRegen(null);
    showToast(`QR ${qr.nomorSurat} berhasil di-regenerate.`);
  };

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      showToast("Link disalin ke clipboard.");
    } catch {
      showToast("Gagal menyalin link.");
    }
  };

  const openLink = (link: string) => {
    window.open(link, "_blank", "noreferrer");
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (all: boolean) => {
    setSelected(all ? new Set(filtered.map((q) => q.id)) : new Set());
  };

  const bulkSetStatus = (status: "Aktif" | "Nonaktif") => {
    setItems((prev) =>
      prev.map((q) =>
        selected.has(q.id)
          ? {
              ...q,
              status,
              history: [
                ...q.history,
                {
                  id: `h-${q.id}-${Date.now()}`,
                  action: status === "Aktif" ? "Diaktifkan" : "Dinonaktifkan",
                  at: new Date().toISOString(),
                  by: "Admin Sistem",
                  note: "Aksi massal",
                },
              ],
            }
          : q,
      ),
    );
    showToast(`${selected.size} QR ${status === "Aktif" ? "diaktifkan" : "dinonaktifkan"}.`);
    setSelected(new Set());
  };

  const bulkDownload = () => {
    showToast(`Mempersiapkan download ${selected.size} QR (simulasi).`);
    setSelected(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-sm shadow-blue-500/20">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">QR Code Management</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Kelola seluruh QR Code arsip, analitik, dan link publik dalam satu tempat.
            </p>
          </div>
        </div>
      </div>

      <QRSummary {...summary} />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <QRSearch value={search} onChange={setSearch} />
        <QRFilter value={filter} onChange={setFilter} sort={sort} onSortChange={setSort} />
      </div>

      {/* Table / Empty */}
      <div>
        <div className="mb-2 flex items-center justify-between px-1 text-xs text-muted-foreground">
          <span>
            Menampilkan <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            dari {items.length} QR
          </span>
          {selected.size > 0 && (
            <span className="font-medium text-foreground">{selected.size} dipilih</span>
          )}
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card">
            <QREmptyState
              title="Tidak ada QR yang cocok"
              subtitle="Coba ubah kata kunci pencarian atau filter."
            />
          </div>
        ) : (
          <QRTable
            data={filtered}
            selected={selected}
            onToggle={toggleSelect}
            onToggleAll={toggleSelectAll}
            onView={(qr) => setDetail(qr)}
            onCopy={copyLink}
            onOpen={openLink}
            onToggleStatus={toggleStatus}
            onRegenerate={(qr) => setRegen(qr)}
          />
        )}
      </div>

      <QRBulkAction
        count={selected.size}
        onClear={() => setSelected(new Set())}
        onActivate={() => bulkSetStatus("Aktif")}
        onDeactivate={() => bulkSetStatus("Nonaktif")}
        onDownload={bulkDownload}
      />

      {/* Detail Dialog */}
      <QRDialog
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Detail QR Code"
        subtitle={detail?.nomorSurat}
        size="xl"
      >
        {detail && (
          <QRDetail
            qr={detail}
            onCopy={copyLink}
            onOpen={openLink}
            onToggleStatus={toggleStatus}
            onRegenerate={(qr) => setRegen(qr)}
          />
        )}
      </QRDialog>

      {/* Regenerate confirmation */}
      <QRDialog
        open={!!regen}
        onClose={() => setRegen(null)}
        title="Regenerate QR Code"
        subtitle="Tindakan ini akan mengubah link publik."
        size="sm"
      >
        <p className="text-sm text-foreground">
          QR Code untuk arsip{" "}
          <span className="font-semibold">{regen?.nomorSurat}</span> akan diperbarui. Link lama
          tidak akan berfungsi lagi. Lanjutkan?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => setRegen(null)}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Batal
          </button>
          <button
            onClick={() => regen && handleRegenerate(regen)}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Regenerate
          </button>
        </div>
      </QRDialog>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground shadow-lg animate-in fade-in-0 slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  );
}
