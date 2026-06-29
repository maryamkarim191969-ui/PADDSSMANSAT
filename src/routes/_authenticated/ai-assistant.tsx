import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Sparkles, Bot, LifeBuoy } from "lucide-react";
import { AIChat } from "@/components/ai/AIChat";
import { AIHistory } from "@/components/ai/AIHistory";
import { AIQuickActions } from "@/components/ai/AIQuickActions";
import { AIInsightPanel } from "@/components/ai/AIInsightPanel";
import { AISuggestedCommands } from "@/components/ai/AISuggestedCommands";
import { AICapabilities } from "@/components/ai/AICapabilities";
import { useAIConversations } from "@/hooks/use-ai-conversations";
import type { AIConversation } from "@/lib/ai-data";

export const Route = createFileRoute("/_authenticated/ai-assistant")({
  head: () => ({ meta: [{ title: "PADDS SMANSAT AI Assistant — Pusat Bantuan Platform" }] }),
  component: AIAssistantPage,
});

function AIAssistantPage() {
  const { conversations, upsert, remove, removeMany, clearAll } = useAIConversations([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [seedPrompt, setSeedPrompt] = useState<string | null>(null);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  const handleUpsert = useCallback(
    (c: AIConversation) => {
      upsert(c);
      setActiveId((prev) => prev ?? c.id);
    },
    [upsert],
  );

  const start = useCallback(
    (firstPrompt: string): AIConversation => ({
      id: `c-${Date.now()}`,
      title: firstPrompt.slice(0, 48) + (firstPrompt.length > 48 ? "…" : ""),
      updatedAt: "Baru saja",
      messages: [],
    }),
    [],
  );

  const handleNew = () => {
    setActiveId(null);
    setSeedPrompt(null);
  };
  const handleDelete = (id: string) => {
    remove(id);
    if (activeId === id) setActiveId(null);
  };
  const handleDeleteMany = (ids: string[]) => {
    removeMany(ids);
    if (activeId && ids.includes(activeId)) setActiveId(null);
  };
  const handleClearAll = () => {
    clearAll();
    setActiveId(null);
  };

  const handleSelect = (id: string) => {
    setActiveId(id);
    setSeedPrompt(null);
  };

  const handleQuick = (prompt: string) => {
    const conv = start(prompt);
    upsert(conv);
    setActiveId(conv.id);
    setSeedPrompt(prompt);
  };

  // Clear seed prompt after one consumption tick
  useEffect(() => {
    if (!seedPrompt) return;
    const t = setTimeout(() => setSeedPrompt(null), 50);
    return () => clearTimeout(t);
  }, [seedPrompt]);

  return (
    <div className="space-y-6">
      {/* AI Assistant hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg shadow-blue-500/20 sm:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                PADDS SMANSAT AI Assistant
              </p>
              <h2 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">
                Pusat Bantuan Platform
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-white/80">
                Asisten resmi PADDS SMANSAT yang membantu Anda memahami fungsi
                setiap modul, cara penggunaan fitur, serta alur kerja
                pengarsipan pada platform.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium backdrop-blur">
              <LifeBuoy className="h-3.5 w-3.5" /> Digital Customer Assistant
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Knowledge Base PADDS SMANSAT
            </span>
          </div>
        </div>
      </section>

      {/* Insight panel — ringkasan visual platform, bukan tindakan AI */}
      <AIInsightPanel />

      {/* Quick actions — pintasan topik bantuan */}
      <div>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Topik Bantuan</h3>
            <p className="text-xs text-muted-foreground">
              Pilih topik untuk mendapatkan penjelasan singkat dari Asisten PADDS SMANSAT.
            </p>
          </div>
        </div>
        <AIQuickActions onPick={handleQuick} />
      </div>

      {/* Suggested commands — saran pertanyaan */}
      <AISuggestedCommands onPick={handleQuick} />

      {/* Workspace + history */}
      <div>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-foreground">Ruang Percakapan</h3>
          <p className="text-xs text-muted-foreground">
            Ajukan pertanyaan seputar penggunaan platform. Riwayat percakapan tersimpan di samping.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="lg:h-[640px]">
            <AIHistory
              items={conversations}
              activeId={activeId}
              onSelect={handleSelect}
              onNew={handleNew}
              onDelete={handleDelete}
              onDeleteMany={handleDeleteMany}
              onClearAll={handleClearAll}
            />
          </div>
          <div className="h-[640px]">
            <AIChat
              conversation={active}
              onUpdate={handleUpsert}
              onStart={start}
              seedPrompt={seedPrompt}
            />
          </div>
        </div>
      </div>

      {/* Capabilities — posisi AI Assistant pada arsitektur PADDS SMANSAT */}
      <AICapabilities />
    </div>
  );
}
