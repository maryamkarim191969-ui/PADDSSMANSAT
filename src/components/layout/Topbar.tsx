import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type TopbarProps = {
  title: string;
  subtitle?: string;
  onOpenSidebar: () => void;
};

export function Topbar({ title, subtitle, onOpenSidebar }: TopbarProps) {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function handleSignOut() {
    try {
      await qc.cancelQueries();
      qc.clear();
      await supabase.auth.signOut();
      toast.success("Anda telah keluar dari PADDS SMANSAT.");
      await navigate({ to: "/auth", replace: true });
    } catch (err) {
      console.error("[topbar] signOut", err);
      toast.error("Gagal keluar. Coba lagi.");
    }
  }

  const initial = (user?.name || "S").trim().charAt(0).toUpperCase();
  const displayName = user?.name || "Memuat…";
  const displayRole = user?.role || "—";

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          onClick={onOpenSidebar}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-card text-foreground hover:bg-muted lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight text-foreground sm:text-xl">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {subtitle}
            </p>
          )}
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground sm:flex sm:w-64 md:w-80">
          <Search className="h-4 w-4 shrink-0" />
          <input
            type="text"
            placeholder="Cari arsip..."
            className="w-full min-w-0 bg-transparent placeholder:text-muted-foreground/70 focus:outline-none"
          />
        </div>

        <button
          className="relative grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-3 text-left transition-colors hover:bg-muted"
              aria-label="Menu pengguna"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {initial}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block max-w-[10rem] truncate text-xs font-semibold text-foreground">
                  {displayName}
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                  {displayRole}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="truncate text-sm font-semibold">{displayName}</span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {user?.email || "—"}
              </span>
              <span className="mt-1 inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                {displayRole}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void handleSignOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
