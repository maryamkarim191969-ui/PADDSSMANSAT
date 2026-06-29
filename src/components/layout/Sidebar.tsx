import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, X } from "lucide-react";
import { navigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";

type SidebarProps = {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
};

export function Sidebar({ open, collapsed, onClose, onToggleCollapse }: SidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width,transform] duration-300 ease-out",
          collapsed ? "lg:w-[76px]" : "lg:w-64",
          "w-72",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-4">
          <Link to="/dashboard" className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground font-bold">
              S
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-wide text-white">PADDS SMANSAT</p>
                <p className="truncate text-[11px] text-sidebar-foreground/70">
                  Pusat Arsip & Dokumen Digital
                </p>
              </div>
            )}
          </Link>
          <button
            onClick={onToggleCollapse}
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white lg:flex"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft
              className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
            />
          </button>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navigation.map((section) => (
            <div key={section.title} className="mb-5">
              {!collapsed && (
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/50">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.to || pathname.startsWith(item.to + "/");
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={onClose}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white",
                          collapsed && "justify-center px-2",
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {!collapsed && active && (
                          <span className="ml-auto h-2 w-2 rounded-full bg-white/80" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}