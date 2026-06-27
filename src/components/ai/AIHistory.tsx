import { useEffect, useState } from "react";
import { CheckSquare, MessageSquare, Plus, Square, Trash2, X } from "lucide-react";
import type { AIConversation } from "@/lib/ai-data";

type Props = {
  items: AIConversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onDeleteMany?: (ids: string[]) => void;
  onClearAll?: () => void;
};

export function AIHistory({ items, activeId, onSelect, onNew, onDelete, onDeleteMany, onClearAll }: Props) {
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<null | { kind: "one" | "many" | "all"; ids?: string[] }>(null);

  useEffect(() => {
    if (!selectMode) setSelected(new Set());
  }, [selectMode]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = items.length > 0 && selected.size === items.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)));

  const confirmText =
    confirm?.kind === "all"
      ? `Hapus semua ${items.length} percakapan secara permanen? Tindakan ini tidak dapat dibatalkan.`
      : confirm?.kind === "many"
      ? `Hapus ${confirm.ids?.length ?? 0} percakapan terpilih secara permanen?`
      : "Hapus percakapan ini secara permanen?";

  const runConfirm = () => {
    if (!confirm) return;
    if (confirm.kind === "all") {
      onClearAll?.();
      setSelectMode(false);
    } else if (confirm.kind === "many" && confirm.ids) {
      onDeleteMany?.(confirm.ids);
      setSelected(new Set());
      setSelectMode(false);
    } else if (confirm.kind === "one" && confirm.ids?.[0]) {
      onDelete(confirm.ids[0]);
    }
    setConfirm(null);
  };

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Riwayat Percakapan</p>
          <p className="text-[11px] text-muted-foreground">{items.length} percakapan</p>
        </div>
        <div className="flex items-center gap-1.5">
          {!selectMode ? (
            <>
              {items.length > 0 && (
                <button
                  onClick={() => setSelectMode(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                  title="Pilih untuk hapus"
                >
                  <CheckSquare className="h-3.5 w-3.5" /> Pilih
                </button>
              )}
              <button
                onClick={onNew}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" /> Baru
              </button>
            </>
          ) : (
            <button
              onClick={() => setSelectMode(false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <X className="h-3.5 w-3.5" /> Batal
            </button>
          )}
        </div>
      </div>

      {selectMode && items.length > 0 && (
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
          <button
            onClick={toggleAll}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary"
          >
            {allSelected ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
            {allSelected ? "Batalkan semua" : "Pilih semua"}
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">{selected.size} terpilih</span>
            <button
              disabled={selected.size === 0}
              onClick={() => setConfirm({ kind: "many", ids: Array.from(selected) })}
              className="inline-flex items-center gap-1 rounded-md bg-destructive px-2 py-1 text-[11px] font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-3 w-3" /> Hapus
            </button>
            <button
              onClick={() => setConfirm({ kind: "all" })}
              className="inline-flex items-center gap-1 rounded-md border border-destructive/40 px-2 py-1 text-[11px] font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              Hapus semua
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {items.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            Belum ada percakapan.
          </div>
        ) : (
          <ul className="space-y-1">
            {items.map((c) => {
              const active = c.id === activeId;
              const isChecked = selected.has(c.id);
              return (
                <li key={c.id}>
                  <div
                    className={`group flex items-start gap-2 rounded-xl px-3 py-2 transition-colors ${
                      active ? "bg-accent" : "hover:bg-accent/60"
                    }`}
                  >
                    {selectMode && (
                      <button
                        onClick={() => toggle(c.id)}
                        className="mt-0.5 text-muted-foreground hover:text-primary"
                        aria-label={isChecked ? "Batalkan pilihan" : "Pilih"}
                      >
                        {isChecked ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => (selectMode ? toggle(c.id) : onSelect(c.id))}
                      className="flex min-w-0 flex-1 items-start gap-2 text-left"
                    >
                      <MessageSquare className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{c.updatedAt}</p>
                      </div>
                    </button>
                    {!selectMode && (
                      <button
                        onClick={() => setConfirm({ kind: "one", ids: [c.id] })}
                        className="rounded-md p-1 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                        aria-label="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {confirm && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirm(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Hapus permanen</p>
                <p className="mt-1 text-xs text-muted-foreground">{confirmText}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirm(null)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
              >
                Batal
              </button>
              <button
                onClick={runConfirm}
                className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:opacity-90"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}