import { Link } from "@tanstack/react-router";
import {
  Upload,
  FolderOpen,
  Search,
  QrCode,
  BarChart3,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  label: string;
  hint: string;
  to: string;
  icon: LucideIcon;
  primary?: boolean;
};

const items: Item[] = [
  { label: "Upload Arsip", hint: "Tambah dokumen baru", to: "/upload", icon: Upload, primary: true },
  { label: "Manajemen Arsip", hint: "Lihat & kelola dokumen", to: "/arsip", icon: FolderOpen },
  { label: "Cari Arsip", hint: "Temukan dokumen cepat", to: "/cari", icon: Search },
  { label: "QR Code", hint: "Scan & cetak label", to: "/lokasi-fisik", icon: QrCode },
  { label: "Statistik", hint: "Laporan & analisis", to: "/statistik", icon: BarChart3 },
  { label: "Retensi", hint: "Pantau masa simpan", to: "/retensi", icon: ShieldAlert },
];

export function QuickAccess() {
  return (
    <section className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Akses Cepat
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group flex flex-col items-center justify-center gap-2 rounded-2xl border p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                item.primary
                  ? "border-primary/30 bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground",
              )}
            >
              <div
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-xl",
                  item.primary ? "bg-white/15 text-white" : "bg-accent text-accent-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{item.label}</p>
                <p
                  className={cn(
                    "mt-0.5 text-[11px]",
                    item.primary ? "text-white/80" : "text-muted-foreground",
                  )}
                >
                  {item.hint}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}