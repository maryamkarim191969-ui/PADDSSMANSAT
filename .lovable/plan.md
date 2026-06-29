# PADDS SMANSAT — Major Feature Upgrade Plan

Pekerjaan ini mencakup enam peningkatan besar. Implementasi dilakukan berurutan agar perubahan yang saling bergantung (mis. rebranding & dokumentasi) konsisten. Tidak ada modul stabil yang diubah di luar kebutuhan upgrade.

## Investigasi Singkat (sudah dilakukan)

- Pencarian saat ini (`/cari`, `src/components/search/*`) memakai `ARSIP_DATA` mock + `runSearch` lokal — perlu dipindah ke data live (`useArsipList`) sekaligus menambah jalur AI.
- Upload (`UploadWorkspace`) sudah menerima image (`image/*`) dan `analyzeDocument` sudah multimodal — yang kurang: hint "ambil dari kamera", normalisasi gambar besar, dan kepastian flow image → metadata → R2 tanpa konversi PDF manual.
- Public link (`/p/arsip/$id`) sudah preview via signed URL — tinggal tambah tombol download yang memakai signed URL `attachment` mode.
- `analyzeDocument` mengembalikan `keywords` + `ringkasan` → cukup untuk hashing fingerprint duplikat tanpa pgvector berat.
- Branding "SIPASTERA" tersebar di metadata route, sidebar, settings default, email templates, dan README app.

## Upgrade 1 — AI Document Search

- Tambah server function `aiSearchArsip` (`src/lib/ai-search.functions.ts`) yang:
  1. Mengambil seluruh arsip user-visible via Supabase (judul, nomor, perihal, ringkasan, keywords, instansi, kategori, lokasi, tahun, jenis).
  2. Mengirim query + corpus ringkas (top N berdasarkan keyword overlap awal) ke Lovable AI Gateway (`google/gemini-3-flash-preview`, JSON output) untuk diranking + diberi alasan relevansi.
  3. Mengembalikan `Array<{ arsipId, score, reason, matchedFields[] }>`.
- UI: di `/cari` tambah toggle "Cari dengan AI" (komponen `AIQuickSearch` yang sudah ada dipakai sebagai pemicu). Saat AI mode:
  - Tampilkan komponen progress bertahap (`AISearchProgress`): Memahami pertanyaan → Mengambil arsip → Menganalisis relevansi → Menyusun hasil.
  - Render hasil dengan kartu yang menampilkan judul, metadata, badge skor, dan kalimat "Alasan relevansi".
  - Empty state khusus "Tidak ditemukan dokumen yang sesuai".
- Pencarian konvensional + filter tetap. AI murni tambahan, pakai data live (bukan `ARSIP_DATA`).

## Upgrade 2 — Public Link Download

- Tambah server function `getPublicArsipDownloadUrl` (di `public-arsip.functions.ts`) → signed URL dengan `ResponseContentDisposition: attachment; filename="…"`.
- `src/routes/p.arsip.$id.tsx`: tombol "Unduh Dokumen" di sebelah tombol Preview, memakai URL tersebut.
- Workflow preview tidak diubah.

## Upgrade 3 — Platform Information Center

- Buat route `src/routes/info.tsx` (public, di luar `_authenticated`) dengan section ber-anchor: Profil, Platform, FAQ, ToS, Privacy, Panduan, Versi, Changelog, Kontak.
- Tambah link "Pusat Informasi" di sidebar bawah dan footer auth page.
- Konten statis dari konstanta `src/lib/info-content.ts` agar mudah dirawat.

## Upgrade 4 — AI Photo Document Processing

- DropZone sudah menerima `image/*`. Tambah:
  - Capture hint `capture="environment"` di input file untuk mobile (langsung dari kamera).
  - Pre-processing client: resize foto > 2500px sisi terpanjang via canvas sebelum base64 → menghemat token & memperbaiki OCR.
  - Pastikan `analyzeDocument` jalur image (sudah ada `image_url`) menghasilkan metadata setara PDF; lengkapi prompt agar memprioritaskan OCR untuk gambar.
  - Status badge "Foto terdeteksi — diproses sebagai dokumen" di item antrian.
- Workflow Upload Arsip tidak berubah dari sisi pengguna.

## Upgrade 5 — AI Duplicate Detection

- Tambah kolom `content_hash` (`text`) dan `content_signature` (`text[]` of keywords) ke `arsip` via migrasi.
- Saat upload (server function `uploadAndCreateArsip`): hitung fingerprint dari `(judul normalized + nomor surat + sorted keywords + ringkasan hash)`. Cek duplikat:
  - Exact: `content_hash` cocok → flag `duplicate_exact`.
  - Mirip: keyword overlap ≥ 70% via Postgres array overlap → flag `duplicate_similar`.
- Sebelum simpan final, `ArsipFormSheet` panggil server function `checkDuplicate` saat status `siap_upload`; jika ada match tampilkan dialog peringatan "Dokumen serupa ditemukan" dengan daftar arsip + tombol "Tetap Simpan" / "Batalkan".

## Upgrade 6 — Rebranding SIPASTERA → PADDS SMANSAT

- Ganti seluruh string "SIPASTERA" → "PADDS SMANSAT" pada: route `head().meta` titles, `Sidebar` brand, `WelcomeBanner`, default `system_settings.app.name/description`, README, `index.html` title, auth page tagline.
- Tagline: "Pusat Arsip dan Dokumen Digital Sekolah — SMAN 1 Suwawa Timur".
- Tidak menyentuh nama file, identifier kode, tabel DB, atau key konfigurasi internal.

## Validasi & Regression

- Build + typecheck.
- Browser smoke test (Playwright via shell):
  1. Login → dashboard render.
  2. `/cari`: filter konvensional jalan; toggle AI menampilkan progress + hasil.
  3. `/upload`: upload foto JPG → metadata otomatis terisi; upload duplikat → peringatan muncul.
  4. `/p/arsip/<id>`: preview + tombol download bekerja.
  5. `/info`: semua section render.
  6. Brand "PADDS SMANSAT" tampil di sidebar, tab title, dan welcome banner.

## Catatan Teknis

- Tidak menambah pgvector / embeddings di tahap ini — pendekatan LLM-rerank cukup untuk skala arsip sekolah dan menghindari migrasi berat. Bisa di-upgrade nanti tanpa mengubah API `aiSearchArsip`.
- Tidak mengubah Design System, layout, atau ikon yang sudah dipakai.
- Tidak ada emoji di UI baru.
