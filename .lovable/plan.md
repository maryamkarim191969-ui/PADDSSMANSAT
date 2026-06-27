# SIPASTERA — Comprehensive Architecture Audit

Catatan penting: project di sandbox ini masih starter Lovable kosong. Audit di bawah dilakukan terhadap source code di `sipastera-preview-launch-main.zip` yang Anda unggah (read-only, tidak ada perubahan apapun). Tidak ada implementasi yang dilakukan pada tahap ini.

---

## 1. Ringkasan Status per Modul

Legenda: ✅ DB + Server Fn + TanStack Query · ⚠️ sebagian (mock/local) · ❌ masih mock / local state.


| Modul                                 | Sumber Data                                            | Server Fn                                           | TanStack Query                            | Shared Hook                     | Status                           |
| ------------------------------------- | ------------------------------------------------------ | --------------------------------------------------- | ----------------------------------------- | ------------------------------- | -------------------------------- |
| Auth (login/session)                  | Supabase Auth                                          | `current-user.functions.ts`                         | `useCurrentUser` (key ad-hoc)             | ✅                               | ⚠️                               |
| Manajemen Arsip                       | `public.arsip`                                         | `arsip.functions.ts`                                | `useArsipList/Detail/Facets`              | ✅                               | ✅                                |
| Upload Arsip (R2)                     | R2 + `public.arsip`                                    | `storage.functions.ts`, `upload-arsip.functions.ts` | (mutation di hook lokal `useUploadQueue`) | ⚠️                              | ⚠️                               |
| Magic Form AI / Document Intelligence | `document-intelligence.functions.ts`                   | ✅                                                   | tidak via Query (one-shot)                | n/a                             | ✅                                |
| Cari Arsip                            | `public.arsip`                                         | reuse `listArsip`                                   | ✅                                         | ✅                               | ✅                                |
| Kategori Arsip                        | `public.kategori`                                      | `kategori.functions.ts`                             | useQuery inline di route                  | ❌ tidak ada `use-kategori`      | ⚠️                               |
| Lokasi Fisik                          | `public.lokasi`                                        | `lokasi.functions.ts`                               | useQuery inline di route                  | ❌ tidak ada `use-lokasi`        | ⚠️                               |
| Statistik                             | derived dari `arsip`                                   | `statistik.functions.ts`                            | `useStatistikOverview`                    | ✅                               | ✅                                |
| Dashboard                             | derived                                                | `dashboard.functions.ts`                            | `useDashboardOverview`                    | ✅                               | ✅                                |
| Retensi                               | derived                                                | `retensi.functions.ts`                              | `useRetensiList`                          | ✅                               | ✅                                |
| **QR Code**                           | `initialQR = []` + `useState`                          | ❌ tidak ada                                         | ❌                                         | ❌                               | ❌ mock                           |
| **Log Aktivitas**                     | `LOG_DATA = []` + `useState`                           | ❌ tidak ada (table `log_aktivitas` ada)             | ❌                                         | ❌                               | ❌ mock                           |
| **Backup**                            | `initialBackups = []` + `useState`                     | ❌                                                   | ❌                                         | ❌                               | ❌ mock                           |
| **Pengaturan**                        | `defaultSettings` + `useState` (tidak ada persistensi) | ❌                                                   | ❌                                         | ❌                               | ❌ mock                           |
| **AI Assistant (riwayat)**            | `localStorage` (`useAIConversations`)                  | hanya endpoint chat (`/api/ai-chat`)                | ❌                                         | ⚠️                              | ⚠️ tidak tersinkron antar device |
| Manajemen User                        | `profiles` + `user_roles`                              | `current-user.functions.ts::listManagedUsers`       | useQuery inline                           | ❌ tidak ada `use-managed-users` | ⚠️                               |
| Import (multi)                        | `useState` lokal                                       | menggunakan `createArsip` per item                  | ❌                                         | ❌                               | ⚠️                               |
| Storage / R2                          | `R2StorageAdapter`                                     | `storage.functions.ts`                              | n/a                                       | n/a                             | ✅                                |


---

## 2. Dependency Map (alur data nyata)

