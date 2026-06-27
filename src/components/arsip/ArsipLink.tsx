import { useState } from "react";
import { Check, Copy, ExternalLink, Link2 } from "lucide-react";
import { publicLinkFor } from "./utils";

export function ArsipLink({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const url = publicLinkFor(id);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Link2 className="h-3.5 w-3.5" /> Public Link
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="flex-1 truncate rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground">
          {url}
        </code>
        <div className="flex gap-2">
          <button
            onClick={copy}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Tersalin" : "Copy Link"}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Buka
          </a>
        </div>
      </div>
    </div>
  );
}
