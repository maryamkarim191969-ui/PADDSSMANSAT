import { useCallback, useEffect, useRef, useState } from "react";
import type { AIConversation } from "@/lib/ai-data";

const STORAGE_KEY = "sipastera.ai.conversations.v1";

type PersistedShape = {
  version: 1;
  conversations: AIConversation[];
};

function loadInitial(initial: AIConversation[]): AIConversation[] {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as PersistedShape;
    if (parsed && parsed.version === 1 && Array.isArray(parsed.conversations)) {
      return parsed.conversations;
    }
  } catch (e) {
    console.warn("[ai] gagal memuat riwayat percakapan", e);
  }
  return initial;
}

export function useAIConversations(initial: AIConversation[] = []) {
  const [conversations, setConversations] = useState<AIConversation[]>(initial);
  const hydrated = useRef(false);

  // Hydrate from localStorage after mount (avoid SSR mismatch)
  useEffect(() => {
    setConversations(loadInitial(initial));
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change, debounced via microtask batching
  useEffect(() => {
    if (!hydrated.current || typeof window === "undefined") return;
    try {
      const payload: PersistedShape = { version: 1, conversations };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("[ai] gagal menyimpan riwayat percakapan", e);
    }
  }, [conversations]);

  const upsert = useCallback((c: AIConversation) => {
    setConversations((prev) => {
      const exists = prev.some((x) => x.id === c.id);
      return exists ? prev.map((x) => (x.id === c.id ? c : x)) : [c, ...prev];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const removeMany = useCallback((ids: string[]) => {
    const set = new Set(ids);
    setConversations((prev) => prev.filter((c) => !set.has(c.id)));
  }, []);

  const clearAll = useCallback(() => {
    setConversations([]);
  }, []);

  return { conversations, setConversations, upsert, remove, removeMany, clearAll };
}
