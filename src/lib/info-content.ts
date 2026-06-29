/**
 * Platform Information Center — static documentation source.
 * Kept in a single module so future edits (FAQ, changelog, version)
 * happen in one place without touching the UI.
 */

export const PLATFORM_INFO = {
  name: "PADDS SMANSAT",
  longName: "Pusat Arsip dan Dokumen Digital Sekolah",
  institution: "SMAN 1 Suwawa Timur",
  version: "2.0.0",
  releasedAt: "2025",
  contact: {
    role: "Administrator Platform",
    email: "admin@smansat.sch.id",
    institution: "SMAN 1 Suwawa Timur",
  },
};

export type InfoFaq = { q: string; a: string };
export type InfoChangelog = { version: string; date: string; notes: string[] };

export const INFO_PROFILE: string[] = [
  "PADDS SMANSAT adalah Pusat Arsip dan Dokumen Digital Sekolah yang dikembangkan untuk SMAN 1 Suwawa Timur.",
  "Platform ini membantu sekolah mengelola surat masuk, surat keluar, dokumen internal, serta arsip non-digital secara modern, terstruktur, aman, dan mudah ditelusuri.",
  "PADDS SMANSAT menggabungkan pengelolaan metadata, penyimpanan dokumen berbasis cloud, pencarian konvensional, pencarian berbasis AI, serta jejak audit yang lengkap dalam satu sistem terpadu.",
];

export const INFO_PLATFORM: { title: string; body: string }[] = [
  {
    title: "Manajemen Arsip Terpusat",
    body: "Seluruh arsip tercatat dalam satu sistem dengan metadata yang konsisten dan dapat diakses berdasarkan kewenangan pengguna.",
  },
  {
    title: "AI Document Intelligence",
    body: "Membaca isi dokumen pada saat upload dan mengisi metadata secara otomatis. Operator hanya perlu meninjau dan menyimpan.",
  },
  {
    title: "AI Document Search",
    body: "Pencarian arsip berbasis bahasa alami. Pengguna dapat menemukan dokumen meskipun hanya mengingat isi pembahasan, nama instansi, atau topik dokumen.",
  },
  {
    title: "QR Code & Public Link",
    body: "Setiap arsip memiliki QR Code dan tautan publik untuk akses cepat terhadap informasi serta dokumen yang tersimpan.",
  },
  {
    title: "Backup & Restore",
    body: "Snapshot data tersimpan di Cloudflare R2 sebagai berkas JSON dan dapat dipulihkan kapan saja oleh Administrator.",
  },
  {
    title: "Log Aktivitas",
    body: "Setiap tindakan penting pada platform tercatat sebagai jejak audit yang dapat ditelusuri oleh Administrator.",
  },
];

export const INFO_FAQ: InfoFaq[] = [
  {
    q: "Apa itu PADDS SMANSAT?",
    a: "PADDS SMANSAT adalah Pusat Arsip dan Dokumen Digital Sekolah SMAN 1 Suwawa Timur yang menyatukan pengelolaan arsip digital dan fisik dalam satu platform.",
  },
  {
    q: "Bagaimana cara mengunggah arsip baru?",
    a: "Buka menu Upload Arsip, pilih atau ambil foto dokumen, tunggu hasil analisis AI Document Intelligence, lengkapi form yang tersedia, kemudian simpan.",
  },
  {
    q: "Apakah saya dapat mengunggah foto dokumen langsung dari kamera?",
    a: "Ya. Modul Upload Arsip menerima berkas gambar (PNG/JPG) baik melalui galeri maupun langsung dari kamera perangkat.",
  },
  {
    q: "Bagaimana AI Document Search bekerja?",
    a: "AI membaca seluruh arsip yang Anda miliki kewenangannya, kemudian memilih dokumen yang paling relevan dengan permintaan Anda dan menjelaskan alasan rekomendasinya.",
  },
  {
    q: "Apa yang terjadi jika sistem mendeteksi dokumen yang mirip?",
    a: "Sebelum menyimpan, platform menampilkan daftar dokumen yang berpotensi sama. Operator dapat membatalkan atau melanjutkan penyimpanan sesuai pertimbangan masing-masing.",
  },
  {
    q: "Siapa yang dapat menggunakan platform ini?",
    a: "Platform digunakan oleh Administrator, Staf TU, serta pengguna lain yang diberikan akses oleh Administrator.",
  },
];

