import {
  LayoutDashboard,
  FolderOpen,
  Upload,
  Download,
  Search,
  Tag,
  MapPin,
  BarChart3,
  ShieldAlert,
  Activity,
  Sparkles,
  Users,
  DatabaseBackup,
  Settings,
  QrCode,
  Info,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const navigation: NavSection[] = [
  {
    title: "Utama",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Manajemen Arsip", to: "/arsip", icon: FolderOpen },
      { label: "Upload Arsip", to: "/upload", icon: Upload },
      { label: "Import Arsip", to: "/import", icon: Download },
      { label: "Cari Arsip", to: "/cari", icon: Search },
    ],
  },
  {
    title: "Manajemen",
    items: [
      { label: "Kategori Arsip", to: "/kategori", icon: Tag },
      { label: "Lokasi Fisik", to: "/lokasi-fisik", icon: MapPin },
      { label: "Statistik & Laporan", to: "/statistik", icon: BarChart3 },
      { label: "Retensi Dokumen", to: "/retensi", icon: ShieldAlert },
      { label: "QR Code", to: "/qr-code", icon: QrCode },
      { label: "Log Aktivitas", to: "/log-aktivitas", icon: Activity },
    ],
  },
  {
    title: "AI",
    items: [
      { label: "AI Assistant", to: "/ai-assistant", icon: Sparkles },
    ],
  },
  {
    title: "Sistem",
    items: [
      { label: "Manajemen User", to: "/user", icon: Users },
      { label: "Backup & Restore", to: "/backup", icon: DatabaseBackup },
      { label: "Pengaturan", to: "/pengaturan", icon: Settings },
      { label: "Pusat Informasi", to: "/info", icon: Info },
    ],
  },
];