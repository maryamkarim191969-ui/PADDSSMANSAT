import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";

/**
 * Protected layout. All routes nested under `_authenticated/` are gated here.
 *
 * ssr:false because the Supabase session lives in localStorage; the server
 * cannot read it. Doing the gate client-side prevents redirect loops on hard
 * refresh and auth-page flashes for signed-in users.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }
    return { userId: data.user.id };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout(): ReactNode {
  // Redirect to /auth automatically when the user signs out while inside the app.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        window.location.replace("/auth");
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