export const INFO_TOS: string[] = [
  "Penggunaan platform ditujukan untuk kebutuhan administrasi resmi SMAN 1 Suwawa Timur.",
  "Pengguna bertanggung jawab menjaga kerahasiaan akun, password, serta dokumen yang diunggah.",
  "Penyalahgunaan platform, termasuk mengakses data tanpa kewenangan, dapat berakibat pada pencabutan akses.",
  "Administrator berhak menonaktifkan akun yang melanggar ketentuan penggunaan.",
];

export const INFO_PRIVACY: string[] = [
  "Data yang tersimpan pada platform digunakan semata-mata untuk kebutuhan pengarsipan dan administrasi sekolah.",
  "Dokumen disimpan pada infrastruktur cloud yang aman dengan akses terbatas berdasarkan peran pengguna.",
  "Setiap tindakan penting tercatat pada Log Aktivitas sebagai jejak audit.",
  "Tautan publik dokumen menggunakan URL bertanda tangan dengan masa berlaku terbatas untuk menjaga keamanan akses.",
];

export const INFO_GUIDE: { title: string; steps: string[] }[] = [
  {
    title: "Login ke Platform",
    steps: [
      "Buka halaman utama platform.",
      "Masuk menggunakan email yang telah didaftarkan oleh Administrator atau melalui Google/Microsoft.",
      "Setelah masuk, Anda akan diarahkan ke Dashboard.",
    ],
  },
  {
    title: "Upload Arsip",
    steps: [
      "Buka menu Upload Arsip pada sidebar.",
      "Pilih berkas dokumen (PDF, dokumen Office, gambar/foto).",
      "Klik Analisis Dokumen, tunggu AI mengisi metadata.",
      "Periksa hasil pada Form Arsip dan klik Simpan & Upload.",
    ],
  },
  {
    title: "Mencari Arsip",
    steps: [
      "Buka menu Cari Arsip.",
      "Gunakan pencarian konvensional untuk mencari berdasarkan nomor surat, judul, kategori, tahun, atau lokasi.",
      "Gunakan AI Document Search untuk mencari berdasarkan isi pembahasan, nama instansi, atau topik dokumen.",
    ],
  },
  {
    title: "Menggunakan QR Code",
    steps: [
      "Buka menu QR Code, pilih arsip, kemudian cetak QR Code.",
      "Tempelkan QR Code pada arsip fisik agar mudah ditelusuri.",
      "Pindai QR Code untuk membuka halaman publik arsip beserta preview dan tombol unduh dokumen.",
    ],
  },
];

export const INFO_CHANGELOG: InfoChangelog[] = [
  {
    version: "2.0.0",
    date: "2025",
    notes: [
      "Rebranding platform menjadi PADDS SMANSAT (Pusat Arsip dan Dokumen Digital Sekolah SMAN 1 Suwawa Timur).",
      "AI Document Search untuk pencarian arsip menggunakan bahasa alami.",
      "Public Link mendukung preview dan unduh dokumen pada satu halaman.",
      "Pusat Informasi Platform sebagai dokumentasi resmi pengguna.",
      "Upload Arsip mendukung file gambar/foto langsung dari kamera perangkat.",
      "AI Duplicate Detection sebelum menyimpan arsip baru.",
    ],
  },
  {
    version: "1.0.0",
    date: "2025",
    notes: [
      "Versi awal platform: manajemen arsip, kategori, lokasi fisik, QR Code, retensi, backup, log aktivitas.",
      "AI Document Intelligence untuk ekstraksi metadata otomatis pada modul Upload Arsip.",
    ],
  },
];