```text
Upload Arsip ──► requestUploadUrl ──► PUT R2
            └──► createArsip ──► public.arsip
                                     │
                                     ├──► Dashboard (overview)        ✅ resync
                                     ├──► Cari / Manajemen Arsip      ✅ resync
                                     ├──► Statistik                   ✅ resync
                                     ├──► Retensi                     ✅ resync
                                     ├──► QR Code                     ❌ tidak konek (local mock)
                                     ├──► Log Aktivitas               ❌ tidak ditulis (no INSERT)
                                     └──► Kategori/Lokasi (counters)  ⚠️ dihitung saat list, tapi cache facets/list tidak di-invalidate saat upload
```

Modul yang berdiri sendiri (off-bus): **QR Code, Log Aktivitas, Backup, Pengaturan, AI history**.

---

## 3. Sinkronisasi Data — yang berfungsi vs yang putus

Berfungsi (via `ARSIP_DEPENDENT_KEYS`):

- `useUpdateArsip`, `useDeleteArsip` → invalidate `arsip / dashboard / statistik / retensi / aktivitas`.

Putus / belum tersambung:

1. `createArsip` (Upload + Import) **tidak dipanggil melalui shared hook**, jadi tidak ada invalidasi. Setelah upload sukses, Dashboard / Cari / Statistik / Retensi tidak otomatis refresh tanpa reload.
2. `createKategori/updateKategori/deleteKategori` & `createLokasi/...` **tidak invalidate** `qk.arsip.facets`, padahal facets memakai nilai kategori/lokasi.
3. `deleteArsip` / `updateArsip` **tidak menambah baris** ke `public.log_aktivitas` → Dashboard `aktivitas` selalu kosong dan halaman Log Aktivitas tidak menampilkan apa pun (ditambah halaman itu sendiri masih membaca array statis `LOG_DATA`).
4. QR Code dibuat secara lokal (`setItems`) saat user menekan tombol; tidak menulis ke `public.qr_code`, tidak ada hubungan ke `public.arsip`. Statistik "QR Aktif" di Dashboard menghitung dari `public.qr_code` (yang kosong) sehingga selalu 0.
5. Pengaturan tidak pernah disimpan ke DB (`user_security_settings` ada tapi tidak dipakai).
6. AI Assistant riwayat hanya di localStorage — beda device / browser = beda riwayat, tidak ada audit trail.

---

## 4. Inkonsistensi Arsitektur

1. **Query key tidak konsisten**
  - `useCurrentUser` pakai key inline `["current-user"]`, bukan dari `qk`.
  - `user.tsx` pakai `["managed-users"]` inline.
  - `qk.kategori.list / qk.lokasi.list` didefinisikan tapi route page tidak memakainya (membuat useQuery sendiri).
2. **Dua matriks permission**: `src/lib/permissions.ts` (client) + komentar menyebut `ai-permission.server.ts`. Risiko drift.
3. **Dua sumber tipe Kategori/Lokasi**: `kategori-data.ts` mendefinisikan `Kategori`, `kategori.functions.ts` mendefinisikan `KategoriRow` yang nyaris sama.
4. **Mock + tipe dicampur** dalam file `*-data.ts` (`arsip-data.ts`, `qr-data.ts`, `user-data.ts`, `log-data.ts`, `backup-data.ts`, `settings-data.ts`). Hapus mock, sisakan tipe — atau pindahkan tipe ke modul terpisah.
5. **Auth gate** di `_authenticated/route.tsx` di-author manual (`ssr:false`, `supabase.auth.getUser()` + listener `useEffect`). `useCurrentUser` juga memasang listener. → dua listener berjalan paralel; salah satunya bisa balapan saat sign-out.
6. `getCurrentUser` **memanggil** `get_user_role` **via** `supabaseAdmin` **(service role)** padahal RPC ini security-definer dan aman dipanggil sebagai user. Tidak perlu naik ke service role; menambah luas serang.
7. **Kategori** `jumlah_arsip` **dihitung di JS** (memuat seluruh kolom `arsip.kategori`) — tidak skalabel, dan dua kali round-trip. Lebih baik view/RPC atau trigger.
8. **Upload mutation tidak melalui shared hook** → menyalin logika invalidasi/optimistic update bila nanti ditambahkan akan tersebar di banyak tempat.
9. **Log Aktivitas tidak punya jalur insert** — tidak ada server function `logActivity` / trigger DB. Setiap modul yang ingin mencatat harus reinvent.

