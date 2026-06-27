/**
 * Shared TanStack Query hooks for arsip CRUD + faceted filters.
 * Centralizes invalidation: every mutation refreshes the entire consumer
 * layer (Manajemen / Cari / Dashboard / Statistik / Retensi).
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  getArsip,
  getArsipFacets,
  listArsip,
  updateArsip,
  type ListArsipInput,
  type ListArsipResult,
  type UpdateArsipInput,
  type ArsipFacets,
} from "@/lib/arsip.functions";
import { deleteArsip as deleteArsipServer } from "@/lib/storage.functions";
import { ARSIP_DEPENDENT_KEYS, qk } from "@/lib/query-keys";
import type { Arsip } from "@/lib/arsip-data";

function invalidateAllConsumers(qc: ReturnType<typeof useQueryClient>) {
  for (const key of ARSIP_DEPENDENT_KEYS) {
    void qc.invalidateQueries({ queryKey: key });
  }
}

export function useArsipList(input: ListArsipInput) {
  const fn = useServerFn(listArsip);
  return useQuery<ListArsipResult>({
    queryKey: qk.arsip.list(input),
    queryFn: () => fn({ data: input }),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useArsipDetail(id: string | null | undefined) {
  const fn = useServerFn(getArsip);
  return useQuery<Arsip>({
    queryKey: qk.arsip.detail(id ?? "none"),
    queryFn: () => fn({ data: { id: id! } }),
    enabled: !!id,
  });
}

export function useArsipFacets() {
  const fn = useServerFn(getArsipFacets);
  return useQuery<ArsipFacets>({
    queryKey: qk.arsip.facets,
    queryFn: () => fn(),
    staleTime: 60_000,
  });
}

export function useUpdateArsip() {
  const fn = useServerFn(updateArsip);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateArsipInput) => fn({ data: input }),
    onSuccess: () => invalidateAllConsumers(qc),
  });
}

export function useDeleteArsip() {
  const fn = useServerFn(deleteArsipServer);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fn({ data: { arsipId: id } }),
    onSuccess: () => invalidateAllConsumers(qc),
  });
}
