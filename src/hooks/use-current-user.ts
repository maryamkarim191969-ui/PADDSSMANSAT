import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser, type CurrentUser } from "@/lib/current-user.functions";
import { recordEvent } from "@/lib/log-aktivitas.functions";
import type { Permission } from "@/lib/permissions";

const QK = ["current-user"] as const;

/**
 * Single source of truth for the signed-in user across every PADDS SMANSAT module.
 * Backed by TanStack Query so all consumers share one cached identity.
 */
export function useCurrentUser() {
  const fetcher = useServerFn(getCurrentUser);
  const qc = useQueryClient();

  // Keep cached identity in sync with Supabase auth state changes.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        qc.setQueryData(QK, null);
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        void qc.invalidateQueries({ queryKey: QK });
        // Audit-log every fresh login exactly once per access token.
        if (event === "SIGNED_IN" && session?.access_token) {
          const key = `sipastera:login-logged:${session.access_token.slice(0, 24)}`;
          try {
            if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem(key)) {
              sessionStorage.setItem(key, "1");
              const provider =
                session.user?.app_metadata?.provider ?? "password";
              void recordEvent({
                data: {
                  action: "auth.login",
                  detail: `Login berhasil via ${provider}`,
                  modul: "Auth",
                  status: "Berhasil",
                },
              }).catch((err) =>
                console.error("[auth] failed to record login", err),
              );
            }
          } catch {
            /* sessionStorage may be unavailable — ignore */
          }
        }
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
