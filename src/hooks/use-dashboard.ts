import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getDashboardOverview, type DashboardOverview } from "@/lib/dashboard.functions";
import { qk } from "@/lib/query-keys";

export function useDashboardOverview() {
  const fn = useServerFn(getDashboardOverview);
  return useQuery<DashboardOverview>({
    queryKey: qk.dashboard.overview,
    queryFn: () => fn(),
    staleTime: 30_000,
  });
}
