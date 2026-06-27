import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser, type CurrentUser } from "@/lib/current-user.functions";
import type { Permission } from "@/lib/permissions";

const QK = ["current-user"] as const;

/**
 * Single source of truth for the signed-in user across every SIPASTERA module.
 * Backed by TanStack Query so all consumers share one cached identity.
 */
export function useCurrentUser() {
  const fetcher = useServerFn(getCurrentUser);
  const qc = useQueryClient();

  // Keep cached identity in sync with Supabase auth state changes.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        qc.setQueryData(QK, null);
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        void qc.invalidateQueries({ queryKey: QK });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [qc]);

  const query = useQuery<CurrentUser | null>({
    queryKey: QK,
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return null;
      return await fetcher();
    },
    staleTime: 60_000,
    retry: 1,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useHasPermission(permission: Permission): boolean {
  const { user } = useCurrentUser();
  return user?.permissions.includes(permission) ?? false;
}
