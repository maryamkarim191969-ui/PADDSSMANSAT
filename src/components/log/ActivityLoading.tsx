export function ActivityLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-muted" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl border border-border bg-muted" />
      <div className="h-96 animate-pulse rounded-2xl border border-border bg-muted" />
    </div>
  );
}