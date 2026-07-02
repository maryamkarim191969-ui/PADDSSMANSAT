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
import type { Permission } from "@/lib/permissions";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Optional permission required to see this item. Absent = visible to all authenticated users. */
  perm?: Permission;
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
      { label: "AI Statistics", to: "/ai-statistik", icon: BarChart3, perm: "read.statistik" },
    ],
  },
  {
    title: "Sistem",
    items: [
      { label: "Manajemen User", to: "/user", icon: Users, perm: "read.user" },
      { label: "Backup & Restore", to: "/backup", icon: DatabaseBackup, perm: "read.backup" },
      { label: "Pengaturan", to: "/pengaturan", icon: Settings, perm: "system.backup" },
      { label: "Pusat Informasi", to: "/info", icon: Info },
    ],
  },
];