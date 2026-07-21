# Program Pages - Complete Technical Reference

> **Project:** PRIM AI Institute
> **Module:** Program landing pages (`/program/:slug`), Thank You flow, enrollment capture, Program Pages CMS, Program Enrollments admin
> **Last updated:** 2026-07-21
>
> Read this file INSTEAD of re-reading the source when working on anything program-page related. Every file path, data shape, endpoint, and invariant is recorded here.

---

## 1. What this module is

Standalone, **light-theme** marketing funnels sold per program (first one: `10-day-ai`). Each page is a single-URL landing funnel with its own header/footer - it does **not** use the main site's dark theme, Navbar, or Footer. The funnel is:

```
/program/:slug  (landing page, #enroll form)
      │  submit → POST /api/program-enrollments (capture FIRST)
      ▼
/program/:slug/thank-you  (countdown → WhatsApp deep-link)
      │
      ▼
wa.me/<admin number>?text=<prefilled from template>
```

Everything on the page is admin-editable per program via **Admin → Program Pages** (`/admin/program-pages`). Captured leads are managed in **Admin → Program Enrollments** (`/admin/program-enrollments`, sidebar entry between Tutorial Leads and Projects).

---

## 2. File map

### Frontend
| File | Role |
|---|---|
| `frontend/src/data/programPagesData.ts` | ALL types (`ProgramPage`, `PgMedia`, sub-types), `DEFAULT_10DAY` seed, `toMedia()`/`hasMedia()`, localStorage cache helpers, `PROGRAM_ENROLLMENT_PROFILE_OPTIONS` |
| `frontend/src/pages/ProgramPage.tsx` | The landing page (16 sections, scroll reveal, sticky header, mobile bar, enrollment form + submit flow) |
| `frontend/src/pages/ThankYouPage.tsx` | `/program/:slug/thank-you` - summary card, countdown, WhatsApp redirect |
| `frontend/src/pages/admin/ProgramPagesAdmin.tsx` | CMS editor (tabbed modal: meta/hero/content/people/batches/pricing/form), `MediaInput`, `ImageUrlInput`, save validation |
| `frontend/src/pages/admin/ProgramEnrollments.tsx` | Admin leads section: stats, filters, table, inline status/notes, CSV, wa.me quick action |
| `frontend/src/components/shared/MediaDisplay.tsx` | Shared image-or-video renderer for every media slot |
| `frontend/src/api/programEnrollments.ts` | API client: submit + admin list/stats/update/export |
| `frontend/src/api/content.ts` | `getPageContent` / `putPageContent` (generic JSON store) |
| `frontend/src/api/blog.ts` | `uploadMedia` (images), `uploadVideo`, `fetchMediaFromUrl` (shared with Blog) |
| `frontend/src/lib/enrollmentQueue.ts` | localStorage retry buffer for failed capture POSTs (transient, NOT a lead store) |
| `frontend/src/lib/imageUrl.ts` | `convertImageUrl()` - Drive share link → thumbnail form |
| `frontend/src/styles/program-page.css` | ALL page styling, scoped under `.pp-root` (light theme tokens `--pp-*`) |
| `frontend/public/Asset 8.svg` | Program-page header logo (dark wordmark + orange icon, for light backgrounds) |

### Backend
| File | Role |
|---|---|
| `backend/src/program-enrollments/*` | NestJS module: controller, service, DTOs (capture + admin endpoints) |
| `backend/src/content/*` | Generic `page_content` JSONB store (`GET/PUT /api/content/:key`) - program pages live under key **`programPages`** |
| `backend/src/media/*` | Upload/fetch-url endpoints (images via sharp→WebP; videos stored raw) |
| `backend/prisma/schema.prisma` | `ProgramEnrollment` model + `EnrollmentStatus` enum (migration `20260720120000_add_program_enrollments`) |

### Routes (in `frontend/src/App.tsx`)
- `/program/:slug` and `/program/:slug/thank-you` - **outside** `PublicLayout` (no site Navbar/Footer), each lazy in its own `<Suspense>`.
- `/admin/program-pages`, `/admin/program-enrollments` - inside the admin layout (JWT `PrivateRoute`).