---

## 5. Technical Debt — Prioritas

### Critical (memblokir "satu sistem yang utuh")

- C1. `createArsip` tidak terhubung ke layer invalidasi → modul konsumen tidak sinkron setelah upload.
- C2. `log_aktivitas` tidak ditulis di manapun → Dashboard activity, halaman Log Aktivitas, dan audit trail mati.
- C3. QR Code 100% mock; tabel `qr_code` ada tapi tidak terpakai. Stat "QR Aktif" tidak pernah benar.
- C4. Pengaturan tidak persist → setiap reload kembali ke default; tidak ada satu sumber kebenaran untuk pengaturan sistem.
- C5. Backup 100% mock; bila ditampilkan ke user bisa menyesatkan (mengira backup berjalan).

### High

- H1. AI Assistant riwayat hanya di localStorage — tidak tersinkron, tidak terpulihkan, tidak bisa diaudit.
- H2. `getCurrentUser` naik ke service role tanpa kebutuhan.
- H3. Dua auth listener (layout + `useCurrentUser`); race-condition saat sign-out / refresh token.
- H4. Mutation kategori/lokasi tidak invalidate `qk.arsip.facets` dan list kategori/lokasi pada Upload form.
- H5. Tidak ada shared hook untuk kategori, lokasi, managed-users, createArsip, QR — duplikasi `useQuery` di tiap route.

### Medium

- M1. Query key tidak terpusat di `qk` (current-user, managed-users, ai, qr, log, backup, settings belum di factory).
- M2. Dua matriks permission (client + server).
- M3. `*-data.ts` mencampur mock + tipe.
- M4. Duplikasi tipe (Kategori vs KategoriRow, Lokasi vs LokasiRow, AppUser vs ManagedUser).
- M5. Perhitungan `jumlahArsip` di kategori/lokasi pakai full-scan di JS.

### Low

- L1. Komentar dokumentasi yang menyebut file yang sudah berubah nama.
- L2. Dead exports di `*-data.ts`.
- L3. `mock-data.ts` masih ada tapi nilainya semua nol; aman dihapus.

---

## 6. Akar Masalah (root causes)

1. Modul yang dibuat lebih awal (QR, Log, Backup, Pengaturan, AI history) belum dimigrasikan ke arsitektur "DB + server function + TanStack Query + shared hook" yang sekarang berlaku untuk arsip/kategori/lokasi/statistik/retensi/dashboard.
2. Tidak ada **observer/event bus** terpusat untuk mencatat aktivitas → setiap mutation diharapkan "ingat" untuk ngeprint log, dan tidak ada yang melakukannya.
3. **Mutation create/delete arsip tidak melalui shared hook** seperti update; akibatnya invalidasi tidak konsisten.
4. **Query key factory** belum mencakup semua modul → developer membuat key ad-hoc.
5. **Tipe & mock disatukan** di `*-data.ts`, mendorong route memakai mock sebagai initial state alih-alih query.

---

## 7. Rekomendasi Perbaikan (tanpa mengubah UI/UX)

Semua perubahan di bawah hanya pada arsitektur, server function, database, query, storage, middleware, shared hook, sinkronisasi. Tidak menyentuh komponen visual, tata letak, navigasi, branding.

### S1. Sinkronisasi penuh sekitar `arsip`

- Tambahkan `useCreateArsip` shared hook (bungkus `createArsip` + invalidate `ARSIP_DEPENDENT_KEYS` + `qk.arsip.facets`).
- Refactor `UploadWorkspace` & `import.tsx` agar memakai hook ini (bukan call `useServerFn` langsung).
- Tambahkan `qk.arsip.facets` & `qk.kategori.list` & `qk.lokasi.list` ke `ARSIP_DEPENDENT_KEYS` ketika mutation arsip menyentuh counter.

### S2. Activity Log sebagai middleware terpusat

- Buat helper server `recordActivity(ctx, { modul, jenis, aktivitas, detail, status })`.
- Panggil di setiap server function mutasi (arsip create/update/delete, kategori/lokasi CRUD, user CRUD, login).
- Idealnya: server middleware `withActivityLog` yang otomatis membaca metadata dari handler.
- Tambah `listAktivitas`, `getAktivitasSummary` server fn + `use-aktivitas` hook + `qk.aktivitas.*`.
- Halaman Log Aktivitas pindah dari `LOG_DATA` ke query.

