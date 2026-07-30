# PRIM AI Institute - Claude Code Context

## Who & What
- **Project:** PRIM AI Institute - lead generation website + admin dashboard
- **Client:** STAD Solution, Ahmedabad, India
- **Developer:** Mouryrajsinh Jadeja
- **Goal:** Phase 1 = marketing site + demo booking + enquiry form + admin dashboard
- **Project root:** `/home/jadeja/Videos/Doc of STAD/Project Prime Ai/prim-ai-institute/`

---

## Tech Stack - LOCKED, DO NOT CHANGE

### Frontend (`/frontend`)
| Tool | Version |
|---|---|
| React | 19 |
| TypeScript | 5+ |
| Tailwind CSS | v4 |
| React Router | v6 |
| React Hook Form | v7 |
| Axios | latest |
| Zustand | v4 |
| Vite | 5 |

### Backend (`/backend`)
| Tool | Version |
|---|---|
| NestJS | 10 |
| TypeScript | 5+ |
| Prisma ORM | 5 |
| PostgreSQL | 16 (local) / Neon (prod) |
| JWT | @nestjs/jwt + passport-jwt |
| bcrypt | 5 |
| class-validator | 0.14 |
| class-transformer | 0.5 |
| @nestjs/config | 3 |

### Deployment
| Layer | Target |
|---|---|
| Frontend | Vercel |
| Backend | Railway or Dell T30 Ubuntu Server |
| Database | Neon PostgreSQL (cloud) / local PG16 (dev) |

---

## Local Dev Setup

### Database
- **Engine:** PostgreSQL 16 running on `localhost:5432`
- **DB name:** `primai_db`
- **User:** `jadeja` (superuser, no password needed locally)
- **Connection string:** `postgresql://jadeja@localhost:5432/primai_db`

### Run Backend
```bash
cd backend
npm install                          # first time only
npx prisma migrate dev --name init   # first time only
npx prisma db seed                   # first time only
npm run start:dev
# ➞ http://localhost:3001
# ➞ http://localhost:3001/api/docs  (Swagger)
```

### Run Frontend
```bash
cd frontend
npm install    # first time only
npm run dev
# ➞ http://localhost:5173
```

---

## Default Admin Credentials
| Field | Value |
|---|---|
| Email | admin@primaiinstitute.com |
| Password | Admin@123 |
| Name | PRIM AI Admin |

---

## Folder Structure

```
prim-ai-institute/
├── frontend/
│   ├── public/favicon.ico
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Courses.tsx
│   │   │   ├── Contact.tsx
│   │   │   └── admin/
│   │   │       ├── Login.tsx
│   │   │       ├── Dashboard.tsx
│   │   │       ├── Bookings.tsx
│   │   │       ├── Enquiries.tsx
│   │   │       └── Settings.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── shared/
│   │   │   │   ├── DemoModal.tsx
│   │   │   │   ├── SectionTag.tsx
│   │   │   │   └── GlassCard.tsx
│   │   │   └── admin/
│   │   │       ├── Sidebar.tsx
│   │   │       ├── LeadsTable.tsx
│   │   │       └── StatCard.tsx
│   │   ├── hooks/
│   │   │   ├── useModal.ts
│   │   │   └── useAuth.ts
│   │   ├── api/
│   │   │   ├── axios.ts
│   │   │   ├── bookings.ts
│   │   │   ├── enquiries.ts
│   │   │   └── admin.ts
│   │   ├── store/authStore.ts
│   │   ├── types/index.ts
│   │   ├── styles/globals.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── bookings/         ➞ demo booking CRUD + CSV export
│   │   ├── enquiries/        ➞ enquiry CRUD + CSV export
│   │   ├── auth/             ➞ JWT login (admin only)
│   │   ├── admin/            ➞ dashboard stats + recent leads
│   │   ├── notifications/    ➞ MSG91 WhatsApp + console fallback
│   │   ├── settings/         ➞ site-wide key/value settings
│   │   ├── prisma/           ➞ PrismaService (global)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── .env                  ➞ actual dev env (not committed)
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
├── CLAUDE.md    ← you are here
├── SKILL.md
├── PROJECT.md
└── README.md
```

---

## Prisma Schema Summary

### Enums
```prisma
enum Profile {
  SCHOOL_STUDENT | COLLEGE_STUDENT | WORKING_PROFESSIONAL | BUSINESS_OWNER | OTHER
}

enum Course {
  LEVEL_1_FOUNDATION | LEVEL_2A_GENERALIST | LEVEL_2B_DEVELOPER | NOT_SURE
}

enum LeadStatus {
  NEW | CONTACTED | CONVERTED | LOST
}
```

### Models
| Model | Table | Purpose |
|---|---|---|
| DemoBooking | demo_bookings | Free demo session bookings |
| Enquiry | enquiries | General course enquiries |
| Admin | admins | Admin accounts (bcrypt password) |
| SiteSetting | site_settings | Editable key/value content |

---

## API Routes

