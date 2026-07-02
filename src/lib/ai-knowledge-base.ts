/**
 * PADDS SMANSAT AI Assistant — Knowledge Base
 *
 * Sumber pengetahuan resmi untuk Digital Customer Assistant PADDS SMANSAT.
 * Struktur ini dibuat agar mudah diperluas pada sprint berikutnya
 * (penambahan FAQ, panduan modul, istilah baru, dsb.) tanpa perlu
 * mengubah arsitektur AI Assistant maupun endpoint chat.
 *
 * Aturan editorial:
 * - Bahasa Indonesia profesional, ringkas, dan informatif.
 * - Tidak menggunakan emoji.
 * - Tidak menggunakan pemisah seperti "---", "===", atau markdown
 *   yang berlebihan. Jawaban AI harus terasa natural seperti
 *   Customer Service profesional pada aplikasi enterprise.
 * - Tidak memuat data pribadi, kredensial, atau data sensitif.
 */

export type KBEntry = {
  topic: string;
  summary: string;
  details?: string[];
};

export type KBModule = {
  key: string;
  name: string;
  purpose: string;
  /** Lokasi menu pada platform, contoh: "Sidebar → Arsip → Upload". */
  location: string;
  howToUse: string[];
  tips?: string[];
};

export type KBFaq = {
  question: string;
  answer: string;
};

export type KBTerm = {
  term: string;
  definition: string;
};

/* ------------------------------------------------------------------ */
/* Identitas Platform                                                  */
/* ------------------------------------------------------------------ */

export const PLATFORM_PROFILE = {
  name: "PADDS SMANSAT",
  longName: "Pusat Arsip dan Dokumen Digital Sekolah SMAN 1 Suwawa Timur",
  tagline:
    "Platform pengelolaan arsip digital yang membantu sekolah dan instansi mengelola dokumen secara modern, terstruktur, aman, dan efisien.",
  purpose:
    "Menghadirkan proses pengarsipan yang lebih cepat, lebih rapi, dan lebih mudah ditelusuri dibanding pengelolaan arsip secara manual.",
  problemsSolved: [
    "Dokumen sekolah dan instansi yang tersebar, sulit ditelusuri, dan rawan hilang.",
    "Proses pengarsipan manual yang memakan waktu dan rentan kesalahan input.",
    "Kesulitan mengetahui masa retensi dokumen sehingga arsip menumpuk tanpa pengelolaan.",
    "Tidak adanya jejak aktivitas yang jelas terhadap perubahan data arsip.",
  ],
  benefitsSchool: [
    "Memudahkan tata usaha mengelola surat masuk, surat keluar, dokumen siswa, dan dokumen kepegawaian.",
    "Mempercepat pencarian arsip lama melalui kategori, lokasi fisik, dan kata kunci.",
    "Memberikan keamanan data melalui hak akses, log aktivitas, dan backup berkala.",
  ],
  benefitsInstitution: [
    "Mendukung digitalisasi administrasi pada instansi dengan volume dokumen yang besar.",
    "Membantu memenuhi kebutuhan tata kelola arsip yang lebih tertib dan dapat diaudit.",
    "Mengurangi ketergantungan terhadap arsip kertas yang sulit dipantau.",
  ],
  advantages: [
    "Antarmuka modern dan mudah dipahami pengguna baru.",
    "Dukungan AI Document Intelligence untuk mempercepat input metadata.",
    "Manajemen retensi, lokasi fisik, dan QR Code yang terintegrasi.",
    "Backup, log aktivitas, dan manajemen pengguna dalam satu platform.",
  ],
  developer:
    "PADDS SMANSAT dikembangkan sebagai solusi digital untuk membantu proses pengelolaan arsip sekolah maupun instansi menjadi lebih modern, terstruktur, efisien, dan mudah digunakan. Platform ini dibangun oleh tim pengembang PADDS SMANSAT sebagai bagian dari inovasi digitalisasi administrasi.",
  roadmap: [
    "Penguatan AI Document Intelligence pada modul Upload Arsip.",
    "Pencarian berbasis makna (semantic search) lintas dokumen.",
    "Rekomendasi dokumen terkait dan ringkasan otomatis.",
    "Knowledge base internal yang dapat dipelajari sistem.",
    "AI Insight dan AI Monitoring untuk pemantauan pengelolaan arsip.",
  ],
};

