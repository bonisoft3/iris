# Iris — Intelligent Waste Classification & Circular Recovery

Iris is a multilingual waste-sorting lens, specimen gallery, and circular recovery directory converted from `guis/iris` and `guis/web` to Pronto (`apps/iris`). People photograph or select discarded items to classify their material and waste stream (`recyclable`, `organic`, `eletronic`, `non_recyclable`, `trash`), read step-by-step disposal instructions and estimated recovery value in six languages (`en`, `es`, `pt`, `ru`, `he`, `kk`), locate or register neighbourhood disposal bins, offer reusable items for donation, and track community sustainability impact.

## Six-Sprint Roadmap (24 Turns)

### Sprint 1 — Core Data Model, Gallery, Item Detail, Onboarding & Campaigns (Turns 1–4, Completed)
- **Turn 1 (done):** Core domain entities (`AppUser`, `Me`, `TrackRequest`, `TrashItem`, `TrashItemTranslation`, `TranslationRequest`, `DisposalPlace`, `Donate`, `NewsItem`), RLS & owner-write policies (`011`–`014`), curated waste specimen network (`020_demo_items.sql`) with content-addressed `/pictures/` assets, and read-only **Gallery** (`/`) and **Item Detail** (`/images/:id`) screens in 6 locales (`en`, `es`, `pt`, `ru`, `he`, `kk`).
- **Turn 2 (done):** Personal gallery status phases (`submitted`, `synced`, `classifying`, `classified`), **My Items** vs **IRIS Global** tab switching (`GalleryView`), and desktop split-pane detail preview.
- **Turn 3 (done):** Item detail inspection tabs (`How to Discard`, `Material & Streams`, `Nearby Centers`) via `DetailView`, nearby recycling centers list, and live locale translation display with Hebrew RTL bidi isolation.
- **Turn 4 (done):** 3-step **Onboarding** walkthrough (`/intro`) with `OnboardingStep` stepper illustrations and **Campaign** showcase pages (`/lp`: Snap & Recycle, Small Choices Big Impact, AI for Recycling).

### Sprint 2 — Camera Scan, Segmentation Overlay, Classification & Translation Pipelines (Turns 5–8, Completed)
- **Turn 5 (done):** **Camera Scan** screen (`/camera`) with `ScanDraft`, AI model selector (`gemini` / `openai`), specimen presets, and `TrackRequest` submission.
- **Turn 6 (done):** Interactive specimen segmentation overlay, cover-crop geometry (`cropToCover`), and Generalized Intersection over Union (`computeGIoU`) bounding-box telemetry on `/camera` via `ScanDraft` and `scan_draft.js` (zero escape hatches).
- **Turn 7 (done):** Deterministic database classification trigger (`015_classify_request.sql`) promoting `TrackRequest` rows into `TrashItem` idempotently on `request_id` (`unique`) and advancing status to `classified`.
- **Turn 8 (done):** On-demand translation request form (`request-translation` on `/images/:id`) and multilingual translation trigger (`016_translate_item.sql`) fulfilling `TranslationRequest` rows into `TrashItemTranslation` across all six locales.

### Sprint 3 — Disposal Places, Donations, User Profile & Recycling News (Turns 9–12, Completed)
- **Turn 9 (done):** **Disposal Places** directory (`/places`) with stream filter pills (`PlacesView`), verified hub metadata, bin registration form (`register-place`), `iris.cleaning` design revamp, and `apps/snapcards`-style topbar language switcher with `LocalizedItem` (`localize_content.js`).
- **Turn 10 (done):** Community reuse & **Donate** flow on `/images/:id` and `/places` with claim action and two-tap owner retraction.
- **Turn 11 (done):** **User Profile & Collection Settings** screen (`/profile`) editing `AppUser` (`display_name`, `home_address`, `address_complement`, `phone_number`, `preferred_model`).
- **Turn 12 (done):** **Recycling News & Sorting Tips** screen (`/news`) displaying localized `NewsItem` articles, language filter pills (`NewsView` + `news_view.js`), and the 3-step sorting & photography field guide.

### Sprint 4 — Search, Category Filtering, Impact Metrics, Moderation & Offline Sync (Turns 13–16, Completed)
- **Turn 13 (done):** Live gallery search (`query` `ilike`) and waste category filter chips (`all`, `recyclable`, `organic`, `eletronic`, `non_recyclable`, `trash`) via `GalleryView` and `gallery_view.js`.
- **Turn 14 (done):** Sustainability impact counters (total items classified, recyclables & organics diverted, active disposal bins, community donations) on `/` and `/profile`.
- **Turn 15 (done):** Inappropriate-content moderation filter (`tagged_as_inappropriate=eq.false`) and owner-only two-tap `<details>` deletion for items and requests.
- **Turn 16 (done):** Sync status indicators (`submitted`, `synced`, `classifying`, `classified`) and offline recovery cues.

### Sprint 5 — Responsive Geometry, Dark Twin Audit, 6-Locale + RTL Parity & Static Specimens (Turns 17–20, Completed)
- **Turn 17 (done):** Container-query responsive geometry (`390px`, `768px`, `1280px`), 44px touch targets, and layout-shift guards.
- **Turn 18 (done):** Dark appearance parity (`test-dual-appearance`) and zero-literal stylesheet audit (`tests/appearance.test.ts`) across all screens.
- **Turn 19 (done):** Six-locale catalogue completeness (`en`, `es`, `pt`, `ru`, `he`, `kk`), Hebrew RTL logical layout, and `tests/catalogues.test.ts`.
- **Turn 20 (done):** Content-addressed specimen manifest verification (`tests/pictures.test.ts`) and `/credits` attribution screen.

### Sprint 6 — Unit Suite, Multi-Session RLS Ledger Driver, Live Verify Journeys & Release (Turns 21–24, Completed)
- **Turn 21 (done):** Handler fold and mounted screen pose unit suite (`tests/screens.test.ts`).
- **Turn 22 (done):** Multi-session RLS, forged-write refusal, and `request_id` idempotency integration driver (`tests/ledger.ts`).
- **Turn 23 (done):** End-to-end browser verification journeys (`tests/verify.ts`).
- **Turn 24 (done):** Component documentation (`README.md`, `docs/index.md`, `docs/release.md`), platform pin verification, and snapshot release.
