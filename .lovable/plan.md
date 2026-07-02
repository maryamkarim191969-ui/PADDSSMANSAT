# Sprint Plan — PADDS SMANSAT Refinement & Enhancement

Delivered in one sprint, grouped by area. No changes to Design System, branding, or existing workflows unless the upgrade explicitly targets UI/UX.

## Upgrade 1 — AI Pengecekan Nomor Surat V2 (batch panel)

Move number-check from per-form to a workspace-level stage that runs after "Analisis Dokumen".

- Add "Cek Nomor Surat" action to `UploadWorkspace.tsx` toolbar (enabled once ≥1 item has metadata with `nomor_surat`).
- New hook state: `runNomorCheckAll()` in `useUploadQueue.ts` — iterates items with a filled nomor, calls existing `checkNomorSurat`, aggregates results.
- New panel `NomorCheckPanel.tsx`: appears below queue, groups every match found. Each row shows nomor, judul, deskripsi, tanggal surat, kategori, status, arsip DB id, similarity (exact vs case-normalized). Actions: "Buka di Arsip" (→ `/arsip?id=<id>`), "Lihat form" (opens ArsipFormSheet for the queued item), "Abaikan".
- Keep the per-form manual "Cek Nomor" button for spot verification (non-breaking).

## Upgrade 2 — Location integration in Upload Arsip

- Verify `useMasterData` already exposes `lokasi` (it does). Wire `lokasi_id` field in `ArsipFormSheet` as a Select bound to the master list from `Manajemen Lokasi Arsip`.
- Ensure `formMapping.ts` maps `lokasi_id` when submitting; `arsip.functions.ts` already accepts the column.
- Show location name + code in the queue row summary.
- Reuse existing QR/lokasi functions; no new schema.

## Upgrade 3 — AI Assistant time awareness

In `src/routes/api/ai-chat.ts` add the current server time to the runtime snapshot and inject it into the system prompt in `ai-gateway.server.ts` / `ai-knowledge-base.ts`:

```
Waktu server saat ini: {ISO} (WITA, {weekday, tanggal, jam}).
Gunakan waktu ini untuk sapaan dan referensi waktu.
```

## Upgrade 4 — Upload Arsip UI/UX refinement

Layout only — no workflow change:
- Split workspace into three visually distinct zones: (a) Intake (dropzone + rejected list), (b) Pipeline (stepper: Antrian → Analisis AI → Cek Nomor → Upload), (c) Antrian + panels.
- Stepper component showing which AI stages are complete/in-progress/pending, with counts.
- Toolbar actions grouped by stage with clearer labels & icons.
- Queue rows: better spacing, status chip prominence, per-item mini-progress.

## Upgrade 5 — AI Document Search enhancement

In `ai-search.functions.ts`:
- Raise candidate corpus from current cap to 200 rows, return top 50 (up from ~10).
- Improve ranking prompt to also return `matched_reason` per result and group hints.
- `AISearchPanel.tsx`: show more results with reason badges, "Lihat lebih banyak" expander, and count summary.

## Upgrade 6 — AI Assistant workspace refinement

`src/routes/_authenticated/ai-assistant.tsx` + `AIChat` shell:
- Collapse capabilities/quick-actions into a single "Panduan" drawer.
- Simplify header (single title + status), reduce redundant badges.
- Group history sidebar and hide meta chips behind hover.
- No feature removal.

## Upgrade 7 — AI Statistics dashboard

New route `src/routes/_authenticated/ai-statistik.tsx` + nav item.

Data source: `log_aktivitas` filtered by `modul='AI'` and dedicated action tags. To make counts real:
- Add `writeLogEntry` calls to existing AI touchpoints: `document-intelligence.functions.ts` (metadata), `nomor-check.functions.ts`, `ai-search.functions.ts`, `duplicate-check.functions.ts`, and `api/ai-chat.ts`. Action names: `ai.metadata`, `ai.nomor_check`, `ai.category_proposal`, `ai.search`, `ai.assistant`.
- New server fn `getAiStatistics` aggregating counts by action, by day (30d), by user, success/failure.
- Dashboard cards: total AI calls, per-capability breakdown, 30-day trend chart (recharts, already used), top users, recent AI events table.

## Upgrade 8 — Viewer role

Audit: `Viewer` already exists in `permissions.ts` and DB enum `app_role`. Gaps:
- Ensure all mutation buttons/dialogs are gated by `hasPermission('write.*' | 'delete.*')` (spot-check arsip/kategori/lokasi/user/qr modules).
- Ensure sidebar hides admin-only items (User, Backup, Pengaturan) for Viewer via existing `permissions` map.
- Server-side: verify each mutating server fn checks role via `has_role` where sensitive; add missing checks (kategori/lokasi write already RLS-protected; confirm no bypass).
- Add integration test-style manual verification via preview.

## Order of execution

1. DB — none required.
2. Server fns: extend `ai-search`, `ai-chat` snapshot with time, add AI logging calls, add `getAiStatistics`.
3. Hooks: `useUploadQueue` batch nomor-check; ensure `lokasi_id` mapping.
4. UI: NomorCheckPanel, ArsipFormSheet lokasi field, UploadWorkspace stepper/layout, AISearchPanel expansion, AI Assistant refinement, AI Statistics page + nav.
5. Permissions: sweep gates for Viewer.
6. Typecheck + smoke via preview.

## Out of scope (explicitly)

- No changes to Design System tokens, branding, or existing workflows.
- No new DB tables (AI stats derived from `log_aktivitas`).
- QR Lokasi implementation reused as-is.
