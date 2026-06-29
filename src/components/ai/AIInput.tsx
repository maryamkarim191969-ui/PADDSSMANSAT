import { Send, Loader2 } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Slot kiri (mis. tombol lampiran). */
  leftSlot?: ReactNode;
  /** Slot di atas input (mis. preview lampiran). */
  topSlot?: ReactNode;
};

export function AIInput({
  value,
  onChange,
  onSubmit,
  disabled,
  loading,
  leftSlot,
  topSlot,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, [value]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSubmit();
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
      {topSlot}
      <div className="flex items-end gap-2">
        {leftSlot}
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Tanyakan apa saja seputar arsip atau PADDS SMANSAT..."
          rows={1}
          className="min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-sm transition-all enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Kirim"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
      <p className="px-3 pb-1 pt-0.5 text-[10px] text-muted-foreground">
        Tekan Enter untuk mengirim, Shift+Enter untuk baris baru.
      </p>
    </div>
  );
}