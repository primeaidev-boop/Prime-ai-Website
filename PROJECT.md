# PRIM AI Institute — Project Reference

**Client:** STAD Solution, Ahmedabad, India  
**Developer:** Mouryrajsinh Jadeja  
**Last Updated:** July 2026

---

## Deployment

| Layer    | Target                          |
|----------|---------------------------------|
| Frontend | Vercel                          |
| Backend  | Railway / Dell T30 Ubuntu Server|
| Database | Neon PostgreSQL (prod) / local PG16 (dev) |

## Key URLs

| Environment | URL |
|-------------|-----|
| Frontend dev | http://localhost:5173 |
| Backend dev | http://localhost:3001 |
| Swagger docs | http://localhost:3001/api/docs |
| Admin panel | /admin/dashboard |

---

## Phase 1 — Marketing Site + Lead Gen (Complete)

- Public marketing pages: Home, About, Courses listing, Contact
- Demo booking form — stored in PostgreSQL, WhatsApp alert via MSG91
- Contact/enquiry form — stored in PostgreSQL, WhatsApp alert via MSG91
- Admin dashboard with JWT authentication (bcrypt passwords)
- Lead management: status updates (NEW/CONTACTED/CONVERTED/LOST), notes, CSV export
- Site settings CMS — editable key/value pairs from admin panel
- Rate limiting (100 req / 15 min per IP via Throttler)
- CORS locked to frontend URL

---

## Phase 2 — Tutorial System (Complete)

### Public Tutorial Listing (`/tutorials`)
- Category filter tabs with visibility toggle
- Tutorial cards: difficulty badge, tags, lesson count, premium indicator
- Featured/pinned tutorials
- Hero stats row, newsletter signup strip, upsell banner
- All content editable from admin CMS

### Lesson Reader (`/tutorials/:tutorialSlug/:lessonSlug`)
- Sidebar with chapter + lesson tree
- Sequential lesson unlock (previous lesson must be completed to access next)
- Unlock rules: `sequential`, `mark-complete`, `free`, `pass-quiz`, `read-fully`, `watch-video`, `manual`
- `isFree` flag overrides locks — always accessible regardless of progress
- Admin `manual` lock = permanent gate regardless of user progress
- Lesson complete button — marks progress in localStorage, immediately unlocks next lesson in sidebar
- Progress persists across page refresh
- Next → button navigates to the next accessible lesson

### Content Block System (admin-authored, 19 block types)
`heading` · `paragraph` · `richText` (TipTap WYSIWYG) · `image` · `video` · `highlightBox` · `prompt` · `table` · `code` · `callout` · `comparison` · `checklist` · `download` · `quiz` · `faq` · `aiToolCard` · `divider`

### Quiz Block
- MCQ, True/False, Multi-select question types
- Configurable pass threshold (0–100%)
- `pass-quiz` unlock rule gates next lesson on quiz pass
- Correct answer + explanation shown after submission

### User Progress (localStorage)
- Per-lesson status: `not-started` / `in-progress` / `completed`
- Quiz passed, scrolled-to-bottom, video-watched flags
- Tutorial-level completion percentage
- Certificate earned flag
- Learning minutes accumulator

### Certificates
- Admin toggles `hasCertificate` on a tutorial
- Certificate generated client-side when all lessons completed
- Learner name input (stored in localStorage)

### Tools & Stats Sidebar
- Live tools list with icons shown in lesson sidebar
- Prompt templates link
- Admin-editable per tutorial

### Tutorial CMS (admin — `/admin/tutorials`)
- Full CRUD for tutorials, chapters, lessons, content blocks
- Drag-reorder for lessons and blocks
- TipTap rich text editor for `richText` blocks
- Monaco editor for `code` blocks
- Backend persistence: JSON blob stored in `site_settings` table (`key = tutorial_data`)
- `GET /tutorials/data` — public, no auth
- `PUT /tutorials/data` — JWT required

### Tutorial Leads
- Email capture on newsletter strip
- Stored in `tutorial_leads` table with source tracking

---

## Phase 3 — Courses Module (Complete)

- Three course levels: L1 Foundation, L2A Generalist, L2B Developer
- Per-course pages with: Who It's For, Curriculum Modules, Tools, Outcomes, Before/After, Eligibility, FAQs, Testimonials
- Courses listing page with hero + "Who Should Join" cards
- Full admin CMS: edit all course content, reorder modules/tools/outcomes/FAQs
- Backend: full Prisma models, REST CRUD under `/api/courses` and `/api/courses-listing`

---

## Projects Showcase (Complete)

### Public Listing (`/projects`)
- Hero with stats row
- Featured projects section (desktop)
- Category filter bar (sticky)
- Project grid with pagination ("Load More")
- Project card: cover image, category badge, award badge, tech stack tags, student info

