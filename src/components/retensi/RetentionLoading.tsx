export function RetentionLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-muted" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-2xl border border-border bg-muted" />
    </div>
  );
}