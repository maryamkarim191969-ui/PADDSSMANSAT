import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";

import { aiSearchArsip, type AiSearchHit } from "@/lib/ai-search.functions";
import { SearchCard, type SearchActions } from "./SearchCard";

type Stage = "idle" | "fetching" | "reasoning" | "ranking" | "done" | "error";

const STAGES: { key: Exclude<Stage, "idle" | "error">; label: string; hint: string }[] = [
  { key: "fetching", label: "Memuat data arsip", hint: "Mengumpulkan arsip terbaru yang dapat Anda akses" },
  { key: "reasoning", label: "Menganalisis permintaan", hint: "Memahami isi pertanyaan Anda secara kontekstual" },
  { key: "ranking", label: "Memilih dokumen relevan", hint: "Menilai relevansi setiap dokumen terhadap permintaan" },
  { key: "done", label: "Menyusun hasil", hint: "Mengurutkan rekomendasi berdasarkan tingkat relevansi" },
];

function StageRow({
  label,
  hint,
  state,
}: {
  label: string;
  hint: string;
  state: "pending" | "active" | "done";
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background/60 px-3 py-2.5">
      <div className="mt-0.5">
        {state === "done" ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        ) : state === "active" ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <div className="h-4 w-4 rounded-full border-2 border-border" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

export function AISearchPanel({ actions }: { actions: SearchActions }) {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [hits, setHits] = useState<AiSearchHit[]>([]);
  const [lastQuery, setLastQuery] = useState("");
  const [totalScanned, setTotalScanned] = useState(0);
  const stageTimers = useRef<number[]>([]);

  const fn = useServerFn(aiSearchArsip);
  const mut = useMutation({
    mutationFn: (q: string) => fn({ data: { query: q, limit: 10 } }),
    onSuccess: (res) => {
      stageTimers.current.forEach((t) => window.clearTimeout(t));
      stageTimers.current = [];
      setStage("done");
      setHits(res.hits);
      setTotalScanned(res.totalScanned);
    },
    onError: () => {
      stageTimers.current.forEach((t) => window.clearTimeout(t));
      stageTimers.current = [];
      setStage("error");
    },
  });

  useEffect(() => {
    return () => stageTimers.current.forEach((t) => window.clearTimeout(t));
  }, []);

  const submit = () => {
    const q = query.trim();
    if (!q || mut.isPending) return;
    setHits([]);
    setLastQuery(q);
    setStage("fetching");
    stageTimers.current.forEach((t) => window.clearTimeout(t));
    stageTimers.current = [];
    stageTimers.current.push(
      window.setTimeout(() => setStage((s) => (s === "fetching" ? "reasoning" : s)), 700),
      window.setTimeout(() => setStage((s) => (s === "reasoning" ? "ranking" : s)), 1500),
    );
    mut.mutate(q);
  };

  const errorMsg = mut.error instanceof Error ? mut.error.message : null;

  const stageIndex = (() => {
    switch (stage) {
      case "fetching": return 0;
      case "reasoning": return 1;
      case "ranking": return 2;
      case "done": return 4;
      default: return -1;
    }
  })();

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <header className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500/15 to-violet-500/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-foreground">AI Document Search</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Cari arsip menggunakan bahasa alami — sebutkan isi pembahasan, nama instansi,
            kegiatan, atau topik dokumen yang Anda ingat.
          </p>
        </div>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Contoh: surat undangan rapat dari Dinas Pendidikan tentang kurikulum"
          className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-32 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          autoComplete="off"
          disabled={mut.isPending}
        />
        <button
          type="submit"
          disabled={mut.isPending || query.trim().length < 2}
          className="absolute right-2 top-1/2 inline-flex h-8 -translate-y-1/2 items-center gap-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 px-3 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mut.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Brain className="h-3.5 w-3.5" />
          )}
          Cari dengan AI
        </button>
      </form>

      {mut.isPending && (
        <div className="space-y-2 rounded-xl border border-border bg-background/40 p-3">
          {STAGES.map((s, i) => (
            <StageRow
              key={s.key}
              label={s.label}
              hint={s.hint}
              state={
                stageIndex > i ? "done" : stageIndex === i ? "active" : "pending"
              }
            />
          ))}
        </div>
      )}

      {stage === "error" && errorMsg && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <div>
            <p className="font-semibold">Gagal menjalankan pencarian AI</p>
            <p className="mt-0.5 text-destructive/80">{errorMsg}</p>
          </div>
        </div>
      )}

      {stage === "done" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>
              Menampilkan{" "}
              <span className="font-semibold text-foreground">{hits.length}</span>{" "}
              rekomendasi untuk{" "}
              <span className="font-semibold text-foreground">"{lastQuery}"</span>
            </p>
            <p>{totalScanned} arsip dipertimbangkan</p>
          </div>
          {hits.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-background/40 p-8 text-center">
              <p className="text-sm font-semibold text-foreground">
                Belum ada arsip yang sesuai dengan permintaan tersebut.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Coba gunakan kata yang berbeda, sebutkan nama instansi atau topik yang
                lebih spesifik, atau gunakan pencarian konvensional pada tab Pencarian
                Standar.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {hits.map((h) => (
                <div key={h.arsip.id} className="space-y-2">
                  <SearchCard arsip={h.arsip} actions={actions} />
                  <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-[11px] text-foreground">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p>
                        <span className="font-semibold">Relevansi {(h.score * 100).toFixed(0)}%</span>
                        {h.reason ? <span className="text-muted-foreground"> — {h.reason}</span> : null}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}