### Project Detail (`/projects/:slug`)
- Full-width cover hero with action buttons (Live Demo, Source Code)
- About the Project: Problem, Solution, Key Features
- **Live Code Demo** — sandboxed iframe (`sandbox="allow-scripts"` only, never `allow-same-origin`)
  - Authored in admin with Monaco editor (HTML / CSS / JS tabs + live preview)
  - Rendered via `srcDoc`, never written to server
  - Reset + Fullscreen buttons
  - Hidden completely when `codeRunnerEnabled` is false or `codeHtml` is empty
- Student Story section
- Mentor Feedback section
- Right sidebar: Project Impact stats, Tech Stack tags, Project Links

### Projects Admin (`/admin/projects`)
- Full CRUD: add / edit / delete projects
- Monaco editor for HTML, CSS, JS code with live preview tab
- Category management tab
- Hero + stats content tab
- Save publishes to PostgreSQL (`site_settings` table, `key = projects_data`)
- `GET /projects/data` — public, no auth
- `PUT /projects/data` — JWT required

### Data Architecture
- Backend PostgreSQL is the **source of truth** for all project data
- Frontend loads from localStorage on first render (instant), then fetches from backend on mount and updates state + cache
- All devices and users always see the same data regardless of browser cache

---

## Blog Module (Complete)

- Blog posts stored in PostgreSQL with full Prisma model
- Admin CRUD for posts (title, slug, content, cover image, tags, published flag)
- Public listing and detail pages
- Media upload support for cover images

---

## Media Module (Complete)

- File upload endpoint (`/api/media/upload`)
- Images served from `/uploads/` static path
- Used by: courses, projects, tutorials, blog

---

## Notification System

| Mode | Behaviour |
|------|-----------|
| `NODE_ENV=development` | Logs to console, no external call |
| `NODE_ENV=production` | POSTs to MSG91 WhatsApp API |

Triggers: new demo booking, new enquiry.

---

## Backend Module Summary

| Module | Table(s) | Notes |
|--------|----------|-------|
| `bookings` | `demo_bookings` | Public POST + admin CRUD + CSV |
| `enquiries` | `enquiries` | Public POST + admin CRUD + CSV |
| `auth` | `admins` | JWT login, bcrypt |
| `admin` | — | Dashboard stats + recent leads |
| `settings` | `site_settings` | Key/value CMS store |
| `media` | filesystem `/uploads` | File upload + static serve |
| `blog` | `blog_posts` | Admin CRUD + public read |
| `courses` | `ai_courses` + related | Full course CMS |
| `tutorials` | `site_settings` (key: `tutorial_data`) | JSON blob |
| `tutorial-leads` | `tutorial_leads` | Email capture |
| `projects` | `site_settings` (key: `projects_data`) | JSON blob |
| `notifications` | — | MSG91 / console |

---

## Frontend Route Summary

| Route | Page | Auth |
|-------|------|------|
| `/` | Home | Public |
| `/about` | About | Public |
| `/courses` | Courses listing | Public |
| `/courses/:slug` | Course detail | Public |
| `/tutorials` | Tutorial listing | Public |
| `/tutorials/:tutorialSlug/:lessonSlug` | Lesson reader | Public |
| `/projects` | Projects listing | Public |
| `/projects/:slug` | Project detail | Public |
| `/contact` | Contact | Public |
| `/admin/login` | Admin login | Public |
| `/admin/dashboard` | Dashboard | JWT |
| `/admin/bookings` | Bookings CRM | JWT |
| `/admin/enquiries` | Enquiries CRM | JWT |
| `/admin/settings` | Site settings | JWT |
| `/admin/courses` | Courses CMS | JWT |
| `/admin/tutorials` | Tutorials CMS | JWT |
| `/admin/projects` | Projects CMS | JWT |

---

## CSP (vercel.json)

Monaco Editor loads from `cdn.jsdelivr.net`. CSP allows:
- `script-src`: `'self'` + `cdn.jsdelivr.net`
- `style-src`: `'self' 'unsafe-inline'` + `cdn.jsdelivr.net`
- `font-src`: `'self' data:` + `cdn.jsdelivr.net`
- `worker-src`: `'self' blob:` + `cdn.jsdelivr.net`
- `frame-src`: `'self' blob:` (sandboxed iframes for live code runner)

---

## Production Checklist

- [ ] Set `NODE_ENV=production` on Railway
- [ ] Set `DATABASE_URL` to Neon connection string
- [ ] Set `JWT_SECRET` to a long random string (never the dev value)
- [ ] Set `MSG91_AUTH_KEY` and `ADMIN_WHATSAPP`
- [ ] Set `FRONTEND_URL` to Vercel domain
- [ ] Set `VITE_API_URL` to Railway API domain on Vercel
- [ ] Run `npx prisma migrate deploy` (not `migrate dev`) in production
- [ ] Run `npx prisma db seed` once for the default admin account
