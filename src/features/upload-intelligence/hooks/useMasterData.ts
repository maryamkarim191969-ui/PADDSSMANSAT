import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listKategori } from "@/lib/kategori.functions";
import { listLokasi } from "@/lib/lokasi.functions";
import type { MasterOption } from "../types";

/**
 * Single Source of Truth for Kategori & Lokasi.
 *
 * Uses the same TanStack Query keys (["kategori"], ["lokasi"]) as the
 * Manajemen Kategori / Manajemen Lokasi pages, so any mutation there
 * automatically refreshes the Upload form dropdowns.
 */
export function useMasterData() {
  const fetchKategori = useServerFn(listKategori);
  const fetchLokasi = useServerFn(listLokasi);

  const kategoriQ = useQuery({
    queryKey: ["kategori"],
    queryFn: () => fetchKategori(),
  });
  const lokasiQ = useQuery({
    queryKey: ["lokasi"],
    queryFn: () => fetchLokasi(),
  });

  const kategori: MasterOption[] = useMemo(
    () =>
      (kategoriQ.data ?? [])
        .filter((r) => r.status !== "Nonaktif")
        .map((r) => ({ id: r.id, nama: r.nama })),
    [kategoriQ.data],
  );
  const lokasi: MasterOption[] = useMemo(
    () =>
      (lokasiQ.data ?? [])
        .filter((r) => r.status !== "Nonaktif")
        .map((r) => ({ id: r.id, nama: r.nama })),
    [lokasiQ.data],
  );

  return {
    kategori,
    lokasi,
    loading: kategoriQ.isLoading || lokasiQ.isLoading,
    error:
      (kategoriQ.error as Error | null)?.message ??
      (lokasiQ.error as Error | null)?.message ??
      null,
  };
}