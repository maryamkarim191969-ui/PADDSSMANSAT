import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  AlertTriangle,
  Loader2,
  ScanSearch,
  ShieldQuestion,
  Sparkles,
} from "lucide-react";

import {
  aiInvestigateDuplicates,
  type DuplicateCluster,
} from "@/lib/ai-investigation.functions";
import { SearchCard, type SearchActions } from "./SearchCard";

/**
 * AI Document Search — Tindak Lanjut. Workspace investigasi kualitas
 * database arsip. AI mengelompokkan arsip yang berpotensi duplikat
 * sehingga administrator dapat langsung meninjau dan mengambil tindakan
 * (lihat detail, preview, download, salin tautan, cetak QR) tanpa
 * berpindah ke Manajemen Arsip.
 */
export function AIInvestigationPanel({ actions }: { actions: SearchActions }) {
  const [focus, setFocus] = useState("");
  const [clusters, setClusters] = useState<DuplicateCluster[]>([]);
  const [totalScanned, setTotalScanned] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const fn = useServerFn(aiInvestigateDuplicates);
  const mut = useMutation({
    mutationFn: (input: { focus: string }) =>
      fn({ data: { focus: input.focus, limitClusters: 15 } }),
    onSuccess: (res) => {
      setClusters(res.clusters);
      setTotalScanned(res.totalScanned);
      setDismissed(new Set());
    },
  });

  const errorMsg = mut.error instanceof Error ? mut.error.message : null;
  const visible = clusters.filter((c) => !dismissed.has(c.id));

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <header className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-500/15 to-primary/10 text-primary">
          <ShieldQuestion className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-foreground">
            Tindak Lanjut — Investigasi Database
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Minta AI menelusuri database arsip untuk mengidentifikasi
            kemungkinan penyimpanan ganda. Kosongkan kolom fokus untuk
            memeriksa keseluruhan arsip terbaru, atau isi konteks tertentu
            (mis. nama instansi, topik, tahun) untuk mempersempit investigasi.
          </p>
        </div>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (mut.isPending) return;
          mut.mutate({ focus: focus.trim() });
        }}
        className="relative"
      >
        <ScanSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          placeholder="Fokus investigasi (opsional) — contoh: surat undangan rapat 2024"
          className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-40 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          autoComplete="off"
          disabled={mut.isPending}
        />
        <button
          type="submit"
          disabled={mut.isPending}
          className="absolute right-2 top-1/2 inline-flex h-8 -translate-y-1/2 items-center gap-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-primary px-3 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mut.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          Jalankan Investigasi
        </button>
      </form>

      {errorMsg ? (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <div>
            <p className="font-semibold">Gagal menjalankan investigasi</p>
            <p className="mt-0.5 text-destructive/80">{errorMsg}</p>
          </div>
        </div>
      ) : null}

      {mut.isSuccess ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">
              {visible.length}
            </span>{" "}
            kelompok potensi duplikat ditemukan
          </p>
          <p>{totalScanned} arsip diperiksa</p>
        </div>
      ) : null}

      {mut.isSuccess && visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background/40 p-8 text-center">
          <p className="text-sm font-semibold text-foreground">
            Tidak ditemukan indikasi penyimpanan ganda.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Database arsip pada cakupan investigasi ini terlihat konsisten.
            Anda dapat menjalankan investigasi ulang dengan fokus yang lebih
            spesifik bila diperlukan.
          </p>
        </div>
      ) : null}

      <div className="space-y-4">
        {visible.map((c) => (
          <article
            key={c.id}
            className="rounded-2xl border border-amber-300 bg-amber-50/40 p-3 sm:p-4"
          >
            <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div className="flex min-w-0 items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Kelompok indikasi duplikat ({c.arsip.length} arsip)
                  </p>
                  <p className="text-[11px] text-amber-900">
                    {c.reason || "Metadata arsip menunjukkan indikasi kesamaan."}
                    <span className="ml-1 rounded-md bg-amber-100 px-1.5 py-0.5 font-semibold">
                      Keyakinan {(c.confidence * 100).toFixed(0)}%
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDismissed((cur) => {
                    const next = new Set(cur);
                    next.add(c.id);
                    return next;
                  })
                }
                className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                Abaikan Kelompok
              </button>
            </header>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {c.arsip.map((a) => (
                <SearchCard key={a.id} arsip={a} actions={actions} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}