/* ------------------------------------------------------------------ */
/* Modul Platform                                                      */
/* ------------------------------------------------------------------ */

export const KB_MODULES: KBModule[] = [
  {
    key: "dashboard",
    name: "Dashboard",
    purpose:
      "Memberikan ringkasan kondisi arsip, aktivitas terbaru, dan indikator penting platform dalam satu tampilan.",
    location: "Sidebar → Dashboard",
    howToUse: [
      "Buka menu Dashboard pada sidebar.",
      "Periksa kartu ringkasan untuk melihat total arsip, kategori, lokasi, dan indikator lain.",
      "Gunakan informasi pada Dashboard sebagai titik awal sebelum masuk ke modul yang lebih spesifik.",
    ],
  },
  {
    key: "arsip",
    name: "Manajemen Arsip",
    purpose:
      "Menampilkan, menelusuri, dan mengelola seluruh arsip yang terdaftar di platform.",
    location: "Sidebar → Arsip",
    howToUse: [
      "Buka menu Arsip untuk melihat daftar seluruh arsip.",
      "Gunakan filter kategori, tahun, atau lokasi fisik untuk mempersempit hasil.",
      "Pilih sebuah arsip untuk melihat detail, metadata, dan dokumen yang terlampir.",
    ],
    tips: [
      "Pastikan setiap arsip memiliki kategori dan lokasi fisik yang benar agar mudah ditemukan kembali.",
    ],
  },
  {
    key: "upload",
    name: "Upload Arsip",
    purpose:
      "Mengunggah dokumen baru ke dalam platform. Modul ini ditenagai oleh AI Document Intelligence yang membantu membaca isi dokumen dan mengisi metadata secara otomatis.",
    location: "Sidebar → Upload Arsip",
    howToUse: [
      "Buka menu Upload Arsip.",
      "Unggah berkas dokumen yang akan diarsipkan.",
      "Tunggu AI Document Intelligence membaca isi dokumen dan menyarankan metadata seperti judul, kategori, dan tahun.",
      "Periksa hasil yang disarankan, lakukan penyesuaian bila diperlukan, kemudian simpan.",
    ],
    tips: [
      "Hasil ekstraksi AI lebih akurat bila dokumen yang diunggah memiliki kualitas pemindaian yang baik.",
      "Pengguna tetap dapat mengisi atau mengubah metadata secara manual sebelum menyimpan.",
    ],
  },
  {
    key: "import",
    name: "Import Arsip",
    purpose:
      "Memasukkan banyak data arsip sekaligus, misalnya dari berkas terstruktur yang telah disiapkan sebelumnya.",
    location: "Sidebar → Import Arsip",
    howToUse: [
      "Buka menu Import Arsip.",
      "Siapkan berkas data sesuai format yang diminta pada halaman.",
      "Unggah berkas dan periksa hasil pratinjau sebelum mengonfirmasi import.",
    ],
  },
  {
    key: "cari",
    name: "Pencarian Arsip",
    purpose:
      "Mencari arsip secara cepat berdasarkan kata kunci, kategori, tahun, lokasi, atau metadata lain.",
    location: "Sidebar → Cari Arsip",
    howToUse: [
      "Buka menu Cari Arsip.",
      "Masukkan kata kunci pada kolom pencarian.",
      "Gunakan filter tambahan agar hasil pencarian lebih relevan.",
    ],
  },
  {
    key: "kategori",
    name: "Kategori Arsip",
    purpose:
      "Mengelompokkan arsip ke dalam kategori yang sesuai dengan kebutuhan sekolah atau instansi.",
    location: "Sidebar → Kategori",
    howToUse: [
      "Buka menu Kategori untuk melihat daftar kategori yang tersedia.",
      "Tambahkan kategori baru bila diperlukan.",
      "Ubah atau hapus kategori yang sudah tidak digunakan melalui aksi pada baris kategori.",
    ],
    tips: [
      "Pengelompokan kategori yang konsisten akan sangat membantu proses pencarian arsip.",
    ],
  },
  {
    key: "lokasi",
    name: "Lokasi Fisik",
    purpose:
      "Mencatat lokasi fisik arsip seperti ruangan, lemari, atau rak, sehingga arsip non-digital tetap mudah ditemukan.",
    location: "Sidebar → Lokasi Fisik",
    howToUse: [
      "Buka menu Lokasi Fisik.",
      "Tambahkan lokasi baru dengan keterangan yang jelas, misalnya ruangan dan nomor lemari.",
      "Hubungkan lokasi fisik tersebut pada metadata arsip yang sesuai.",
    ],
  },
  {
    key: "statistik",
    name: "Statistik",
    purpose:
      "Menampilkan visualisasi data arsip seperti jumlah arsip per kategori, tren penambahan arsip, dan indikator pengelolaan lainnya.",
    location: "Sidebar → Statistik",
    howToUse: [
      "Buka menu Statistik.",
      "Pilih periode atau filter yang tersedia untuk menyesuaikan visualisasi.",
      "Gunakan informasi pada Statistik sebagai bahan evaluasi pengelolaan arsip.",
    ],
  },
  {
    key: "retensi",
    name: "Retensi",
    purpose:
      "Mengelola masa berlaku arsip, sehingga arsip aktif, inaktif, atau yang siap dimusnahkan dapat dipantau dengan jelas.",
    location: "Sidebar → Retensi",
    howToUse: [
      "Buka menu Retensi untuk melihat daftar arsip beserta status retensinya.",
      "Periksa arsip yang akan memasuki masa retensi dalam waktu dekat.",
      "Tindak lanjuti arsip sesuai kebijakan pengelolaan yang berlaku.",
    ],
  },
  {
    key: "qrcode",
    name: "QR Code",
    purpose:
      "Membuat QR Code untuk arsip sehingga pengguna dapat mengakses informasi arsip dengan cepat melalui pemindaian.",
    location: "Sidebar → QR Code",
    howToUse: [
      "Buka menu QR Code.",
      "Pilih arsip yang ingin dibuatkan QR Code.",
      "Cetak atau unduh QR Code untuk ditempelkan pada arsip fisik.",
    ],
  },
  {
    key: "backup",
    name: "Backup",
    purpose:
      "Membuat salinan data arsip dan metadata sebagai langkah pengamanan. Backup juga digunakan untuk proses restore bila diperlukan.",
    location: "Sidebar → Backup",
    howToUse: [
      "Buka menu Backup.",
      "Jalankan proses backup sesuai opsi yang tersedia pada halaman.",
      "Untuk restore, gunakan opsi yang tersedia dan ikuti instruksi pada platform.",
    ],
    tips: [
      "Lakukan backup secara berkala agar data tetap aman.",
    ],
  },
  {
    key: "log",
    name: "Log Aktivitas",
    purpose:
      "Mencatat seluruh aktivitas penting yang terjadi pada platform sebagai jejak audit.",
    location: "Sidebar → Log Aktivitas",
    howToUse: [
      "Buka menu Log Aktivitas.",
      "Gunakan filter untuk melihat aktivitas berdasarkan waktu atau jenis aktivitas.",
    ],
  },
  {
    key: "pengaturan",
    name: "Pengaturan",
    purpose:
      "Mengatur preferensi platform sesuai kebutuhan sekolah atau instansi.",
    location: "Sidebar → Pengaturan",
    howToUse: [
      "Buka menu Pengaturan.",
      "Sesuaikan opsi yang tersedia sesuai kebutuhan.",
      "Simpan perubahan setelah selesai.",
    ],
  },
  {
    key: "user",
    name: "Manajemen User",
    purpose:
      "Mengelola pengguna platform, termasuk penambahan pengguna baru dan pengaturan peran masing-masing pengguna.",
    location: "Sidebar → Manajemen User",
    howToUse: [
      "Buka menu Manajemen User.",
      "Tambahkan pengguna baru atau ubah informasi pengguna yang sudah ada.",
      "Atur peran pengguna sesuai kewenangan yang diberikan.",
    ],
  },
  {
    key: "ai-assistant",
    name: "AI Assistant",
    purpose:
      "Pusat bantuan resmi PADDS SMANSAT. AI Assistant membantu pengguna memahami fungsi modul, cara penggunaan fitur, alur kerja platform, serta menjawab pertanyaan seputar PADDS SMANSAT.",
    location: "Sidebar → AI Assistant",
    howToUse: [
      "Buka menu AI Assistant.",
      "Tuliskan pertanyaan seputar penggunaan platform atau pilih salah satu panduan cepat yang tersedia.",
      "Gunakan jawaban AI Assistant sebagai panduan, kemudian lanjutkan tindakan pada menu yang sesuai di platform.",
    ],
    tips: [
      "AI Assistant tidak menjalankan tindakan operasional seperti CRUD arsip, upload, backup, atau pengambilan data dari database. Tindakan tersebut dilakukan melalui menu masing-masing pada platform.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* AI Document Intelligence (modul Upload Arsip)                       */
/* ------------------------------------------------------------------ */

export const AI_DOCUMENT_INTELLIGENCE = {
  summary:
    "AI Document Intelligence adalah kecerdasan operasional PADDS SMANSAT yang berada di dalam modul Upload Arsip. Tugasnya membantu operator mempercepat proses pengarsipan dengan membaca isi dokumen dan mengisi metadata secara otomatis.",
  capabilities: [
    "Membaca isi dokumen yang diunggah.",
    "Melakukan OCR untuk dokumen hasil pemindaian bila diperlukan.",
    "Memahami isi dokumen secara umum.",
    "Mengekstrak metadata penting seperti judul, kategori, dan tahun.",
    "Mengisi form Upload Arsip secara otomatis berdasarkan hasil pembacaan dokumen.",
  ],
  notes: [
    "Operator tetap memiliki kendali penuh untuk memeriksa dan menyesuaikan hasil sebelum menyimpan.",
    "AI Document Intelligence berbeda dengan AI Assistant. AI Document Intelligence menangani pekerjaan operasional pada modul Upload Arsip, sedangkan AI Assistant menangani edukasi dan bantuan penggunaan platform.",
  ],
};

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export const KB_FAQ: KBFaq[] = [
  {
    question: "Apa itu PADDS SMANSAT?",
    answer:
      "PADDS SMANSAT adalah platform pengelolaan arsip digital yang membantu sekolah maupun instansi mengelola dokumen secara modern, terstruktur, aman, dan efisien.",
  },
  {
    question: "Apa peran AI Assistant pada PADDS SMANSAT?",
    answer:
      "AI Assistant berperan sebagai Digital Customer Assistant. AI Assistant membantu seluruh pengguna memahami fungsi modul, cara penggunaan fitur, dan alur kerja platform. AI Assistant tidak menjalankan tindakan operasional terhadap data arsip.",
  },
  {
    question: "Apa perbedaan AI Assistant dan AI Document Intelligence?",
    answer:
      "AI Document Intelligence berada di modul Upload Arsip dan bertugas membaca dokumen serta membantu pengisian metadata secara otomatis. AI Assistant berperan sebagai pusat bantuan resmi platform yang menjelaskan cara penggunaan PADDS SMANSAT.",
  },
  {
    question: "Bagaimana cara mengunggah arsip baru?",
    answer:
      "Buka menu Upload Arsip pada sidebar, unggah berkas dokumen, periksa metadata yang disarankan oleh AI Document Intelligence, lakukan penyesuaian bila diperlukan, kemudian simpan.",
  },
  {
    question: "Bagaimana cara mencari arsip lama?",
    answer:
      "Buka menu Cari Arsip, masukkan kata kunci yang relevan, lalu gunakan filter tambahan seperti kategori, tahun, atau lokasi fisik untuk mempersempit hasil pencarian.",
  },
  {
    question: "Apakah arsip yang sudah masuk dapat diatur masa berlakunya?",
    answer:
      "Ya. Modul Retensi membantu pengguna memantau arsip yang aktif, mendekati masa retensi, atau yang sudah siap untuk ditindaklanjuti sesuai kebijakan pengelolaan.",
  },
  {
    question: "Apakah data PADDS SMANSAT dapat dicadangkan?",
    answer:
      "Ya. Modul Backup digunakan untuk membuat salinan data arsip dan metadata sebagai langkah pengamanan. Backup juga digunakan untuk proses restore bila diperlukan.",
  },
  {
    question: "Apakah AI Assistant dapat menghapus, mengubah, atau mengunggah arsip?",
    answer:
      "Tidak. Tindakan operasional seperti menambah, mengubah, menghapus, mengunggah, melakukan backup, atau menampilkan data arsip dilakukan langsung pada menu yang sesuai di platform. AI Assistant berfokus memberikan penjelasan dan panduan penggunaan.",
  },
];

/* ------------------------------------------------------------------ */
/* Istilah Kearsipan                                                   */
/* ------------------------------------------------------------------ */

export const KB_TERMS: KBTerm[] = [
  {
    term: "Arsip Aktif",
    definition:
      "Arsip yang masih sering digunakan dalam kegiatan administrasi sehari-hari.",
  },
  {
    term: "Arsip Inaktif",
    definition:
      "Arsip yang frekuensi penggunaannya sudah menurun, namun masih perlu disimpan untuk keperluan tertentu.",
  },
  {
    term: "Retensi Arsip",
    definition:
      "Jangka waktu penyimpanan arsip yang ditetapkan sebelum arsip tersebut ditindaklanjuti sesuai kebijakan, misalnya dipindahkan atau dimusnahkan.",
  },
  {
    term: "Metadata",
    definition:
      "Informasi pendukung yang menjelaskan isi arsip, seperti judul, kategori, tahun, nomor, dan lokasi fisik.",
  },
  {
    term: "Lokasi Fisik",
    definition:
      "Penanda tempat penyimpanan arsip non-digital, misalnya ruangan, lemari, atau rak tertentu.",
  },
  {
    term: "Audit Trail",
    definition:
      "Jejak aktivitas pada platform yang digunakan untuk memantau perubahan data dan tindakan pengguna.",
  },
];

/* ------------------------------------------------------------------ */
/* Permintaan Operasional yang Tidak Dilayani melalui AI Assistant      */
/* ------------------------------------------------------------------ */

export const OPERATIONAL_REDIRECTS: { keyword: string; module: string; location: string }[] = [
  { keyword: "upload", module: "Upload Arsip", location: "Sidebar → Upload Arsip" },
  { keyword: "import", module: "Import Arsip", location: "Sidebar → Import Arsip" },
  { keyword: "hapus", module: "Manajemen Arsip", location: "Sidebar → Arsip" },
  { keyword: "ubah", module: "Manajemen Arsip", location: "Sidebar → Arsip" },
  { keyword: "edit", module: "Manajemen Arsip", location: "Sidebar → Arsip" },
  { keyword: "tambah arsip", module: "Upload Arsip", location: "Sidebar → Upload Arsip" },
  { keyword: "cari arsip", module: "Pencarian Arsip", location: "Sidebar → Cari Arsip" },
  { keyword: "backup", module: "Backup", location: "Sidebar → Backup" },
  { keyword: "restore", module: "Backup", location: "Sidebar → Backup" },
  { keyword: "qr", module: "QR Code", location: "Sidebar → QR Code" },
  { keyword: "kategori", module: "Kategori", location: "Sidebar → Kategori" },
  { keyword: "lokasi", module: "Lokasi Fisik", location: "Sidebar → Lokasi Fisik" },
  { keyword: "user", module: "Manajemen User", location: "Sidebar → Manajemen User" },
  { keyword: "statistik", module: "Statistik", location: "Sidebar → Statistik" },
  { keyword: "log", module: "Log Aktivitas", location: "Sidebar → Log Aktivitas" },
  { keyword: "retensi", module: "Retensi", location: "Sidebar → Retensi" },
];

/* ------------------------------------------------------------------ */
/* Penyusun Knowledge Block untuk Prompt                               */
/* ------------------------------------------------------------------ */

function bullets(items: string[]): string {
  return items.map((s) => `- ${s}`).join("\n");
}

export type RuntimePlatformSnapshot = {
  /** Live navigation tree pulled from the running app. */
  navigation?: Array<{ title: string; items: Array<{ label: string; to: string }> }>;
  /** Live application identity from system_settings.app. */
  appIdentity?: { name?: string; description?: string };
  /** Live aggregate counters (no PII, just structural facts). */
  aggregates?: {
    totalArsip?: number;
    totalKategori?: number;
    totalLokasi?: number;
    totalPengguna?: number;
  };
  /** Build/version identifier of the deployed platform. */
  version?: string;
  /** ISO timestamp the snapshot was taken on the server. */
  snapshotAt?: string;
  /** Waktu server saat request diterima — untuk sapaan & referensi waktu. */
  serverTime?: {
    iso: string;
    tz: string; // e.g. "WITA"
    display: string; // e.g. "Kamis, 2 Juli 2026 pukul 14.30 WITA"
    hour24: number; // 0..23 dalam zona tz
  };
};

export function buildKnowledgeBlock(runtime?: RuntimePlatformSnapshot): string {
  const modulesText = KB_MODULES.map((m) => {
    const tips = m.tips?.length ? `\n  Tips:\n${m.tips.map((t) => `    - ${t}`).join("\n")}` : "";
    return [
      `Modul ${m.name}`,
      `  Fungsi: ${m.purpose}`,
      `  Lokasi: ${m.location}`,
      `  Cara menggunakan:`,
      ...m.howToUse.map((s) => `    - ${s}`),
      tips,
    ]
      .filter(Boolean)
      .join("\n");
  }).join("\n\n");

  const faqText = KB_FAQ.map(
    (f) => `Pertanyaan: ${f.question}\nJawaban: ${f.answer}`,
  ).join("\n\n");

  const termsText = KB_TERMS.map((t) => `${t.term}: ${t.definition}`).join("\n");

  const lines: string[] = [
    "Pengetahuan Platform PADDS SMANSAT",
    "",
    `Nama Platform: ${PLATFORM_PROFILE.name} (${PLATFORM_PROFILE.longName})`,
    `Deskripsi: ${PLATFORM_PROFILE.tagline}`,
    `Tujuan: ${PLATFORM_PROFILE.purpose}`,
    "",
    "Masalah yang diselesaikan:",
    bullets(PLATFORM_PROFILE.problemsSolved),
    "",
    "Manfaat bagi sekolah:",
    bullets(PLATFORM_PROFILE.benefitsSchool),
    "",
    "Manfaat bagi instansi:",
    bullets(PLATFORM_PROFILE.benefitsInstitution),
    "",
    "Keunggulan platform:",
    bullets(PLATFORM_PROFILE.advantages),
    "",
    "Informasi pengembang platform:",
    PLATFORM_PROFILE.developer,
    "",
    "Roadmap pengembangan secara umum:",
    bullets(PLATFORM_PROFILE.roadmap),
    "",
    "AI Document Intelligence (modul Upload Arsip):",
    AI_DOCUMENT_INTELLIGENCE.summary,
    "Kemampuan:",
    bullets(AI_DOCUMENT_INTELLIGENCE.capabilities),
    "Catatan:",
    bullets(AI_DOCUMENT_INTELLIGENCE.notes),
    "",
    "AI Archive Integrity Analysis (modul Upload Arsip):",
    "Setelah analisis metadata selesai, platform secara otomatis menjalankan AI Archive Integrity Analysis untuk membandingkan dokumen yang sedang diunggah dengan arsip yang telah tersimpan. Hasilnya memberikan tiga kemungkinan: tidak ditemukan indikasi duplikasi, terdapat dokumen yang perlu ditinjau, atau kemungkinan tinggi merupakan duplikat. Administrator tetap memegang keputusan akhir sebelum dokumen disimpan.",
    "",
    "Modul Platform:",
    modulesText,
    "",
    "FAQ:",
    faqText,
    "",
    "Istilah Kearsipan:",
    termsText,
  ];

  if (runtime) {
    const rt: string[] = ["", "Kondisi Platform Saat Ini (Sinkronisasi Otomatis):"];
    if (runtime.serverTime) {
      const st = runtime.serverTime;
      const salam =
        st.hour24 < 11
          ? "Selamat pagi"
          : st.hour24 < 15
            ? "Selamat siang"
            : st.hour24 < 18
              ? "Selamat sore"
              : "Selamat malam";
      rt.push(
        `Waktu server saat ini: ${st.display} (${st.iso}).`,
        `Gunakan waktu server tersebut untuk sapaan (mis. "${salam}"), referensi tanggal, dan jawaban yang berkaitan dengan waktu. Jangan menyebut waktu atau tanggal yang bertentangan dengan waktu server di atas.`,
      );
    }
    if (runtime.appIdentity?.name) rt.push(`Nama Aplikasi: ${runtime.appIdentity.name}`);
    if (runtime.appIdentity?.description)
      rt.push(`Deskripsi Resmi: ${runtime.appIdentity.description}`);
    if (runtime.version) rt.push(`Versi Platform: ${runtime.version}`);
    if (runtime.snapshotAt) rt.push(`Data diperbarui pada: ${runtime.snapshotAt}`);
    if (runtime.aggregates) {
      const a = runtime.aggregates;
      const parts: string[] = [];
      if (typeof a.totalArsip === "number") parts.push(`Total arsip: ${a.totalArsip}`);
      if (typeof a.totalKategori === "number")
        parts.push(`Total kategori: ${a.totalKategori}`);
      if (typeof a.totalLokasi === "number")
        parts.push(`Total lokasi fisik: ${a.totalLokasi}`);
      if (typeof a.totalPengguna === "number")
        parts.push(`Total pengguna: ${a.totalPengguna}`);
      if (parts.length) rt.push(`Ringkasan basis data: ${parts.join(", ")}.`);
    }
    if (runtime.navigation?.length) {
      rt.push("Struktur navigasi terkini:");
      for (const sec of runtime.navigation) {
        rt.push(`- ${sec.title}`);
        for (const it of sec.items) rt.push(`    - ${it.label} (${it.to})`);
      }
      rt.push(
        "Gunakan struktur navigasi di atas sebagai sumber kebenaran ketika menjelaskan lokasi menu kepada pengguna. Bila terdapat perbedaan dengan deskripsi modul di bagian sebelumnya, ikuti struktur navigasi terkini.",
      );
    }
    lines.push(...rt);
  }

  return lines.join("\n");
}
