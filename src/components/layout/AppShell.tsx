import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { navigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Ringkasan sistem arsip digital" },
  "/arsip": { title: "Manajemen Arsip", subtitle: "Kelola seluruh dokumen arsip" },
  "/upload": { title: "Upload Arsip", subtitle: "Tambah dokumen baru ke sistem" },
  "/import": { title: "Import Arsip", subtitle: "Import dokumen secara massal" },
  "/cari": { title: "Cari Arsip", subtitle: "Pencarian dokumen lanjutan" },
  "/kategori": { title: "Kategori Arsip", subtitle: "Kelola kategori dokumen" },
  "/lokasi-fisik": { title: "Lokasi Fisik", subtitle: "Manajemen lokasi penyimpanan" },
  "/statistik": { title: "Statistik & Laporan", subtitle: "Analitik dan laporan arsip" },
  "/retensi": { title: "Retensi Dokumen", subtitle: "Pantau masa simpan dokumen" },
  "/log-aktivitas": { title: "Log Aktivitas", subtitle: "Riwayat aktivitas sistem" },
  "/ai-assistant": { title: "AI Assistant", subtitle: "Asisten cerdas arsip" },
  "/user": { title: "Manajemen User", subtitle: "Kelola pengguna sistem" },
  "/backup": { title: "Backup & Restore", subtitle: "Cadangkan dan pulihkan data" },
  "/pengaturan": { title: "Pengaturan", subtitle: "Konfigurasi aplikasi" },
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const meta =
    PAGE_META[pathname] ??
    (() => {
      const match = navigation
        .flatMap((s) => s.items)
        .find((i) => pathname.startsWith(i.to));
      return match
        ? { title: match.label, subtitle: "" }
        : { title: "SIPASTERA", subtitle: "" };
    })();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Sidebar
        open={open}
        collapsed={collapsed}
        onClose={() => setOpen(false)}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div
        className={cn(
          "flex min-h-dvh flex-col transition-[padding] duration-300",
          collapsed ? "lg:pl-[76px]" : "lg:pl-64",
        )}
      >
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          onOpenSidebar={() => setOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-300">{children}</div>
        </main>
      </div>
    </div>
  );
}