export function LoadingSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/5 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-1/4 animate-pulse rounded bg-muted/70" />
          </div>
          <div className="hidden h-3 w-24 animate-pulse rounded bg-muted md:block" />
          <div className="hidden h-3 w-20 animate-pulse rounded bg-muted lg:block" />
          <div className="hidden h-3 w-16 animate-pulse rounded bg-muted lg:block" />
          <div className="h-6 w-14 animate-pulse rounded-full bg-muted" />
          <div className="h-6 w-20 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
