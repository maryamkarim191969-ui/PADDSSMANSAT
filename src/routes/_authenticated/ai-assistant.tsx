import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bot } from "lucide-react";
import { AIChat } from "@/components/ai/AIChat";
import { AIHistory } from "@/components/ai/AIHistory";
import { AIQuickActions } from "@/components/ai/AIQuickActions";
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
      {/* Header ringkas — identitas AI Assistant tanpa hero berlebihan */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-foreground">
              AI Assistant
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Digital Customer Assistant PADDS SMANSAT — membantu Anda
              memahami fungsi modul, cara penggunaan fitur, dan alur kerja
              pengarsipan.
            </p>
          </div>
        </div>
      </section>

      {/* Ruang percakapan diutamakan — riwayat di samping */}
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
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

      {/* Panduan cepat & saran perintah — dikelompokkan di bawah agar chat mendapat fokus utama */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            Topik Bantuan
          </h3>
          <AIQuickActions onPick={handleQuick} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            Saran Pertanyaan
          </h3>
          <AISuggestedCommands onPick={handleQuick} />
        </div>
      </div>

      <AICapabilities />
    </div>
  );
}
