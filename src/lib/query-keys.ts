/**
 * Centralized Query Key Factory — single source of truth for all TanStack
 * Query keys. Keep keys hierarchical so partial invalidation works (e.g.
 * `qk.arsip.all` invalidates every cached arsip query).
 *
 * Usage:
 *   useQuery({ queryKey: qk.arsip.list(filters), ... })
 *   queryClient.invalidateQueries({ queryKey: qk.arsip.all })
 */

export const qk = {
  arsip: {
    all: ["arsip"] as const,
    list: (filters: unknown) => ["arsip", "list", filters] as const,
    detail: (id: string) => ["arsip", "detail", id] as const,
    facets: ["arsip", "facets"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    overview: ["dashboard", "overview"] as const,
  },
  statistik: {
    all: ["statistik"] as const,
    overview: (filters: unknown) => ["statistik", "overview", filters] as const,
  },
  retensi: {
    all: ["retensi"] as const,
    list: (filters: unknown) => ["retensi", "list", filters] as const,
    summary: ["retensi", "summary"] as const,
  },
  kategori: {
    all: ["kategori"] as const,
    list: ["kategori", "list"] as const,
  },
  lokasi: {
    all: ["lokasi"] as const,
    list: ["lokasi", "list"] as const,
  },
  aktivitas: {
    all: ["aktivitas"] as const,
    recent: ["aktivitas", "recent"] as const,
  },
} as const;

/**
 * Invalidate every cache that depends on the `public.arsip` table.
 * Call after any create / update / delete on arsip so the entire consumer
 * layer (Manajemen, Cari, Dashboard, Statistik, Retensi) re-syncs.
 */
export const ARSIP_DEPENDENT_KEYS: readonly (readonly string[])[] = [
  qk.arsip.all,
  qk.dashboard.all,
  qk.statistik.all,
  qk.retensi.all,
  qk.aktivitas.all,
];
