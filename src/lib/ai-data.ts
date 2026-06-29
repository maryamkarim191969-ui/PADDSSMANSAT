import { ARSIP_DATA } from "./arsip-data";
import { RETENSI_DATA } from "./retensi-data";
import { initialQR, type QRItem } from "./qr-data";
import { initialUsers } from "./user-data";

export type AIRole = "user" | "ai";

export type AIMessage = {
  id: string;
  role: AIRole;
  content: string;
  timestamp: string;
};

export type AIConversation = {
  id: string;
  title: string;
  updatedAt: string;
  messages: AIMessage[];
};

/* ------------------------------------------------------------------ */
/* Saran pertanyaan singkat — tampil pada empty state chat.            */
/* AI Assistant berfokus sebagai Digital Customer Assistant.           */
/* ------------------------------------------------------------------ */

export const suggestedPrompts: string[] = [
  "Apa itu PADDS SMANSAT dan apa manfaatnya bagi sekolah?",
  "Bagaimana cara mengunggah arsip menggunakan AI Document Intelligence?",
  "Bagaimana cara mencari arsip lama pada platform?",
  "Apa fungsi modul Retensi pada PADDS SMANSAT?",
  "Bagaimana cara membuat dan menggunakan QR Code arsip?",
  "Jelaskan langkah-langkah melakukan backup data.",
];

export type SuggestedCommand = {
  group: "Panduan" | "Modul" | "Konsep" | "Bantuan";
  prompt: string;
};

export const suggestedCommands: SuggestedCommand[] = [
  { group: "Panduan", prompt: "Jelaskan alur kerja umum pengarsipan pada PADDS SMANSAT." },
  { group: "Panduan", prompt: "Bagaimana cara mengelola kategori arsip dengan rapi?" },
  { group: "Modul", prompt: "Apa fungsi modul Lokasi Fisik dan kapan harus digunakan?" },
  { group: "Modul", prompt: "Apa saja yang dapat dilihat pada Dashboard dan Statistik?" },
  { group: "Konsep", prompt: "Apa perbedaan AI Assistant dan AI Document Intelligence?" },
  { group: "Konsep", prompt: "Apa yang dimaksud dengan retensi arsip aktif dan inaktif?" },
  { group: "Bantuan", prompt: "Saya tidak menemukan arsip yang saya cari. Apa yang harus saya lakukan?" },
  { group: "Bantuan", prompt: "Bagaimana cara meminta bantuan tambahan terkait penggunaan platform?" },
];

/* ------------------------------------------------------------------ */
/* Quick Actions — pintasan topik bantuan pada AI Assistant.           */
/* ------------------------------------------------------------------ */

export type QuickActionIcon =
  | "intro"
  | "modules"
  | "upload"
  | "search"
  | "workflow"
  | "faq"
  | "terms"
  | "support";

export type QuickAction = {
  key: string;
  title: string;
  description: string;
  icon: QuickActionIcon;
  prompt: string;
};

export const quickActions: QuickAction[] = [
  {
    key: "intro",
    title: "Mengenal PADDS SMANSAT",
    description: "Penjelasan singkat tentang platform dan tujuannya.",
    icon: "intro",
    prompt: "Tolong jelaskan apa itu PADDS SMANSAT dan manfaatnya bagi sekolah serta instansi.",
  },
  {
    key: "modules",
    title: "Panduan Modul",
    description: "Penjelasan fungsi setiap menu pada platform.",
    icon: "modules",
    prompt: "Tolong jelaskan fungsi seluruh modul utama pada PADDS SMANSAT.",
  },
  {
    key: "upload",
    title: "Cara Upload Arsip",
    description: "Langkah upload arsip dengan AI Document Intelligence.",
    icon: "upload",
    prompt: "Bagaimana cara mengunggah arsip menggunakan AI Document Intelligence?",
  },
  {
    key: "search",
    title: "Cara Mencari Arsip",
    description: "Panduan pencarian arsip secara efektif.",
    icon: "search",
    prompt: "Bagaimana cara melakukan pencarian arsip yang efektif pada PADDS SMANSAT?",
  },
  {
    key: "workflow",
    title: "Alur Pengarsipan",
    description: "Alur kerja pengarsipan dari awal sampai selesai.",
    icon: "workflow",
    prompt: "Jelaskan alur kerja umum pengarsipan pada PADDS SMANSAT secara berurutan.",
  },
  {
    key: "faq",
    title: "Pertanyaan Umum",
    description: "Jawaban atas pertanyaan yang sering diajukan.",
    icon: "faq",
    prompt: "Apa saja pertanyaan umum dari pengguna baru PADDS SMANSAT dan jawabannya?",
  },
  {
    key: "terms",
    title: "Istilah Kearsipan",
    description: "Penjelasan istilah-istilah dasar pengarsipan.",
    icon: "terms",
    prompt: "Tolong jelaskan istilah-istilah dasar pengarsipan yang perlu saya ketahui.",
  },
  {
    key: "support",
    title: "Solusi Kendala",
    description: "Saran solusi untuk kendala umum saat penggunaan.",
    icon: "support",
    prompt: "Apa solusi untuk kendala umum yang sering dialami pengguna saat menggunakan PADDS SMANSAT?",
  },
];

