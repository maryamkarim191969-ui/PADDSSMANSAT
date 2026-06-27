import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  getStatistikOverview,
  type StatistikFilterInput,
  type StatistikOverview,
} from "@/lib/statistik.functions";
import { qk } from "@/lib/query-keys";

export function useStatistikOverview(filter: StatistikFilterInput) {
  const fn = useServerFn(getStatistikOverview);
  return useQuery<StatistikOverview>({
    queryKey: qk.statistik.overview(filter),
    queryFn: () => fn({ data: filter }),
    staleTime: 30_000,
  });
}
