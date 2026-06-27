export function LocationLoading({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] text-sm">
        <thead>
          <tr className="bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3">Nama Lokasi</th>
            <th className="px-3 py-3">Kode</th>
            <th className="px-3 py-3">Ruangan</th>
            <th className="px-3 py-3">Rak / Lemari</th>
            <th className="px-3 py-3">Jumlah</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td className="px-4 py-3">
                <div className="h-4 w-40 rounded bg-muted" />
              </td>
              <td className="px-3 py-3">
                <div className="h-4 w-14 rounded bg-muted" />
              </td>
              <td className="px-3 py-3">
                <div className="h-4 w-28 rounded bg-muted" />
              </td>
              <td className="px-3 py-3">
                <div className="h-4 w-24 rounded bg-muted" />
              </td>
              <td className="px-3 py-3">
                <div className="h-4 w-10 rounded bg-muted" />
              </td>
              <td className="px-3 py-3">
                <div className="h-5 w-16 rounded-md bg-muted" />
              </td>
              <td className="px-3 py-3">
                <div className="ml-auto flex w-24 justify-end gap-1">
                  <div className="h-8 w-8 rounded-md bg-muted" />
                  <div className="h-8 w-8 rounded-md bg-muted" />
                  <div className="h-8 w-8 rounded-md bg-muted" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
