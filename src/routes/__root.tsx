import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PADDS SMANSAT — Pusat Arsip dan Dokumen Digital Sekolah" },
      {
        name: "description",
        content:
          "PADDS SMANSAT: Pusat Arsip dan Dokumen Digital Sekolah SMAN 1 Suwawa Timur berbasis QR Code.",
      },
      { name: "author", content: "PADDS SMANSAT" },
      { property: "og:title", content: "PADDS SMANSAT — Pusat Arsip dan Dokumen Digital Sekolah" },
      {
        property: "og:description",
        content: "Pusat Arsip dan Dokumen Digital Sekolah SMAN 1 Suwawa Timur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "PADDS SMANSAT — Pusat Arsip dan Dokumen Digital Sekolah" },
      { name: "description", content: "Follow Instructions executes tasks based on provided user directives." },
      { property: "og:description", content: "Follow Instructions executes tasks based on provided user directives." },
      { name: "twitter:description", content: "Follow Instructions executes tasks based on provided user directives." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ca9c29c8-69bf-40f8-91fd-f97ebcfbf8a6/id-preview-dcc95a67--58f8bb64-8b9d-46b8-a2ea-b79aba99d350.lovable.app-1782376091559.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ca9c29c8-69bf-40f8-91fd-f97ebcfbf8a6/id-preview-dcc95a67--58f8bb64-8b9d-46b8-a2ea-b79aba99d350.lovable.app-1782376091559.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Fire-once idempotent Administrator seed. The endpoint itself is
  // idempotent (checks auth.users + upserts the role), so the localStorage
  // guard is just a friendly client-side rate-limit. The seed uses the
  // standard Supabase Auth flow — no login bypass.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const KEY = "sipastera_admin_bootstrap_v1";
      if (localStorage.getItem(KEY)) return;
      void fetch("/api/admin-bootstrap")
        .then((r) => r.json().catch(() => null))
        .then((res) => {
          if (res?.ok) localStorage.setItem(KEY, String(Date.now()));
        })
        .catch(() => {
          // Network errors here are non-fatal — admin seed will retry next load.
        });
    } catch {
      /* ignore */
    }
  }, []);

  // AppShell is mounted inside the `_authenticated/` layout so it only wraps
  // protected routes — public routes like `/auth` render bare.
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