### S3. QR Code menjadi modul DB-backed

- Server functions: `listQR`, `createQR(arsipId)`, `regenerateQR(id)`, `toggleQRStatus(id)`, `recordQRScan(id)` (untuk endpoint publik `/qr/:slug`).
- Hook `useQRList`, `useQRMutations`. `qk.qr.*` di factory.
- Sinkronkan: setelah `createArsip` dan checkbox "buat QR" aktif → otomatis insert ke `qr_code`. Dashboard `qrAktif` membaca dari DB (sudah benar struktur, tinggal dirapikan).

### S4. Pengaturan persist

- Skema: tabel `public.app_settings` (single-row, untuk pengaturan sistem) atau pakai `public.user_security_settings` yang sudah ada untuk per-user.
- Server fn `getSettings`, `updateSettings`. Hook `useSettings`.
- Pengaturan saat ini tetap menampilkan form yang sama (UI tidak berubah); hanya `useState` diganti `useQuery + useMutation`.

### S5. Backup

- Pilihan: (a) wire ke DB `public.backup` + cron, atau (b) sembunyikan modul sampai backend siap.
- Rekomendasi minimal: server fn `listBackups`, `createManualBackup` (yang untuk sekarang hanya menulis metadata + dump basic ke R2). Status realistis ("Belum dikonfigurasi") agar tidak menyesatkan.

### S6. AI Assistant riwayat

- Pindahkan dari localStorage ke tabel `public.ai_conversations` + `ai_messages` dengan RLS `user_id = auth.uid()`.
- Hook `useAIConversations` tetap nama sama → di-rewire ke server fn + Query.

### S7. Konsolidasi tipe & query key

- Pindahkan tipe DTO ke modul `*.functions.ts` (sudah jadi pola) dan hapus duplikat di `*-data.ts`. `*-data.ts` jadi pure types saja, atau dihapus jika tidak dipakai.
- Tambah seluruh modul (current-user, managed-users, qr, aktivitas, settings, ai, backup) ke `qk` factory.

### S8. Auth & permission

- Ganti `getCurrentUser` agar memanggil `get_user_role` melalui `context.supabase` (user-scoped) — `get_user_role` dideklarasikan `security definer` di migrasi sehingga tidak butuh service role.
- Hapus listener `onAuthStateChange` di `_authenticated/route.tsx` (atau sebaliknya di `useCurrentUser`) untuk menghindari double-listener. Pilih satu owner (rekomendasi: hanya di `useCurrentUser`; layout cukup membaca `user` dan navigasi).
- Permission matrix tetap di `permissions.ts` (single source); jika ada duplikat di server, import dari modul yang sama.

### S9. Kategori & Lokasi shared hooks

- `use-kategori.ts`, `use-lokasi.ts` dengan CRUD + invalidasi (`qk.kategori.list`, `qk.lokasi.list`, `qk.arsip.facets`).
- Routes berhenti membuat `useQuery` inline.

### S10. Counter `jumlah_arsip`

- Tambah view PG `kategori_with_count` & `lokasi_with_count` (atau RPC) → server fn hanya `select * from view`. Hilangkan dua round-trip.

---

## 8. Modul yang akan berubah (backend/wiring saja)

`src/lib/query-keys.ts`, `src/lib/permissions.ts`, `src/lib/current-user.functions.ts`, `src/lib/arsip.functions.ts` (no-op), `src/lib/upload-arsip.functions.ts` (+activity log call), `src/lib/storage.functions.ts` (+activity log on delete), `src/lib/kategori.functions.ts`, `src/lib/lokasi.functions.ts`, **baru**: `src/lib/aktivitas.functions.ts`, `src/lib/qr.functions.ts`, `src/lib/settings.functions.ts`, `src/lib/ai-history.functions.ts`, `src/lib/backup.functions.ts`, `src/lib/activity-log.server.ts` (helper).

