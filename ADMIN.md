# PRIM AI Institute - Admin Panel Documentation

> **Live URL:** https://primaiinstitute.com/admin/login  
> **Backend API:** https://primaiinstitute.com/api  
> **Server:** DigitalOcean · `64.227.143.243` · PM2 + Nginx + PostgreSQL 16

---

## Table of Contents

1. [Quick Access](#1-quick-access)
2. [Authentication](#2-authentication)
3. [Dashboard](#3-dashboard)
4. [Bookings](#4-bookings)
5. [Enquiries](#5-enquiries)
6. [Settings Reference](#6-settings-reference)
7. [Courses Admin](#7-courses-admin)
8. [Blog Admin](#8-blog-admin)
9. [Media Upload](#9-media-upload)
10. [API Reference](#10-api-reference)
11. [Database Reference](#11-database-reference)
12. [Deployment & Maintenance](#12-deployment--maintenance)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Quick Access

| Item | Value |
|------|-------|
| Admin URL | https://primaiinstitute.com/admin/login |
| Default email | `admin@primaiinstitute.com` |
| Default password | `Admin@123` |
| JWT session | 8 hours (auto-expires) |
| API base | `https://primaiinstitute.com/api` |
| Swagger docs | `http://localhost:3001/api/docs` (local dev only) |

---

## 2. Authentication

### How it works

Login sets an **httpOnly cookie** named `admin_token` (JWT). Every subsequent admin request reads this cookie automatically - no manual token handling needed in the browser.

```
POST /api/auth/login
Body: { "email": "...", "password": "..." }
Response: { "admin": { "id": "...", "email": "...", "name": "..." } }
Cookie set: admin_token (httpOnly, Secure, SameSite=None, 8h TTL)
```

### Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Login - sets cookie |
| POST | `/api/auth/logout` | Logout - clears cookie |
| GET | `/api/auth/me` | Verify session + get admin info |

### Security

- 5 login attempts allowed per 15 minutes per IP (brute-force protection)
- Password is hashed with bcrypt (cost factor 10)
- Cookie is `HttpOnly` - not accessible to JavaScript (XSS-safe)
- Cookie is `Secure; SameSite=None` on HTTPS - required for cross-context requests

### Change admin password

SSH into the server and run:

```bash
cd /var/www/primai/backend
node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('NewPassword@123', 10).then(h => console.log(h));
"
```

Then update the hash in the DB:

```sql
psql -U jadeja primai_db
UPDATE admins SET "passwordHash" = '<hash>' WHERE email = 'admin@primaiinstitute.com';
```

---

## 3. Dashboard

URL: `/admin/dashboard`

Displays a real-time snapshot of all lead activity.

### Stats cards

| Stat | Description |
|------|-------------|
| Total Leads | Combined count of bookings + enquiries |
| New Leads | Leads with status = `NEW` |
| This Week | Leads created in the last 7 days |
| Converted | Leads with status = `CONVERTED` |
| Bookings | Total demo booking count |
| Enquiries | Total course enquiry count |

### Recent Leads table

Shows the last 10 leads combined from both tables, sorted by `createdAt` descending. Clicking a row navigates to the respective Bookings or Enquiries page.

---

## 4. Bookings

URL: `/admin/bookings`

Demo booking requests submitted via the "Book Free Demo" form on the public site.

### Lead fields

| Field | Type | Description |
|-------|------|-------------|
| Name | string | Full name (2–50 chars) |
| Phone | string | 10-digit Indian mobile |
| Profile | enum | School Student / College Student / Working Professional / Business Owner / Other |
| Course Interest | enum | Level 1 Foundation / Level 2A Generalist / Level 2B Developer / Not Sure |
| Status | enum | NEW → CONTACTED → CONVERTED / LOST |
| Notes | string | Internal notes added by admin |
| Created At | datetime | Submission timestamp |

### Status workflow

```
NEW  →  CONTACTED  →  CONVERTED
                   →  LOST
```

Update status + add a note by clicking any row in the table.

### Search & filter

- **Search:** matches name or phone number (partial match)
- **Filter:** filter by status (NEW / CONTACTED / CONVERTED / LOST)
- **Pagination:** 20 records per page by default

### CSV export

Click **Export CSV** to download all bookings as a spreadsheet. Columns: ID, Name, Phone, Profile, Course Interest, Status, Notes, Created At.

### Rate limiting

Public form is throttled to **5 submissions per hour per IP** to prevent spam.

---

## 5. Enquiries

URL: `/admin/enquiries`

Course enquiries submitted via the Contact page form. Same workflow as Bookings.

### Extra fields vs Bookings

| Field | Type | Description |
|-------|------|-------------|
| Email | string (optional) | Contact email |
| Message | string | Enquiry message (10–500 chars) |

All other fields, status workflow, search/filter, CSV export, and rate limiting are identical to Bookings.

---

## 6. Settings

URL: `/admin/settings`

All site content is controlled from Settings. Changes take effect **immediately** on the public site - no deployment needed.

### How it works

- Settings are stored as key/value pairs in the `site_settings` DB table
- The public API (`GET /api/settings/public`) returns ~122 curated keys
- The frontend fetches them once on page load and updates all dynamic content
- Toggling a visibility setting (`true`/`false`) shows/hides sections in real time

### Settings sections

#### Navigation (`nav_*`)

| Key | Default | What it controls |
|-----|---------|-----------------|
| `nav_logo_text` | PRIM AI | Logo text in navbar |
| `nav_cta_text` | Book Free Demo | Navbar CTA button label |
| `nav_link_home` | Home | Home link label |
| `nav_link_about` | About | About link label |
| `nav_link_courses` | Courses | Courses link label |
| `nav_link_contact` | Contact | Contact link label |

#### Hero Section (`hero_*`)

| Key | Default | What it controls |
|-----|---------|-----------------|
| `hero_badge_text` | India's AI-First Training Institute | Badge above heading |
| `hero_heading_line1` | The Future Runs on AI. | Heading line 1 |
| `hero_heading_cyan` | Are | Cyan gradient word |
| `hero_heading_white` | You | White word |
| `hero_heading_orange` | Ready? | Orange gradient word |
| `hero_subtext` | *(long text)* | Subtitle paragraph |
| `hero_cta1_text` | Book Your Free Demo Class | Primary CTA |
| `hero_cta2_text` | Explore Courses | Secondary CTA |
| `hero_students_count` | 5000+ | Stats counter |
| `hero_students_label` | Students | Stats label |
| `hero_companies_count` | 350+ | Stats counter |
| `hero_companies_label` | Companies | Stats label |
| `hero_years_count` | 10+ | Stats counter |
| `hero_years_label` | Years | Stats label |
| `hero_iso_show` | `true` | Show/hide ISO badge |
| `new_batch_banner` | `true` | Show/hide top announcement banner |
| `new_batch_text` | New Batch Starting Soon... | Banner text |

#### About Page (`about_*`)

| Key | What it controls |
|-----|-----------------|
| `about_badge_text` | Section tag above heading |
| `about_hero_h1` | Hero heading (main part) |
| `about_hero_h1_accent` | Hero heading (accent/gradient part) |
| `about_hero_subtext` | Hero subtitle |
| `about_stat1_count` / `_label` | Stat 1 (Years Exp) |
| `about_stat2_count` / `_label` | Stat 2 (Students) |
| `about_stat3_count` / `_label` | Stat 3 (Companies) |
| `about_show_iso` | Show/hide ISO badge (`true`/`false`) |
| `about_show_quote` | Show/hide inspiration quote section |
| `about_quote_main` | Quote main text |
| `about_quote_accent` | Quote accent/highlight text |
| `about_show_diff` | Show/hide differentiators section |
| `about_diff1_icon` … `about_diff4_icon` | Differentiator emoji icon |
| `about_diff1_title` … `about_diff4_title` | Differentiator heading |
| `about_diff1_body` … `about_diff4_body` | Differentiator description |
| `about_show_trainers` | Show/hide trainers section |
| `about_trainer1_name` / `_role` / `_exp` / `_img` | Trainer 1 card |
| `about_trainer2_*` | Trainer 2 card |
| `about_trainer3_*` | Trainer 3 card |
| `about_show_cta` | Show/hide bottom CTA section |
| `about_cta_heading` | CTA section heading |
| `about_cta_subtext` | CTA section subtitle |
| `about_cta_btn1_text` | CTA primary button label |
| `about_cta_btn2_text` | CTA secondary button label |

#### Contact Page (`contact_*`)

| Key | What it controls |
|-----|-----------------|
| `contact_badge` | Badge label |
| `contact_heading` | Page heading |
| `contact_subtext` | Subtitle paragraph |
| `contact_address` | Office address |
| `contact_phone` | Phone number (displayed) |
| `contact_email` | Email address (displayed) |
| `contact_hours` | Office hours text |
| `contact_form_title` | Enquiry form heading |
| `contact_show_whatsapp` | Show/hide WhatsApp quick link |
| `contact_whatsapp_number` | WhatsApp number (with country code, no `+`) |
| `contact_whatsapp_message` | Pre-filled WhatsApp message |
| `contact_show_map` | Show/hide Google Maps embed |
| `contact_map_embed_url` | Google Maps iframe `src` URL |
| `contact_map_link_url` | "Open in Google Maps" link |
| `contact_show_faq` | Show/hide FAQ section |
| `contact_faq_title` | FAQ section heading |
| `contact_faqs` | FAQ data (JSON string) |

#### Footer (`footer_*`)

**Visibility toggles** - set `true` to show, `false` to hide:

| Key | Controls |
|-----|---------|
| `footer_cta_show` | Top CTA strip (Book Free Demo banner) |
| `footer_stats_show` | Stats row (students/partners/etc.) |
| `footer_iso_show` | ISO 9001:2015 Certified badge |
| `footer_quicklinks_show` | Quick Links column |
| `footer_courses_show` | Our Courses column |
| `footer_explore_more_show` | Explore More column |
| `footer_contact_show` | Get In Touch column |
| `footer_social_show` | Social media icons |
| `footer_wa_float_show` | WhatsApp floating button |

**Content keys:**

| Key | What it controls |
|-----|-----------------|
| `footer_cta_heading` | CTA strip heading |
| `footer_cta_subtext` | CTA strip subtitle |
| `footer_cta_demo_btn_text` | Demo button label |
| `footer_cta_wa_btn_text` | WhatsApp button label |
| `footer_stat_1_num` … `footer_stat_5_num` | Stats numbers |
| `footer_stat_1_label` … `footer_stat_5_label` | Stats labels |
| `footer_desc` | Brand description paragraph |
| `footer_address` | Address in contact column |
| `footer_phone` | Phone in contact column |
| `footer_email` | Email in contact column |
| `footer_hours` | Hours in contact column |
| `footer_social_whatsapp` | WhatsApp URL |
| `footer_social_linkedin` | LinkedIn URL |
| `footer_social_instagram` | Instagram URL |
| `footer_social_youtube` | YouTube URL |
| `footer_wa_float_number` | Floating WhatsApp number (country code + number) |
| `footer_privacy_url` | Privacy Policy link (e.g. `/privacy`) |
| `footer_terms_url` | Terms link (e.g. `/terms`) |
| `footer_refund_url` | Refund Policy link (e.g. `/refund-policy`) |
| `footer_sitemap_url` | Sitemap link |
| `footer_franchise_url` | Franchise enquiry link |

---

## 7. Courses Admin

URL: `/admin/courses`

Manage course content for all three AI programs. Changes are **immediately live** on the public site.

### Course slugs

| Slug | Level | Public URL |
|------|-------|-----------|
| `l1` | L1_FOUNDATION | `/courses/l1` |
| `l2a` | L2A_GENERALIST | `/courses/l2a` |
| `l2b` | L2B_DEVELOPER | `/courses/l2b` |

### Editable sections per course

| Section | API endpoint suffix | What it controls |
|---------|-------------------|-----------------|
| **Hero** | `PATCH /admin/courses/:slug` | Badge, title, tagline, duration, mode, CTA buttons, hero image |
| **Who Is This For** | `PATCH /admin/courses/:slug/who-items` | Cards showing target audience |
| **Curriculum Modules** | `PATCH /admin/courses/:slug/modules` | Week-by-week module list with topics |
| **Tools Taught** | `PATCH /admin/courses/:slug/tools` | AI tools grid (emoji, name, category) |
| **Learning Outcomes** | `PATCH /admin/courses/:slug/outcomes` | What students achieve |
| **Before / After** | `PATCH /admin/courses/:slug/before-after` | Transformation comparison |
| **Eligibility** | `PATCH /admin/courses/:slug/eligibility` | Who can enroll |
| **FAQs** | `PATCH /admin/courses/:slug/faqs` | Frequently asked questions |
| **Testimonials** | `PATCH /admin/courses/:slug/testimonials` | Student success stories |

### Courses Listing Page

The `/courses` listing page has its own editable content:

| Endpoint | What it controls |
|----------|-----------------|
| `PATCH /admin/courses/listing-page` | Hero heading, subtitle, CTA text |
| `PATCH /admin/courses/listing-page/who-cards` | "Who is this for" cards on listing page |

### Hero field reference

```json
{
  "title": "AI Foundation Program",
  "tagline": "Your first step into the world of Artificial Intelligence",
  "badgeText": "Level 1 · AI Foundation",
  "duration": "8 Weeks",
  "mentorship": "1-to-1 Personal",
  "trainingDays": "Monday to Friday",
  "language": "English + Gujarati",
  "mode": "Online + Offline",
  "certificate": "ISO Certified",
  "placementInfo": "100% Placement Support",
  "levelLabel": "Foundation Level",
  "ctaDemoText": "Book Free Demo ➞",
  "ctaWaText": "💬 Chat on WhatsApp",
  "ctaDownloadText": "Download Syllabus",
  "heroImageUrl": "https://primaiinstitute.com/uploads/..."
}
```

### Module structure

```json
{
  "items": [
    { "label": "Week 1", "title": "AI Fundamentals", "topics": ["What is AI", "ML basics"], "order": 0 },
    { "label": "Week 2", "title": "Python for AI", "topics": ["Syntax", "Libraries"], "order": 1 }
  ]
}
```

### Testimonial structure

```json
{
  "items": [
    {
      "initials": "RJ",
      "name": "Raj Joshi",
      "meta": "Data Analyst, TCS",
      "avatarGrad": "from-blue-500 to-purple-500",
      "quote": "This course transformed my career completely.",
      "before": "No AI knowledge",
      "after": "Placed at ₹12 LPA",
      "order": 0
    }
  ]
}
```

---

## 8. Blog Admin

URL: `/admin/blog`

Full blog management with categories, tags, authors, and rich-text post editor.

### Blog workflow

```
Create Author → Create Category → Create Tags → Write Post (DRAFT) → Publish
```

### Categories

- Has `name`, `slug`, and optional `color` (hex code, default `#00D4FF`)
- Slug must be URL-safe (e.g. `ai-technology`)
- Delete only works if no posts are using the category

### Tags

- Has `name` and `slug`
- Multiple tags can be assigned to one post

### Authors

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Author's full name |
| `designation` | No | Job title / role |
| `bio` | No | Short bio (max 500 chars) |
| `avatarUrl` | No | Profile image URL (use Media Upload to get URL first) |

> **Note:** Authors have no `slug` field - do not send one.

### Blog posts

| Field | Required | Constraints |
|-------|----------|-------------|
| `title` | Yes | 5–200 chars |
| `slug` | Yes | URL-safe, unique (e.g. `intro-to-machine-learning`) |
| `excerpt` | Yes | 10–500 chars, shown in listing cards |
| `content` | Yes | HTML string (rich text editor output) |
| `status` | Yes | `DRAFT` or `PUBLISHED` |
| `categoryId` | Yes | ID from categories list |
| `authorId` | Yes | ID from authors list |
| `tagIds` | Yes | Array of tag IDs (can be empty `[]`) |
| `coverImageUrl` | No | URL from Media Upload |
| `publishedAt` | No | ISO date string (defaults to now when publishing) |
| `showAuthor` | No | `true` to show author byline (default `true`) |

### Status lifecycle

- **DRAFT** - only visible in admin panel, not on public `/blog`
- **PUBLISHED** - immediately visible at `primaiinstitute.com/blog/:slug`

### Blog API response structure

```json
{
  "posts": [...],
  "total": 5,
  "page": 1,
  "limit": 9
}
```

> The response uses `posts` (not `data`) as the array key.

---

## 9. Media Upload

Endpoint: `POST /api/admin/media/upload`

All images in the blog editor and course hero are managed through the media upload API. Uploaded images are automatically converted to WebP for performance.

### Usage

```
POST /api/admin/media/upload?variant=content
Content-Type: multipart/form-data
Body: form field "file" = image file
Authorization: Bearer <token>  (or cookie)
```

### Variants

| Variant | Max size | Resize |
|---------|----------|--------|
| `cover` | 8 MB | 1600×900 crop |
| `content` | 8 MB | 1200px wide, proportional |
| `avatar` | 8 MB | 200×200 crop |

### Accepted formats

`image/jpeg`, `image/png`, `image/webp`, `image/gif`

### Response

```json
{
  "url": "https://primaiinstitute.com/uploads/blog/content/1781885126-filename.webp",
  "originalSizeKb": 245,
  "convertedSizeKb": 38,
  "width": 1200,
  "height": 800
}
```

Copy the `url` value and paste it into the blog post `coverImageUrl` or course `heroImageUrl` field.

### Storage location

Files are stored at `/var/www/primai/uploads/` on the server and served by Nginx at `https://primaiinstitute.com/uploads/*`. They persist through backend restarts.

> When DigitalOcean Spaces is configured (DO_SPACES_* env vars), files are uploaded to S3-compatible cloud storage instead.

---

## 10. API Reference

### Authentication

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/login` | - | Login, sets cookie |
| POST | `/api/auth/logout` | - | Logout, clears cookie |
| GET | `/api/auth/me` | JWT | Verify session |

### Public

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/bookings` | - | Submit demo booking |
| POST | `/api/enquiries` | - | Submit course enquiry |
| GET | `/api/settings/public` | - | All public site settings |
| GET | `/api/courses` | - | List all courses |
| GET | `/api/courses/listing-page` | - | Courses listing page data |
| GET | `/api/courses/:slug` | - | Single course (`l1`, `l2a`, `l2b`) |
| GET | `/api/blog` | - | Published posts (paginated) |
| GET | `/api/blog/:slug` | - | Single published post |
| GET | `/api/blog/categories` | - | All categories |
| GET | `/api/blog/tags` | - | All tags |
| GET | `/api/blog/authors` | - | All authors |

### Admin - Bookings

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/bookings` | List (`?page=1&limit=20&search=&status=NEW`) |
| GET | `/api/admin/bookings/:id` | Single booking |
| PATCH | `/api/admin/bookings/:id` | Update status + notes |
| DELETE | `/api/admin/bookings/:id` | Delete booking |
| GET | `/api/admin/bookings/export` | CSV download |

### Admin - Enquiries

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/enquiries` | List (`?page=1&limit=20&search=&status=`) |
| GET | `/api/admin/enquiries/:id` | Single enquiry |
| PATCH | `/api/admin/enquiries/:id` | Update status + notes |
| DELETE | `/api/admin/enquiries/:id` | Delete enquiry |
| GET | `/api/admin/enquiries/export` | CSV download |

### Admin - Dashboard

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/stats` | Lead counts by status |
| GET | `/api/admin/recent-leads` | Combined recent leads (`?limit=10`) |

### Admin - Settings

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/settings` | All 124 settings (key/value map) |
| PATCH | `/api/settings/:key` | Update one setting: `{ "value": "..." }` |

### Admin - Courses

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/courses/listing-page` | Listing page data |
| PATCH | `/api/admin/courses/listing-page` | Update listing page |
| PATCH | `/api/admin/courses/listing-page/who-cards` | Replace who-cards |
| GET | `/api/admin/courses/:slug` | Get course (`l1`, `l2a`, `l2b`) |
| PATCH | `/api/admin/courses/:slug` | Update hero fields |
| PATCH | `/api/admin/courses/:slug/who-items` | Replace who-items |
| PATCH | `/api/admin/courses/:slug/modules` | Replace modules |
| PATCH | `/api/admin/courses/:slug/tools` | Replace tools |
| PATCH | `/api/admin/courses/:slug/outcomes` | Replace outcomes |
| PATCH | `/api/admin/courses/:slug/before-after` | Update before/after |
| PATCH | `/api/admin/courses/:slug/eligibility` | Replace eligibility items |
| PATCH | `/api/admin/courses/:slug/faqs` | Replace FAQs |
| PATCH | `/api/admin/courses/:slug/testimonials` | Replace testimonials |

> All `PATCH` endpoints for course arrays **replace the entire array** - always send the complete list, not just the changed items.

### Admin - Blog

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/blog` | List all posts (`?page=1&limit=20&status=DRAFT`) |
| POST | `/api/admin/blog` | Create post |
| GET | `/api/admin/blog/:id` | Get single post |
| PATCH | `/api/admin/blog/:id` | Update post |
| DELETE | `/api/admin/blog/:id` | Delete post |
| GET | `/api/admin/blog/categories` | List categories |
| POST | `/api/admin/blog/categories` | Create category |
| DELETE | `/api/admin/blog/categories/:id` | Delete category |
| GET | `/api/admin/blog/tags` | List tags |
| POST | `/api/admin/blog/tags` | Create tag |
| DELETE | `/api/admin/blog/tags/:id` | Delete tag |
| GET | `/api/admin/blog/authors` | List authors |
| POST | `/api/admin/blog/authors` | Create author |
| PATCH | `/api/admin/blog/authors/:id` | Update author |
| DELETE | `/api/admin/blog/authors/:id` | Delete author |

### Admin - Media

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/admin/media/upload?variant=content` | Upload image → WebP |

---

## 11. Database Reference

**Connection (production):** See `/var/www/primai/backend/.env` → `DATABASE_URL`  
**Connection (local dev):** `postgresql://jadeja@localhost:5432/primai_db`

### Tables

| Table | Model | Purpose |
|-------|-------|---------|
| `demo_bookings` | DemoBooking | Free demo session leads |
| `enquiries` | Enquiry | General course enquiry leads |
| `admins` | Admin | Admin accounts (bcrypt hashed) |
| `site_settings` | SiteSetting | All editable site content (124 keys) |
| `blog_posts` | BlogPost | Blog articles |
| `blog_categories` | BlogCategory | Post categories |
| `blog_tags` | BlogTag | Post tags (many-to-many) |
| `blog_post_tags` | BlogPostTag | Join table (post ↔ tag) |
| `blog_authors` | BlogAuthor | Post authors |
| `courses` | AiCourse | Course hero + metadata |
| `course_modules` | CourseModule | Curriculum modules per course |
| `course_tools` | CourseTool | Tools taught per course |
| `course_outcomes` | CourseOutcome | Learning outcomes |
| `course_who_items` | CourseWhoItem | Target audience cards |
| `course_before_after` | CourseBeforeAfter | Transformation comparison |
| `course_eligibility_items` | CourseEligibilityItem | Eligibility criteria |
| `course_faqs` | CourseFAQ | FAQs per course |
| `course_testimonials` | CourseTestimonial | Student testimonials |
| `courses_listing_page` | CoursesListingPage | Singleton listing page content |
| `courses_listing_who_cards` | CoursesListingWhoCard | Who-cards on listing page |

### Enums

```
Profile:      SCHOOL_STUDENT | COLLEGE_STUDENT | WORKING_PROFESSIONAL | BUSINESS_OWNER | OTHER
Course:       LEVEL_1_FOUNDATION | LEVEL_2A_GENERALIST | LEVEL_2B_DEVELOPER | NOT_SURE
LeadStatus:   NEW | CONTACTED | CONVERTED | LOST
BlogStatus:   DRAFT | PUBLISHED
CourseLevel:  L1_FOUNDATION | L2A_GENERALIST | L2B_DEVELOPER
```

### Re-seed defaults

If settings are accidentally deleted or you need to restore defaults:

```bash
cd /var/www/primai/backend
npm run prisma:seed
```

The seed uses `upsert` - it creates missing rows but **never overwrites** existing values.

---

## 12. Deployment & Maintenance

### Stack overview

```
Internet → Cloudflare DNS → DigitalOcean (64.227.143.243)
                                    ↓
                              Nginx (443/80)
                             /api/* → PM2/NestJS (port 3001)
                             /uploads/* → /var/www/primai/uploads/
                             /* → /var/www/primai/frontend/dist/ (SPA)
```

### Server paths

```
/var/www/primai/
├── backend/          NestJS source + dist/
│   └── .env          Production environment variables
├── frontend/
│   ├── src/          React source
│   └── dist/         Built static files (served by Nginx)
└── uploads/          User-uploaded images (served at /uploads/*)
```

### PM2 process management

```bash
pm2 status                    # check backend status
pm2 restart primai-backend    # restart backend
pm2 logs primai-backend       # tail logs
pm2 logs primai-backend --err # errors only
```

### Deploy backend update

```bash
cd /var/www/primai
git pull origin main
cd backend
npm install
npm run build
pm2 restart primai-backend
```

### Deploy frontend update

```bash
cd /var/www/primai/frontend
git pull origin main          # or edit files directly
npm install
npm run build                 # outputs to dist/
# No nginx restart needed - static files updated automatically
```

### Environment variables (backend)

File: `/var/www/primai/backend/.env`

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret (keep long + random) |
| `JWT_EXPIRES_IN` | Token TTL (default `7d`) |
| `PORT` | NestJS port (default `3001`) |
| `NODE_ENV` | `production` |
| `HTTPS_ENABLED` | `true` (enables Secure cookies + HSTS) |
| `FRONTEND_URL` | `https://primaiinstitute.com` |
| `PUBLIC_URL` | `https://primaiinstitute.com` (for upload URLs) |
| `ADDITIONAL_ORIGINS` | Extra CORS origins (comma-separated) |
| `MSG91_AUTH_KEY` | MSG91 API key for WhatsApp notifications |
| `ADMIN_WHATSAPP` | Admin WhatsApp number for alerts |
| `ADMIN_EMAIL` | Admin email for alerts |
| `DO_SPACES_KEY` | DigitalOcean Spaces access key (optional) |
| `DO_SPACES_SECRET` | DigitalOcean Spaces secret (optional) |
| `DO_SPACES_ENDPOINT` | Spaces endpoint URL (optional) |
| `DO_SPACES_BUCKET` | Spaces bucket name (optional) |
| `DO_SPACES_CDN_URL` | CDN base URL (optional) |
| `UPLOAD_DIR` | Local upload path (default `/var/www/primai/uploads`) |

### SSL certificate renewal (Let's Encrypt)

Certbot auto-renews. To manually renew:

```bash
certbot renew
nginx -t && systemctl reload nginx
```

### Nginx config path

```
/etc/nginx/sites-available/primai
/etc/nginx/sites-enabled/primai  (symlink)
```

---

## 13. Troubleshooting

### Admin panel bounces back to login after entering credentials

**Cause:** The auth cookie has `Secure` flag but the site is being accessed over HTTP (not HTTPS).  
**Fix:** Always access via `https://primaiinstitute.com/admin`. Ensure `HTTPS_ENABLED=true` in `.env` and PM2 is restarted after change.

---

### Settings saved in admin but don't update on public site

**Cause:** The frontend's public settings fetch was failing silently.  
**Root cause (fixed):** `??` instead of `||` in `frontend/src/api/settings.ts` caused an empty `VITE_API_URL` to be used as-is, routing to `/settings/public` instead of `/api/settings/public`.  
**Status:** Fixed and deployed (June 2026). Frontend rebuilt with `||` operator baked in.

If this recurs after a redeploy:
1. Verify `GET /api/settings/public` returns correct values via curl
2. Verify the built bundle contains `j_="/api"` (not `j_=""`)
3. Rebuild frontend: `cd /var/www/primai/frontend && npm run build`

---

### Backend returns 401 Unauthorized

1. Check the session cookie is set: in DevTools → Application → Cookies → `admin_token` should exist
2. JWT expires after 8 hours - log out and log in again
3. If `JWT_SECRET` changed in `.env`, all existing tokens are invalid - log in again

---

### Media upload fails with "Unsupported file type"

Only `jpg`, `png`, `webp`, and `gif` are accepted. Convert other formats before uploading.

---

### Media upload succeeds but image not accessible

1. Check file exists: `ls /var/www/primai/uploads/blog/content/`
2. Check Nginx `/uploads/` location is configured
3. Check file permissions: `chmod 644 /var/www/primai/uploads/blog/content/*.webp`

---

### Backend process keeps crashing (PM2)

```bash
pm2 logs primai-backend --err --lines 50   # check error logs
```

Common causes:
- `DATABASE_URL` env var not loaded → ensure `.env` exists at `/var/www/primai/backend/.env`
- PostgreSQL service not running → `systemctl status postgresql`
- Port 3001 already in use → `lsof -i :3001`

---

### Database locked / migration needed

```bash
cd /var/www/primai/backend
npx prisma migrate deploy    # run pending migrations
npx prisma db seed           # restore default settings (safe - won't overwrite)
```

---

### WhatsApp notifications not sending

1. Ensure `MSG91_AUTH_KEY` is set in `.env`
2. Ensure `ADMIN_WHATSAPP` is set (format: `91XXXXXXXXXX`)
3. In development (`NODE_ENV=development`), notifications only log to console - they never hit MSG91
4. In production, check PM2 logs for MSG91 API errors

---

### Rate limit hit on public form

Public forms allow 5 submissions per hour per IP. If testing triggers this:

```bash
# Check PM2 logs to see throttle errors
pm2 logs primai-backend | grep "ThrottlerException"

# The limit resets automatically after 1 hour
# In dev: restart the backend to clear in-memory throttle state
pm2 restart primai-backend
```

---

*Last updated: June 2026 - Mouryrajsinh Jadeja / STAD Solution*
