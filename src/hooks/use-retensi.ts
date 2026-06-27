import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  listRetensi,
  type RetensiFilterInput,
  type RetensiRow,
  type RetensiSummary,
} from "@/lib/retensi.functions";
import { qk } from "@/lib/query-keys";

export function useRetensiList(filter: RetensiFilterInput) {
  const fn = useServerFn(listRetensi);
  return useQuery<{ rows: RetensiRow[]; summary: RetensiSummary }>({
    queryKey: qk.retensi.list(filter),
    queryFn: () => fn({ data: filter }),
    staleTime: 30_000,
  });
}