/* ------------------------------------------------------------------ */
/* AI Capabilities — kartu informasi posisi AI Assistant.              */
/* AI Assistant berperan sebagai Digital Customer Assistant.           */
/* ------------------------------------------------------------------ */

export type AICapabilityStatus = "Siap" | "Persiapan" | "Roadmap";

export type AICapability = {
  key: string;
  title: string;
  summary: string;
  status: AICapabilityStatus;
  bullets: string[];
  icon: "doc" | "search" | "knowledge" | "action";
};

export const aiCapabilities: AICapability[] = [
  {
    key: "assistant",
    title: "Digital Customer Assistant",
    summary: "Pusat bantuan resmi platform PADDS SMANSAT.",
    status: "Siap",
    icon: "knowledge",
    bullets: [
      "Penjelasan fungsi setiap modul",
      "Panduan penggunaan fitur",
      "Alur kerja pengarsipan",
      "Pertanyaan umum dan istilah",
    ],
  },
  {
    key: "doc",
    title: "AI Document Intelligence",
    summary: "Kecerdasan operasional pada modul Upload Arsip.",
    status: "Siap",
    icon: "doc",
    bullets: [
      "Membaca isi dokumen",
      "Ekstraksi metadata otomatis",
      "Mengisi form Upload Arsip",
      "Mendukung OCR bila diperlukan",
    ],
  },
  {
    key: "search",
    title: "Document Search",
    summary: "Pencarian berbasis makna dan konteks dokumen.",
    status: "Roadmap",
    icon: "search",
    bullets: [
      "Pencarian semantik",
      "Penelusuran lintas dokumen",
      "Filter konteks lanjutan",
    ],
  },
  {
    key: "knowledge",
    title: "Smart Knowledge Base",
    summary: "Perluasan pengetahuan resmi platform PADDS SMANSAT.",
    status: "Roadmap",
    icon: "knowledge",
    bullets: [
      "Dokumentasi resmi",
      "Panduan pengguna lanjutan",
      "FAQ berkelanjutan",
      "Rekomendasi dokumen terkait",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* AI Insight metrics — ringkasan visual platform (bukan tindakan AI). */
/* Data berasal dari mock dataset, hanya untuk tampilan halaman.       */
/* ------------------------------------------------------------------ */

export type AIInsightMetric = {
  key: string;
  label: string;
  value: string;
  hint: string;
  tone: "blue" | "violet" | "emerald" | "amber" | "rose";
};

export function getAIInsightMetrics(): AIInsightMetric[] {
  const totalArsip = ARSIP_DATA.length;
  const retensiBulanIni = RETENSI_DATA.filter(
    (r) => r.sisaHari >= 0 && r.sisaHari <= 30,
  ).length;
  const qrAktif = initialQR.filter((q: QRItem) => q.status === "Aktif").length;
  const userAktif = initialUsers.filter((u) => u.status === "Aktif").length;
  const storageGb = ((totalArsip * 1.2) / 1024).toFixed(2);

  return [
    { key: "arsip", label: "Total Arsip", value: String(totalArsip), hint: "Seluruh arsip terdaftar", tone: "blue" },
    { key: "retensi", label: "Retensi 30 Hari", value: String(retensiBulanIni), hint: "Mendekati masa retensi", tone: "amber" },
    { key: "qr", label: "QR Aktif", value: String(qrAktif), hint: "QR siap dipindai", tone: "violet" },
    { key: "user", label: "User Aktif", value: String(userAktif), hint: "Akun pengguna aktif", tone: "emerald" },
    { key: "storage", label: "Storage", value: `${storageGb} GB`, hint: "Estimasi pemakaian", tone: "rose" },
  ];
}

/* ------------------------------------------------------------------ */
/* Initial conversations for AI Workspace history.                     */
/* ------------------------------------------------------------------ */

export const initialConversations: AIConversation[] = [];