### Public (no auth needed)
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/bookings` | Submit demo booking |
| POST | `/api/enquiries` | Submit enquiry |
| GET | `/api/settings/public` | Hero stats + batch banner |

### Auth
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Login ➞ returns JWT |

### Admin (Bearer JWT required)
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/recent-leads` | Last N leads from both tables |
| GET | `/api/admin/bookings` | Paginated list (search, filter) |
| PATCH | `/api/admin/bookings/:id` | Update status/notes |
| DELETE | `/api/admin/bookings/:id` | Delete booking |
| GET | `/api/admin/bookings/export` | CSV download |
| GET | `/api/admin/enquiries` | Paginated list |
| PATCH | `/api/admin/enquiries/:id` | Update status/notes |
| DELETE | `/api/admin/enquiries/:id` | Delete enquiry |
| GET | `/api/admin/enquiries/export` | CSV download |
| GET | `/api/settings` | All settings |
| PATCH | `/api/settings/:key` | Update a setting |

---

## Frontend Routes

| Route | Component | Auth |
|---|---|---|
| `/` | Home.tsx | Public |
| `/about` | About.tsx | Public |
| `/courses` | Courses.tsx | Public |
| `/contact` | Contact.tsx | Public |
| `/admin/login` | admin/Login.tsx | Public |
| `/admin/dashboard` | admin/Dashboard.tsx | JWT required |
| `/admin/bookings` | admin/Bookings.tsx | JWT required |
| `/admin/enquiries` | admin/Enquiries.tsx | JWT required |
| `/admin/settings` | admin/Settings.tsx | JWT required |

Auth is controlled by `PrivateRoute` in `App.tsx` reading from Zustand `authStore`.

---

## Design System - NEVER BREAK

### CSS Variables (defined in `globals.css`)
```css
--navy:     #020818   /* page background - always */
--electric: #00D4FF   /* cyan accent, focus borders, section tags */
--orange:   #FF6B2B   /* primary CTA gradient start */
--orange2:  #FF9500   /* primary CTA gradient end */
--white:    #F0F4FF   /* body text */
--muted:    #8A9BC0   /* secondary text */
--card:     rgba(255,255,255,0.045)   /* glassmorphism fill */
--border:   rgba(255,255,255,0.09)    /* glassmorphism border */
--font-head: 'Space Grotesk', sans-serif
--font-body: 'Plus Jakarta Sans', sans-serif
```

### Utility Classes (use these, don't reinvent)
| Class | Use |
|---|---|
| `.glass-card` | All cards |
| `.glass-card-hover` | Add hover lift to glass-card |
| `.btn-primary` | Orange gradient pill button |
| `.btn-outline` | White bordered pill button |
| `.btn-electric` | Cyan bordered pill button |
| `.section-tag` | Cyan uppercase label above headings |
| `.gradient-text` | Cyan➞orange gradient text |

### Rules
1. Background is **always** `var(--navy)` - never white, never light grey
2. All cards use `.glass-card` - no solid dark boxes
3. CTAs use `.btn-primary` (orange) - never plain coloured divs
4. All inputs: dark bg + cyan focus via `globals.css` styles
5. Tailwind CSS only - no inline styles except `style={{ color: 'var(--xyz)' }}`
6. No UI libraries - no shadcn, no MUI, no Radix, no Headless UI
7. TypeScript strict - no `any` types
8. Mobile-first responsive always
9. Min touch target 44×44px on all buttons

---

## Validation Rules

```
Phone:   /^[6-9]\d{9}$/   ➞  "Enter valid 10-digit Indian mobile number"
Name:    minLength 2, maxLength 50
Message: minLength 10, maxLength 500
Email:   optional, valid format
Profile: must be Profile enum value
Course:  must be Course enum value
```

---

## Notification System

`NotificationsService` in `backend/src/notifications/`:
- In **development** (`NODE_ENV=development`) ➞ logs message to console (no MSG91 call)
- In **production** ➞ POSTs to MSG91 WhatsApp API using `MSG91_AUTH_KEY` env var
- Both `sendBookingAlert()` and `sendEnquiryAlert()` follow same pattern

---

## Environment Variables

### Backend `.env` (dev - already written)
```
DATABASE_URL="postgresql://jadeja@localhost:5432/primai_db"
JWT_SECRET="primai-dev-secret-change-in-production-use-long-random-string"
JWT_EXPIRES_IN="7d"
PORT="3001"
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
MSG91_AUTH_KEY=""
ADMIN_WHATSAPP="917573055577"
ADMIN_EMAIL="info@stadsolution.com"
```

### Frontend `.env` (dev)
```
VITE_API_URL=http://localhost:3001/api
```

---

## Backend Scripts
```bash
npm run start:dev       # dev server with hot reload
npm run build           # compile TypeScript
npm run start:prod      # run compiled dist/main.js
npm run prisma:migrate  # prisma migrate dev
npm run prisma:seed     # prisma db seed
npm run prisma:studio   # open Prisma Studio GUI
```

---

## Phase 2 Planned (not built yet)
- Full homepage: hero with scroll animations, stats counter, course cards, testimonials
- About page: team, mission, milestones
- Courses detail page: level breakdown, curriculum, pricing
- Email notifications via SMTP
- Blog / CMS section

---

## Key Conventions
- All backend route controllers use `@Controller()` with no base prefix except `/auth` and `/settings` - admin sub-routes are registered as `admin/bookings` directly
- Zustand auth store persisted under localStorage key `primai_admin_auth`
- Axios interceptor reads token from `primai_admin_auth.state.token`
- CSV export routes must come before `/:id` routes to avoid NestJS route shadowing
- `PrismaModule` is `@Global()` - never import it individually in other modules
