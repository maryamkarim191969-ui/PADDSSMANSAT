import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({ meta: [{ title: "SIPASTERA | Memproses login…" }] }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Menyelesaikan proses login…");

  useEffect(() => {
    let active = true;

    async function finish() {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error) {
        setMessage(`Gagal memuat session: ${error.message}`);
        return;
      }
      if (data.session) {
        void navigate({ to: "/dashboard", replace: true });
        return;
      }
      // Wait for the SDK to finish handling the OAuth callback URL.
      setMessage("Memuat session pengguna…");
    }

    void finish();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        void navigate({ to: "/dashboard", replace: true });
      }
      if (event === "SIGNED_OUT") {
        void navigate({ to: "/auth", replace: true });
      }
    });

    // Safety: if nothing happens after 6s, send the user back to login.
    const timer = window.setTimeout(() => {
      void supabase.auth.getSession().then(({ data }) => {
        if (!data.session) {
          void navigate({ to: "/auth", replace: true });
        }
      });
    }, 6000);

    return () => {
      active = false;
      sub.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="text-center text-sm text-muted-foreground">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        {message}
      </div>
    </div>
  );
}
