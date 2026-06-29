import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { AIMessage } from "./AIMessage";
import { AILoading } from "./AILoading";
import { AIError } from "./AIError";
import { AIEmptyState } from "./AIEmptyState";
import { AIInput } from "./AIInput";
import { AISuggestion } from "./AISuggestion";
import type { AIConversation, AIMessage as TMsg } from "@/lib/ai-data";

type Props = {
  conversation: AIConversation | null;
  onUpdate: (c: AIConversation) => void;
  onStart: (firstPrompt: string) => AIConversation;
  seedPrompt?: string | null;
};

function toUIMessages(messages: TMsg[]): UIMessage[] {
  return messages.map((m) => ({
    id: m.id,
    role: m.role === "ai" ? "assistant" : "user",
    parts: [{ type: "text", text: m.content }],
  }));
}

function extractText(m: UIMessage): string {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

function nowStamp() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AIChat({ conversation, onUpdate, onStart, seedPrompt }: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Endpoint AI Assistant adalah Digital Customer Assistant: tidak butuh
  // autentikasi atau header tambahan, dan tidak mengirim konteks sesi
  // operasional apa pun ke server.
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/ai-chat" }),
    [],
  );

  const { messages, sendMessage, setMessages, status, error, regenerate, stop } =
    useChat({ transport });

  const isStreaming = status === "submitted" || status === "streaming";

  // Sync useChat messages when switching threads from the sidebar.
  const currentThreadRef = useRef<string | null>(null);
  useEffect(() => {
    const id = conversation?.id ?? null;
    if (id === currentThreadRef.current) return;
    currentThreadRef.current = id;
    setMessages(conversation ? toUIMessages(conversation.messages) : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isStreaming, messages[messages.length - 1]?.parts]);

  // Track the "live" conversation id used for persistence — may differ from
  // the prop when the user starts a brand-new chat (the prop is null until
  // we create one here and notify the parent).
  const liveConvRef = useRef<AIConversation | null>(conversation);
  useEffect(() => {
    if (conversation) liveConvRef.current = conversation;
  }, [conversation]);

  // Persist messages back to parent on every settled change.
  const lastSyncedKeyRef = useRef<string>("");
  useEffect(() => {
    if (messages.length === 0) return;
    if (isStreaming) return;

    const conv = liveConvRef.current;
    if (!conv) return;

    const synced: TMsg[] = messages.map((m) => ({
      id: m.id,
      role: m.role === "assistant" ? "ai" : "user",
      content: extractText(m),
      timestamp: nowStamp(),
    }));
    const key = `${conv.id}|` + synced.map((m) => `${m.id}:${m.content.length}`).join("|");
    if (key === lastSyncedKeyRef.current) return;
    lastSyncedKeyRef.current = key;

    onUpdate({ ...conv, messages: synced, updatedAt: "Baru saja" });
  }, [messages, isStreaming, onUpdate]);

  const send = (text: string) => {
    const base = text.trim();
    if (!base) return;
    if (isStreaming) return;

    setInput("");

    // Ensure we have a live conversation id before firing the request,
    // so the eventual sync writes to the correct thread in localStorage.
    if (!liveConvRef.current) {
      const fresh = onStart(base);
      liveConvRef.current = fresh;
      currentThreadRef.current = fresh.id;
      onUpdate(fresh);
    }

    void sendMessage({ text: base });
  };

  // Auto-fire seed prompt (from quick actions / suggested commands)
  const seededRef = useRef<string | null>(null);
  useEffect(() => {
    if (!seedPrompt) return;
    const key = `${conversation?.id ?? "new"}:${seedPrompt}`;
    if (seededRef.current === key) return;
    if (messages.length > 0) return;
    seededRef.current = key;
    send(seedPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedPrompt, conversation?.id]);

  const hasMessages = messages.length > 0;
  const errorMessage = error
    ? error.message || "Tidak dapat menghubungi Asisten PADDS SMANSAT. Mohon coba lagi."
    : null;

  return (
    <div className="relative flex h-full flex-col rounded-2xl border border-border bg-card/40 shadow-sm">
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {!hasMessages ? (
          <div className="space-y-6">
            <AIEmptyState />
            <AISuggestion onPick={send} />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => {
              const text = extractText(m);
              return (
                <div key={m.id} className="space-y-2">
                  <AIMessage
                    message={{
                      id: m.id,
                      role: m.role === "assistant" ? "ai" : "user",
                      content: text,
                      timestamp: "",
                    }}
                  />
                </div>
              );
            })}
            {status === "submitted" && <AILoading />}
            {errorMessage && (
              <AIError message={errorMessage} onRetry={() => regenerate()} />
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      <div className="border-t border-border bg-card p-3 sm:p-4">
        <AIInput
          value={input}
          onChange={setInput}
          onSubmit={() => (isStreaming ? stop() : send(input))}
          loading={isStreaming}
        />
      </div>
    </div>
  );
}