---

## 3. Content model & persistence

One JSON document = `ProgramPage[]` (array of programs), stored server-side in the `page_content` table under key `programPages`.

**Read path (both public pages):** paint immediately from `loadProgramPagesData()` (localStorage cache key `primAI_programPages`, falls back to bundled `DEFAULT_10DAY`), then `getPageContent('programPages')` replaces state and refreshes the cache. `serverChecked` gates the "Program not found" screen so a slow fetch doesn't flash 404.

**Write path (admin only):** editor Save → poster validation (`mediaPosterErrors`) → `normalizeImages` (Drive→thumbnail conversion at the single choke-point, media-aware) → `PUT /api/content/programPages` (JWT). The store is schemaless - **new fields never need a backend change or migration**; add to the interface + `DEFAULT_10DAY` and existing saved docs simply lack the key (guard renders accordingly, or rely on `emptyProgramPage()` spreading `DEFAULT_10DAY`).

**Key `ProgramPage` field groups** (see interface for the full list): meta (slug/visible/title/desc), announcement bar, header (brand, navLinks, CTA), hero (heading + gradient phrase, guarantee strip toggle+text, subtext, prices, CTA, social-proof toggle+text, heroImage, floating badge), stat band, buildCards[], dayPlanItems[], classroomImages[], learnerCards[], mentors[], batches[], testimonials[], pricing (+features[], cert image), enrollment form labels/placeholders, `whatsappNumber` + `whatsappMessageTemplate` (`{name} {phone} {batch}`), thank-you fields (`thankYouHeading/Subtext/CountdownSeconds/WhatsappMessageTemplate` - placeholders `{name} {program} {batch}`), optional-field toggles (`showCityField/showEmailField/showUserTypeField` + labels/placeholders), FAQ, CTA banner, footer.

**Batches:** `PgBatch { name, datetime, status: 'Open'|'Filling Fast'|'Closed', seatsText }`. The form dropdown only offers `status !== 'Closed'` (`activeBatches` in ProgramPage.tsx). Batch names are stored on enrollments as **text snapshots** - admin renames never rewrite history.

---

## 4. Media system (image-or-video slots)

Every image slot (9 of them: heroImage, buildCards[].image, classroomImages[].url, learnerCards[].image, mentors[].image, testimonials[].image, pricingCertImage, footerCertImage) is typed `PgMediaValue = string | PgMedia`:

```ts
interface PgMedia { type: 'image'|'video'; imageUrl: string; videoUrl?: string }
```

- Plain strings = legacy/image-only content. `toMedia()` normalizes on read; **image-mode slots keep saving as plain strings** - the object form is written only when a video is attached. Zero migration ever.
- `hasMedia()` for truthiness checks (an empty media object is truthy - never check the field directly).
- **`<MediaDisplay>`** renders every slot: image mode = plain `<img>` (or `.pp-img-placeholder`); video mode = wrapper div carrying the exact className/style the image had (no layout shift; 16/9 default aspect only if the caller provides no height/class), poster `<img>` + `<video muted loop playsinline preload="none">` absolutely filled. IntersectionObserver (rootMargin 200px) attaches `src` on approach, plays on enter, pauses on exit. Fade-in on `canplay`. Falls back to image on error / `navigator.connection.saveData` / `prefers-reduced-motion` (module-level `VIDEO_DISABLED`).
- ProgramPage's `Img` delegates to MediaDisplay; `Avatar` wraps it circular (`pp-avatar` class) with its own 👤 placeholder.

**Admin `MediaInput`** (in ProgramPagesAdmin.tsx): Image/Video toggle per slot. Video mode = required poster (`ImageUrlInput`) + upload button (`uploadVideo`, mp4/webm) + paste-URL input (Drive `file/d/<id>` auto-converts to `uc?export=download&id=` with an unreliability warning) + inline `<video controls>` preview + "compress under ~5 MB" hint. Save is blocked (alert with slot list) if any video slot lacks a poster.