Hooks baru: `use-create-arsip.ts`, `use-kategori.ts`, `use-lokasi.ts`, `use-aktivitas.ts`, `use-qr.ts`, `use-settings.ts`, `use-managed-users.ts`, `use-backup.ts`. `use-ai-conversations.ts` di-rewire (nama & API publik tetap).

Routes yang di-rewire (tanpa UI berubah): `qr-code.tsx`, `log-aktivitas.tsx`, `backup.tsx`, `pengaturan.tsx`, `user.tsx`, `import.tsx`, `_authenticated/route.tsx` (hapus listener), `_authenticated/upload.tsx` (lewat shared hook).

Migrasi DB baru: `ai_conversations`, `ai_messages`, `app_settings` (atau extend `user_security_settings`), view `kategori_with_count` / `lokasi_with_count`, kolom `qr_slug` di `qr_code` bila belum ada, trigger/fungsi `insert_activity`.

Tidak diubah: seluruh `src/components/**`, `src/features/upload-intelligence/components/**`, layout, styling, navigasi, design tokens.

---

## 9. Risiko Implementasi & Mitigasi

- **Pemecahan tipe (Kategori vs KategoriRow)** dapat menyebabkan TS error luas → lakukan rename bertahap dengan re-export alias selama transisi.
- **Auth listener consolidation** bisa mengubah perilaku redirect → uji ulang sign-in, sign-out, refresh token, hard reload.
- **Migrasi DB** memerlukan urutan + GRANT yang tepat (per panduan platform) → setiap migration baru wajib menyertakan GRANT.
- **Wiring QR ke DB**: bila ada QR lama di pikiran user, semula kosong → tidak ada data hilang.
- **Activity log middleware** harus error-tolerant (gagal log tidak boleh menggagalkan mutation utama).
- **Service-role downgrade di** `getCurrentUser`: perlu memastikan policy RLS `user_roles SELECT` mengizinkan user membaca rolenya sendiri (atau gunakan `has_role`/`get_user_role` security-definer).

---

## 10. Hasil yang Diharapkan

- Setiap upload, edit, hapus arsip langsung tercermin di Dashboard, Cari, Statistik, Retensi, QR, Log Aktivitas tanpa reload.
- Tidak ada lagi modul yang memakai mock array sebagai sumber data.
- Satu query-key factory, satu permission matrix, satu auth listener, satu pola CRUD.
- Audit trail lengkap di `log_aktivitas`.
- Storage R2 sudah ready; tinggal env diisi sebelum publish.

---

## 11. Tahap Implementasi yang Diusulkan (setelah Anda menyetujui)

1. Foundation: perluas `qk`, hilangkan duplikasi tipe/permission, buat helper `recordActivity`.
2. Sinkronisasi arsip end-to-end: `useCreateArsip`, invalidasi facets, activity log untuk arsip CRUD.
3. Wire ulang modul mock: QR, Log Aktivitas, Pengaturan, Backup, AI history, Managed User hook, Kategori/Lokasi hooks.
4. Auth cleanup + service-role downgrade.
5. Optional: view PG untuk counter.
6. Regression test menyeluruh + build/typecheck.
7. **Stop** untuk meminta env Cloudflare R2 (`STORAGE_PROVIDER`, `R2_ACCOUNT_ID`, `R2_ENDPOINT`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`).
8. Validasi integrasi R2 end-to-end (presign → put → preview → download → delete → rollback).
9. Publish + laporan akhir.

---

## 12. Keputusan Anda

Saya menunggu salah satu:

- **APPROVE** — implementasi sesuai urutan §11.
- **CHANGE** — sebutkan bagian yang ingin disesuaikan (mis. tunda S5/Backup, atau ubah strategi AI history).
- **REJECT** — tidak melanjutkan, atau mulai ulang dengan ruang lingkup berbeda.

Catatan teknis: project di sandbox saat ini masih starter kosong. Sebelum implementasi dimulai, source code SIPASTERA yang Anda unggah perlu dipindahkan ke project (tanpa metadata `.git`), atau saya implementasikan langsung dengan menyalin file-file relevan ke dalam project saat tahap build. Mohon konfirmasi juga apakah Anda ingin saya melakukan ekstraksi tersebut pada langkah pertama implementasi.

CHANGE

&nbsp;

Saya menyetujui hampir seluruh hasil audit dan rekomendasi yang telah Anda berikan.

&nbsp;

Namun sebelum implementasi dimulai, saya ingin menambahkan satu tujuan utama yang harus menjadi acuan seluruh pekerjaan.

&nbsp;

Target akhir implementasi bukan hanya memperbaiki modul-modul yang masih menggunakan mock data.

&nbsp;

Target akhirnya adalah memastikan bahwa seluruh platform SIPASTERA bekerja sebagai satu sistem yang utuh (Unified Platform Architecture).

&nbsp;

Artinya setelah implementasi selesai, seluruh modul harus menggunakan fondasi yang sama dan tidak lagi mempunyai jalur implementasi yang berbeda.

&nbsp;

Saya ingin Anda memperlakukan platform ini sebagai satu ekosistem.

&nbsp;

Contoh alur yang saya harapkan:

&nbsp;

Authentication

&nbsp;

↓

&nbsp;

Permission

&nbsp;

↓

&nbsp;

Server Function

&nbsp;

↓

&nbsp;

Database

&nbsp;

↓

&nbsp;

Cloudflare R2

&nbsp;

↓

&nbsp;

Shared Query Layer

&nbsp;

↓

&nbsp;

Dashboard

&nbsp;

↓

&nbsp;

Manajemen Arsip

&nbsp;

↓

&nbsp;

Upload Arsip

&nbsp;

↓

&nbsp;

Cari Arsip

&nbsp;

↓

&nbsp;

Kategori

&nbsp;

↓

&nbsp;

Lokasi

&nbsp;

↓

&nbsp;

QR Code

&nbsp;

↓

&nbsp;

Statistik

&nbsp;

↓

&nbsp;

Log Aktivitas

&nbsp;

↓

&nbsp;

AI Assistant

&nbsp;

↓

&nbsp;

Pengaturan

&nbsp;

↓

&nbsp;

Manajemen User

&nbsp;

Seluruh modul tersebut harus menggunakan:

&nbsp;

- Authentication yang sama.

- Permission System yang sama.

- Server Function Pattern yang sama.

- Query Layer yang sama.

- Query Key Factory yang sama.

- Shared Hook yang sama.

- Storage Layer yang sama.

- Activity Log yang sama.

- Error Handling yang sama.

- Dependency yang sama.

- Workflow yang sama.

&nbsp;

Saya tidak ingin ada modul yang mempunyai implementasi khusus yang berbeda sendiri.

&nbsp;

Saya juga ingin seluruh perubahan pada satu modul otomatis tersinkron ke seluruh modul lain yang berkaitan tanpa perlu refresh manual.

&nbsp;

Selain itu, saya ingin Anda melakukan final sweep setelah seluruh implementasi selesai.

&nbsp;

Final sweep tersebut bertujuan memastikan:

&nbsp;

- Tidak ada mock data yang masih dipakai.

- Tidak ada local state yang menjadi sumber data utama.

- Tidak ada duplicate logic.

- Tidak ada duplicate server function.

- Tidak ada duplicate query.

- Tidak ada duplicate permission.

- Tidak ada duplicate helper.

- Tidak ada dependency yang tidak diperlukan.

- Tidak ada modul yang masih berjalan sendiri.

&nbsp;

Apabila pada saat implementasi Anda menemukan masalah arsitektur lain yang belum tercantum dalam audit ini, Anda diperbolehkan memperbaikinya selama:

&nbsp;

- tidak mengubah UI,

- tidak mengubah UX,

- tidak mengubah Design System,

- tidak mengubah Branding,

- tidak mengubah Layout,

- tidak mengubah workflow pengguna.

&nbsp;

Fokus hanya pada fondasi sistem agar seluruh platform benar-benar bekerja sebagai satu kesatuan.

&nbsp;

Setelah seluruh implementasi selesai, lakukan regression test menyeluruh, kemudian minta saya mengisi Environment Variable Cloudflare R2.

&nbsp;

Setelah Environment Variable berhasil diintegrasikan dan tervalidasi, baru lakukan publish platform.

&nbsp;

Target akhir sprint ini adalah menghasilkan platform SIPASTERA yang stabil, konsisten, sinkron, modular, dan siap digunakan tanpa adanya jalur implementasi yang berbeda antar modul.