**Upload endpoint** `POST /api/admin/media/upload` (JWT, multer memory, 15 MB interceptor limit): `video/*` → `validateVideoMimeType` (mp4/webm only) → `uploadVideo()` stores **raw bytes** (no sharp) at `uploads/program/video/<ts>-<sanitized>.<ext>`; images → 8 MB manual cap → sharp→WebP as before (Blog unaffected). Nginx serves `/uploads/*` with correct Content-Type and range requests (verified 206) - that's what makes video streaming work. `POST /api/admin/media/fetch-url` re-hosts external images (SSRF-guarded, images only - not videos).

---

## 5. Enrollment capture (backend)

**Table** `program_enrollments` (Prisma `ProgramEnrollment`): id cuid, fullName, whatsappNumber, city?, email?, userType?, programSlug, programTitle (snapshot), batchName (snapshot), `status EnrollmentStatus @default(NEW)` (NEW/CONTACTED/CONFIRMED/CANCELLED - note: **different** from bookings' LeadStatus), notes?, `submissionCount @default(1)`, createdAt/updatedAt. Indexes: (whatsappNumber, programSlug), programSlug, status.

**Endpoints** (`program-enrollments.controller.ts` - admin routes use the codebase's `admin/` prefix convention):
| Route | Auth | Notes |
|---|---|---|
| `POST /api/program-enrollments` | public | Throttle 10/hour/IP; class-validator DTO (phone `/^[6-9]\d{9}$/`, optional email/city/userType) |
| `GET /api/admin/program-enrollments` | JWT | filters: search (name/number), program, batch, status, dateFrom/dateTo, page/limit |
| `PATCH /api/admin/program-enrollments/:id` | JWT | status and/or notes |
| `GET /api/admin/program-enrollments/stats` | JWT | total, todayCount, byProgram, byBatch, last7Days buckets |
| `GET /api/admin/program-enrollments/export` | JWT | CSV (declared before the bare GET/`:id` routes - keep that order) |

**Dedup:** `create()` looks for the same `whatsappNumber + programSlug` within a **24-hour window** (`DEDUP_WINDOW_MS`) - updates that row (refreshing batch/fields) and increments `submissionCount` instead of inserting. Deliberately time-bounded, unlike TutorialLead's permanent unique-mobile merge: someone returning next batch cycle gets a NEW row. Repeat interest shows in the admin as a `×N` chip.

---

## 6. Submit flow (capture-first) & Thank You page

`handleFormSubmit` in ProgramPage.tsx:
1. Client-validates phone; builds payload including only the optional fields that are toggled on AND filled.
2. `await submitProgramEnrollment(payload)` (6 s axios timeout - the visitor must never wait long).
3. **Success** → `navigate('/program/<slug>/thank-you', { state: { fullName, batchName, programTitle } })`. The thank-you page is reached **only on confirmed capture**.
4. **Failure** → `queueFailedEnrollment(payload)` (localStorage `primAI_pendingEnrollments`, flushed on next page mount by `flushQueuedEnrollments()` - a retry buffer, NOT lead storage), then the legacy direct `window.open(wa.me…)` runs so the conversion is never lost, plus an orange banner with a manual link (post-`await` opens can be popup-blocked).

**ThankYouPage.tsx:** reads router state; direct visits/refreshes get generic content (no personal summary, generic WhatsApp message) - never crashes, never re-submits (it POSTs nothing). Countdown from `thankYouCountdownSeconds` (re-syncs when server content loads); at 0 a **one-shot** `window.location.href = waUrl` auto-attempt (`autoOpened` ref). The big "Open WhatsApp Now" `<a>` is visible from load (skippable countdown) and is the guaranteed path - iOS Safari routinely blocks the auto-attempt; the banner flips to "Didn't open? Tap the button below." Message template placeholders `{name} {program} {batch}`, URL-encoded via `encodeURIComponent`.

**GTM:** container `GTM-TPQD2QBR` in `frontend/index.html` only (GA4/Meta configured inside GTM, never in code). React Router `navigate()` fires pushState → GTM History Change trigger sees `/thank-you` as a page view; register conversions in the GTM/ads dashboards, not in code.

---

## 7. Admin pages

**ProgramPagesAdmin** (`/admin/program-pages`): list of programs → full-screen modal editor, tabs `meta | hero | content | people | batches | pricing | form` (form tab includes Thank You Page section + Optional Fields toggles + Footer). Local edit state `p` + generic `set(key, val)`; sub-list updaters are generic `<K extends keyof T>`. Dark admin theme (`S.*` style tokens) - do not leak `--pp-*` styles here. Save → validation → normalize → PUT (server is source of truth; localStorage is only a cache).

**ProgramEnrollments** (`/admin/program-enrollments`): stat cards (total/today/last-7-days/top batch), byProgram %-bars + byBatch list, filter form, paginated table (25/page) with inline status `<select>` (color-coded NEW cyan / CONTACTED orange / CONFIRMED green / CANCELLED red, optimistic update), inline notes input + Save, CSV export (blob download), per-row `💬 Chat` → `wa.me/<number>`. Modeled on TutorialLeads.tsx (status/notes pattern adapted from Bookings since TutorialLeads has neither).

---

## 8. Design system (page)

Scoped in `program-page.css` under `.pp-root`. Tokens: `--pp-bg #F5F8FC`, `--pp-navy-dark #0F172A`, `--pp-muted #475569`, `--pp-orange #F97316`, `--pp-green #10B981`, `--pp-dark-band #0D1B2A`, fonts Montserrat (head) / Plus Jakarta Sans (body). Utility classes: `pp-btn(-primary|-green|-white)`, `pp-card(-sm|-hover)`, `pp-badge(-green|-orange|-grey|-orange-solid)`, `pp-input`, `pp-img-placeholder`, `pp-avatar(-placeholder)`, grids `pp-grid-*`, `pp-reveal` (IntersectionObserver scroll reveal via `useReveal`). Sticky header + mobile bottom price bar; desktop nav hidden <768px by an inline `<style>` at the bottom of ProgramPage.tsx. Header logo is `/Asset 8.svg` (light-background variant - the dark-band footer must NOT use it).

---

## 9. Invariants - do not break

1. **Capture before WhatsApp.** Thank-you page only on confirmed POST success; API failure still opens WhatsApp directly + queues retry. Never block or strand the visitor.
2. **Closed batches never appear** in the enroll dropdown.
3. **Snapshots protect history**: programTitle/batchName on enrollments are copied text, never joins.
4. **No lead data in localStorage** - `primAI_pendingEnrollments` is a transient retry buffer only; `primAI_programPages` is a content cache only.
5. **Video slots require a poster** (`mediaPosterErrors` blocks save); poster is the fallback for error/Save-Data/reduced-motion. Check media fields with `hasMedia()`, never raw truthiness.
6. **Image-mode slots save as plain strings**; only video attaches the object. `toMedia()` on every read.
7. Program pages are **standalone light theme** - never wrap in PublicLayout, never import site Navbar/Footer, never leak dark-admin styles in.
8. Enrollments are a **separate system** - don't merge with Tutorial Leads / Bookings / Enquiries (different enums, different tables).
9. CSV/stats/export routes stay declared **before** parameterized routes (NestJS shadowing).
10. Content is schemaless JSON - never write a DB migration for a page-content field; DO write one (hand-written SQL, `migrate deploy` on server) for enrollment-table changes.

## 10. Deploy quick-reference

Push `boop main` → SSH `root@200.97.169.195` (see DEPLOY.md for password) → `/var/www/primai` → `git fetch origin && git merge origin/main --ff-only`. Frontend-only: `cd frontend && npm run build` (done). Backend: `cd backend && npm run build && pm2 restart primai-backend`; schema changes add `npx prisma migrate deploy && npx prisma generate` first. Verify: page/asset 200s, `POST /api/program-enrollments` with `{}` returns 400 validation JSON, uploads under `https://primaiinstitute.com/uploads/…` return 206 on Range requests.
