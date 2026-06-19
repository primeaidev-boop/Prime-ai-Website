# PRIM AI Institute — Security & Testing Reference

**Version:** 1.0  
**Date:** 2026-06-19  
**Author:** Mouryrajsinh Jadeja  
**Stack:** NestJS 10 · React 19 · PostgreSQL 16 (NeonDB) · Railway · Vercel

---

## Table of Contents

1. [Security Architecture Overview](#1-security-architecture-overview)
2. [Authentication & Session Management](#2-authentication--session-management)
3. [Rate Limiting & Abuse Prevention](#3-rate-limiting--abuse-prevention)
4. [HTTP Security Headers](#4-http-security-headers)
5. [Input Validation & Output Sanitization](#5-input-validation--output-sanitization)
6. [CORS Policy](#6-cors-policy)
7. [Secrets & Environment Variables](#7-secrets--environment-variables)
8. [Database Security](#8-database-security)
9. [Manual Security Tests](#9-manual-security-tests)
10. [Pre-Deployment Checklist](#10-pre-deployment-checklist)
11. [Incident Response](#11-incident-response)
12. [Known Limitations & Roadmap](#12-known-limitations--roadmap)

---

## 1. Security Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  Browser (Vercel CDN)                                               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  React SPA                                                   │   │
│  │  • CSP via vercel.json headers                               │   │
│  │  • X-Frame-Options: DENY                                     │   │
│  │  • DOMPurify sanitizes blog HTML before render               │   │
│  │  • Axios withCredentials:true — JWT never touches JS memory  │   │
│  └─────────────────────────┬────────────────────────────────────┘   │
└────────────────────────────│────────────────────────────────────────┘
                             │ HTTPS only · Cookie: admin_token (httpOnly)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Railway (NestJS API)                                               │
│                                                                     │
│  main.ts bootstrap layer                                            │
│  ├── helmet()          → security headers on every response         │
│  ├── cookieParser()    → reads httpOnly JWT cookie                  │
│  ├── enableCors()      → exact-match allowedOrigins whitelist       │
│  └── ValidationPipe    → strips unknown fields, rejects bad input   │
│                                                                     │
│  ThrottlerGuard (APP_GUARD — global)                                │
│  ├── All routes        → 100 req / 15 min / IP                     │
│  ├── POST /auth/login  → 5 req  / 15 min / IP                     │
│  ├── POST /bookings    → 5 req  / 1 hour  / IP                    │
│  └── POST /enquiries   → 5 req  / 1 hour  / IP                    │
│                                                                     │
│  JwtAuthGuard (Passport)                                            │
│  └── Extracts JWT from httpOnly cookie → validates → 401 if bad   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                             │ SSL required (sslmode=require)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  NeonDB (PostgreSQL 16)                                             │
│  • Prisma ORM — zero raw SQL in codebase                           │
│  • Parameterized queries only — SQL injection not possible          │
│  • TLS enforced on every connection                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Threat Model Summary

| Threat | Mitigation | Layer |
|---|---|---|
| XSS — steal admin token from localStorage | JWT in httpOnly cookie | Auth |
| XSS — inject scripts via form input | class-validator + React JSX escaping | Input/Render |
| XSS — inject scripts via blog content | DOMPurify on render | Render |
| Brute force login | 5 attempts / 15 min / IP | Rate limit |
| Contact form spam | 5 submissions / hour / IP | Rate limit |
| Clickjacking | X-Frame-Options: DENY (frontend) | Headers |
| MIME sniffing | X-Content-Type-Options: nosniff | Headers |
| MITM / downgrade | HSTS max-age=31536000 + preload | Headers |
| Cross-site request forgery | sameSite cookie + CORS exact-match | Auth/CORS |
| SQL injection | Prisma ORM parameterized queries | Database |
| Sensitive data in git history | .gitignore + confirmed clean history | Secrets |
| Unauthorized admin access | JWT guard on every admin route | Auth |
| CORS wildcard abuse | Exact-origin whitelist | CORS |

---

## 2. Authentication & Session Management

### Implementation

**File:** [backend/src/auth/auth.controller.ts](backend/src/auth/auth.controller.ts)  
**File:** [backend/src/auth/jwt.strategy.ts](backend/src/auth/jwt.strategy.ts)  
**File:** [frontend/src/api/axios.ts](frontend/src/api/axios.ts)

### Login Flow

```
POST /api/auth/login
  Body: { email, password }
  
  1. Validate email format + password presence (class-validator)
  2. Rate limit check: 5 attempts / 15 min / IP (ThrottlerGuard)
  3. Lookup admin by email in DB (Prisma)
  4. bcrypt.compare(password, admin.passwordHash)
  5. Sign JWT: { sub: admin.id, email } — expires in 8h
  6. Set cookie:
       Set-Cookie: admin_token=<jwt>; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=28800
  7. Return: { admin: { id, email, name } }  ← NO TOKEN in body
```

### Cookie Attributes Explained

| Attribute | Value | Why |
|---|---|---|
| `HttpOnly` | true | JavaScript cannot read it — blocks XSS token theft |
| `Secure` | true (prod) | Only sent over HTTPS — blocks plaintext sniffing |
| `SameSite` | `None` (prod) / `Lax` (dev) | `None` required for cross-origin Vercel→Railway requests; `Lax` is safe in dev |
| `Max-Age` | 28800 (8h) | Short-lived session; admin must re-login daily |
| `Path` | `/` | Cookie sent on all API requests |

> **Why not `SameSite=Strict`?**  
> The frontend is on `*.vercel.app` and the API is on `*.railway.app` — different origins. `Strict` and `Lax` both block cross-origin cookie sending. `None` is the only option for cross-origin cookies, and it **requires** `Secure=true`, which we enforce in production.

### Token Extraction (JwtStrategy)

```typescript
// Priority order:
// 1. httpOnly cookie (normal browser sessions)
// 2. Authorization: Bearer <token> (Swagger UI / curl testing only)
ExtractJwt.fromExtractors([
  (req) => req?.cookies?.admin_token ?? null,
  ExtractJwt.fromAuthHeaderAsBearerToken(),
])
```

### Logout Flow

```
POST /api/auth/logout
  1. res.clearCookie('admin_token', { path: '/' })
  2. Frontend: clear Zustand store → redirect to /admin/login
```

The cookie is cleared server-side. Even if the frontend fails (JS error, network issue), the server has already invalidated the client's ability to authenticate with that cookie.

### Zustand Auth Store

The store persists **only** `{ admin: { id, email, name }, isAuthenticated }` to localStorage — display-only information. The JWT itself is never written to `localStorage` or anywhere readable by JavaScript.

If `isAuthenticated=true` is manually set in DevTools but no valid cookie exists, every protected API call returns 401, and the Axios interceptor redirects to `/admin/login`. The frontend UI is a hint; the cookie is the gate.

### Admin Password Management

- Passwords stored as **bcrypt hashes** (cost factor 12) in the `admins` table
- Password is never logged, returned in any API response, or stored in plaintext anywhere
- To change the admin password, generate a new hash and update directly via Prisma Studio or a migration:
  ```bash
  node -e "const b=require('bcrypt'); b.hash('NewPassword123!', 12).then(console.log)"
  ```

---

## 3. Rate Limiting & Abuse Prevention

**File:** [backend/src/app.module.ts](backend/src/app.module.ts)  
**Package:** `@nestjs/throttler@6` (in-memory store, per-IP tracking)

### Limits

| Route | Window | Max Requests | Trigger |
|---|---|---|---|
| All routes (global) | 15 minutes | 100 | DDoS / scraping |
| `POST /api/auth/login` | 15 minutes | 5 | Brute force |
| `POST /api/bookings` | 1 hour | 5 | Form spam |
| `POST /api/enquiries` | 1 hour | 5 | Form spam |

When a limit is exceeded, the API returns:

```
HTTP 429 Too Many Requests
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: <epoch>
```

### Architecture Notes

- `ThrottlerGuard` is registered as `APP_GUARD` — it fires **before** any controller code
- Route-level `@Throttle({ default: { ttl, limit } })` overrides the global config for that specific endpoint
- The throttler `name: 'default'` must match the key used in `@Throttle({ default: {...} })` — mismatched names silently fall through to global limits
- Storage is **in-memory** (per Railway instance). If you scale to multiple instances in future, switch to `ThrottlerStorageRedisService` with a shared Redis store

### Why These Numbers

- **Login 5/15min:** NIST SP 800-63B recommends lockout after no more than 100 failed attempts, but for a single-admin system, 5 is aggressive and appropriate
- **Forms 5/hour:** A real human submitting multiple enquiries in an hour is unusual. Allows a small buffer for legitimate retries without opening the door to spam campaigns

---

## 4. HTTP Security Headers

### Backend (all API responses)

**File:** [backend/src/main.ts](backend/src/main.ts)  
**Package:** `helmet@8`

| Header | Value | Protects Against |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | HTTPS downgrade, MITM |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing attacks |
| `X-Frame-Options` | `SAMEORIGIN` | Clickjacking (API responses) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer leakage |
| `X-XSS-Protection` | `0` | Disables legacy XSS auditor (correct — modern browsers don't use it and it can cause issues) |
| `Content-Security-Policy` | See below | Script injection |

**Backend CSP:**
```
default-src 'self'
script-src 'self'
style-src 'self' 'unsafe-inline'
img-src 'self' data: https:
connect-src 'self'
font-src 'self' https://fonts.gstatic.com
object-src 'none'
frame-src 'self' https://www.google.com
```

### Frontend (Vercel CDN — all page responses)

**File:** [frontend/vercel.json](frontend/vercel.json)

| Header | Value | Protects Against |
|---|---|---|
| `X-Frame-Options` | `DENY` | Clickjacking (stricter than API — pages must never be framed) |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Browser feature abuse |
| `Content-Security-Policy` | See below | XSS, data exfiltration |

**Frontend CSP:**
```
default-src 'self'
script-src 'self'
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
font-src 'self' https://fonts.gstatic.com
img-src 'self' data: https:
connect-src 'self' https://prime-ai-website-production.up.railway.app
frame-src 'self' https://www.google.com
object-src 'none'
```

> **Note on `style-src 'unsafe-inline'`:** Required because Tailwind CSS v4 injects styles at runtime. If you migrate to a build-time CSS strategy, remove `'unsafe-inline'` and add a `style-src-attr 'none'` for maximum strictness.

---

## 5. Input Validation & Output Sanitization

### Backend Validation (all form endpoints)

**Files:** `backend/src/bookings/dto/`, `backend/src/enquiries/dto/`, `backend/src/blog/dto/`  
**Package:** `class-validator@0.14` + NestJS `ValidationPipe`

`ValidationPipe` is configured globally in `main.ts` with:
- `whitelist: true` — strips any fields not declared in the DTO
- `forbidNonWhitelisted: true` — returns 400 if unknown fields are sent
- `transform: true` — coerces types automatically

**Booking DTO rules:**

| Field | Validation |
|---|---|
| `name` | `@IsString` `@MinLength(2)` `@MaxLength(50)` |
| `phone` | `@Matches(/^[6-9]\d{9}$/)` — Indian mobile only |
| `profile` | `@IsEnum(Profile)` |
| `courseInterest` | `@IsEnum(Course)` |

**Enquiry DTO adds:**

| Field | Validation |
|---|---|
| `email` | `@IsOptional` `@IsEmail` |
| `message` | `@IsString` `@MinLength(10)` `@MaxLength(500)` |

Any request that fails validation is rejected with `HTTP 400` and a field-level error message. The data never reaches the service layer.

### Frontend Output Sanitization

**File:** [frontend/src/lib/sanitize.ts](frontend/src/lib/sanitize.ts)  
**Package:** `dompurify@3`

Blog post content is the only user-authored HTML in the system. Before rendering:

```typescript
// BlogPost.tsx
const processedContent = sanitizeHtml(injectIds(post.content));
// → <div dangerouslySetInnerHTML={{ __html: processedContent }} />
```

`sanitizeHtml` allows a strict allowlist:

```
Allowed tags: p br strong em u s h2 h3 ul ol li blockquote pre code a img hr
Allowed attrs: href target rel src alt style id
Style attr: only text-align: left|right|center|justify
```

Everything else is stripped. `<script>`, `<iframe>`, `onclick`, `javascript:` URIs — all removed before the string reaches the DOM.

All other admin-editable fields (site settings, course content, etc.) are **plain text** stored and rendered via React JSX, which escapes HTML automatically. No `dangerouslySetInnerHTML` is used outside of blog content and hardcoded legal page tables (static compile-time strings).

### XSS Risk Classification

| Location | Type | Risk | Mitigation |
|---|---|---|---|
| Blog post content | User HTML | High | DOMPurify allowlist |
| Settings (hero text, labels) | Plain text | None | React JSX escaping |
| Course content | Plain text | None | React JSX escaping |
| Legal pages table | Static HTML | None | Compile-time constant |
| Admin forms (name, phone) | Plain text | None | React JSX escaping |

---

## 6. CORS Policy

**File:** [backend/src/main.ts](backend/src/main.ts)

```typescript
const allowedOrigins = [
  'http://localhost:5173',   // Vite dev server
  'http://localhost:3000',   // Alternative dev port
  process.env.FRONTEND_URL, // Production Vercel URL (set in Railway env)
].filter(Boolean);

app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {  // exact match, not startsWith
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,   // required for httpOnly cookie
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**Why exact match matters:**  
The old code used `origin.startsWith(o)`, which would allow `https://yourdomain.evil.com` to pass if `https://yourdomain` was in the allowlist. Exact string comparison closes this gap.

**`credentials: true` requirement:**  
This header is mandatory for cross-origin cookie sending. Without it, the browser discards `Set-Cookie` on cross-origin responses. It also means the origin cannot be `*` — both the request and the allowed origin must be explicit.

**`!origin` allowance:**  
Requests with no `Origin` header (server-to-server, curl, Postman) are allowed. This is intentional for the public API and Swagger. The admin routes are still protected by JWT regardless of origin.

---

## 7. Secrets & Environment Variables

### Git History Audit (completed 2026-06-19)

```bash
# Confirmed: no .env files in git history
git log --all --oneline --full-history -- "backend/.env"
# Output: (empty — never committed)

# Confirmed: only public value ever committed to .env.production
git show f89307d:frontend/.env.production
# Output: VITE_API_URL=prime-ai-website-production.up.railway.app  (public)
```

### Secret Inventory

| Secret | Location | Committed? | Status |
|---|---|---|---|
| `DATABASE_URL` | Railway env var | No | Safe |
| `JWT_SECRET` | Railway env var | No | Safe — rotate to new value |
| `DO_SPACES_KEY` | `.env` only (local disk) | No | **Rotate immediately** |
| `DO_SPACES_SECRET` | `.env` only (local disk) | No | **Rotate immediately** |
| `MSG91_AUTH_KEY` | Railway env var | No | Safe |
| `SMTP_PASS` | Railway env var | No | Safe |

> **ACTION REQUIRED — DigitalOcean Spaces:**  
> The local `backend/.env` contains active DO Spaces credentials. While these were never committed to git, they exist in plaintext on disk. Log into the DigitalOcean dashboard → API → Spaces Keys and rotate `DO8014C98F4WWJBHNWEP` immediately. Update the new key in Railway.

### `.gitignore` Coverage

```gitignore
# Confirmed in root .gitignore — all patterns present:
.env
.env.local
.env.*.local
frontend/.env
frontend/.env.local
backend/.env
backend/.env.local
```

### Generating Secrets

```bash
# JWT_SECRET (64 hex chars = 256 bits of entropy)
openssl rand -hex 32

# Admin password hash (bcrypt cost 12)
node -e "const b=require('bcrypt'); b.hash('YourNewPassword!', 12).then(console.log)"
```

### Railway Environment Variables (required for production)

```
DATABASE_URL          = postgresql://...@...neon.tech/primai_db?sslmode=require
JWT_SECRET            = <64-char hex from openssl>
JWT_EXPIRES_IN        = 8h
PORT                  = 3001
NODE_ENV              = production
FRONTEND_URL          = https://your-app.vercel.app
MSG91_AUTH_KEY        = <from MSG91 dashboard>
MSG91_SENDER_ID       = PRIMAI
ADMIN_WHATSAPP        = 917573055191
ADMIN_EMAIL           = info@stadsolution.com
DO_SPACES_KEY         = <new rotated key>
DO_SPACES_SECRET      = <new rotated secret>
DO_SPACES_ENDPOINT    = https://sgp1.digitaloceanspaces.com
DO_SPACES_BUCKET      = jadeja-video
DO_SPACES_CDN_URL     = https://jadeja-video.sgp1.cdn.digitaloceanspaces.com
```

---

## 8. Database Security

**ORM:** Prisma 5  
**DB:** PostgreSQL 16 (NeonDB cloud)

### SQL Injection

There is **zero raw SQL** in the codebase. Confirmed by scanning for `$queryRaw`, `$executeRaw`, and string-concatenated SQL:

```bash
grep -rn "\$queryRaw\|\$executeRaw" backend/src/
# Output: (empty)
```

Prisma generates parameterized queries for every operation. Even complex filters like:

```typescript
where: {
  OR: [
    { name: { contains: search, mode: 'insensitive' } },
    { phone: { contains: search } },
  ],
}
```

…are compiled to `WHERE name ILIKE $1 OR phone LIKE $2` with bound parameters — never string concatenation.

### SSL / TLS

NeonDB requires TLS on all connections. The connection string format for production:

```
postgresql://USER:PASS@HOST.neon.tech/primai_db?sslmode=require
```

SSL is never disabled in the codebase — confirmed by scanning for `ssl.*false` and `rejectUnauthorized.*false` in application code (only found in type definition files from `node_modules`).

### Database Roles & Permissions

The NeonDB role used by the app should be a **limited role**, not the owner/superuser. To audit and configure:

```sql
-- Connect as superuser (neondb_owner)
-- Check current role permissions
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public';

-- Create a restricted app role (if not already done)
CREATE ROLE primai_app LOGIN PASSWORD 'strong-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO primai_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO primai_app;
-- Do NOT grant: DROP, TRUNCATE, CREATE, ALTER, SUPERUSER
```

> Update `DATABASE_URL` in Railway to use this limited role, not the owner connection string that NeonDB provides by default.

---

## 9. Manual Security Tests

Run these tests against your production URL after each deployment. Replace `API` with your Railway URL and `APP` with your Vercel URL.

```bash
API=https://prime-ai-website-production.up.railway.app
APP=https://your-app.vercel.app
```

### 9.1 Authentication Tests

```bash
# T01 — Admin route without token → must return 401
curl -s -o /dev/null -w "T01 (expect 401): %{http_code}\n" $API/api/admin/stats

# T02 — Admin route with invalid token → must return 401
curl -s -o /dev/null -w "T02 (expect 401): %{http_code}\n" \
  -H "Authorization: Bearer fake.jwt.token" $API/api/admin/stats

# T03 — Login with wrong credentials → 401, no hint about which field
curl -s -w "\nT03 (expect 401): %{http_code}\n" \
  -X POST $API/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"fake@test.com","password":"wrongpass"}'

# T04 — Login with correct credentials → 200, cookie set, NO token in body
curl -sv -X POST $API/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@primaiinstitute.com","password":"Admin@123"}' 2>&1 \
  | grep -E "< Set-Cookie|access_token"
# Expected: Set-Cookie: admin_token=...; HttpOnly; Secure; SameSite=None
# Expected: NO "access_token" in response body

# T05 — Logout clears cookie
curl -sv -X POST $API/api/auth/logout 2>&1 | grep "Set-Cookie"
# Expected: Set-Cookie: admin_token=; Max-Age=0  (cleared)
```

### 9.2 Rate Limiting Tests

```bash
# T06 — Brute force: 6th login attempt must return 429
for i in {1..6}; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST $API/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"x@x.com","password":"wrong"}')
  echo "T06 attempt $i: $CODE (expect 401×5, then 429)"
done

# T07 — Form spam: 6th booking in same hour must return 429
for i in {1..6}; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST $API/api/bookings \
    -H "Content-Type: application/json" \
    -d '{"name":"Test User","phone":"9876543210","profile":"OTHER","courseInterest":"NOT_SURE"}')
  echo "T07 attempt $i: $CODE (expect 201×5, then 429)"
done
```

### 9.3 Input Validation Tests

```bash
# T08 — Empty body → 400
curl -s -o /dev/null -w "T08 (expect 400): %{http_code}\n" \
  -X POST $API/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{}'

# T09 — Invalid phone number → 400
curl -s -w "\nT09 (expect 400): %{http_code}\n" \
  -X POST $API/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"1234567890","profile":"OTHER","courseInterest":"NOT_SURE"}'
# Expected error: "Enter valid 10-digit Indian mobile number"

# T10 — XSS attempt in name field (stored but escaped by React on render)
curl -s -w "\nT10 (expect 201 — stored as plain text): %{http_code}\n" \
  -X POST $API/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(1)<\/script>","phone":"9876543210","profile":"OTHER","courseInterest":"NOT_SURE"}'
# Note: React escapes this on render — <script> never executes

# T11 — Message too long (>500 chars) → 400
LONG=$(python3 -c "print('A'*501)")
curl -s -o /dev/null -w "T11 (expect 400): %{http_code}\n" \
  -X POST $API/api/enquiries \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\",\"phone\":\"9876543210\",\"profile\":\"OTHER\",\"courseInterest\":\"NOT_SURE\",\"message\":\"$LONG\"}"

# T12 — Unknown field in body is stripped (not 400 — just ignored)
curl -s -w "\nT12 (expect 201 — extra field stripped): %{http_code}\n" \
  -X POST $API/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"9876543210","profile":"OTHER","courseInterest":"NOT_SURE","isAdmin":true}'
```

### 9.4 CORS Tests

```bash
# T13 — Request from evil origin → no ACAO header (blocked)
ACAO=$(curl -s -I -H "Origin: https://evil.com" $API/api/settings/public \
  | grep -i "access-control-allow-origin")
echo "T13 — evil.com ACAO header (expect empty): '$ACAO'"

# T14 — Request from allowed origin → ACAO header present
ACAO=$(curl -s -I -H "Origin: $APP" $API/api/settings/public \
  | grep -i "access-control-allow-origin")
echo "T14 — Vercel origin ACAO header (expect $APP): '$ACAO'"

# T15 — Preflight from evil origin → must return non-200 or no ACAO
curl -s -o /dev/null -w "T15 OPTIONS evil.com (expect 500 or no ACAO): %{http_code}\n" \
  -X OPTIONS \
  -H "Origin: https://evil.com" \
  -H "Access-Control-Request-Method: POST" \
  $API/api/auth/login
```

### 9.5 Security Headers Tests

```bash
# T16 — All required headers present on API
echo "=== T16 API Security Headers ==="
curl -s -I $API/api/settings/public | grep -iE \
  "strict-transport-security|x-content-type-options|x-frame-options|referrer-policy|content-security-policy"

# T17 — Frontend headers via Vercel
echo "=== T17 Frontend Security Headers ==="
curl -s -I $APP | grep -iE \
  "x-frame-options|x-content-type-options|referrer-policy|permissions-policy|content-security-policy"
```

**Expected output for T16 (API):**
```
strict-transport-security: max-age=31536000; includeSubDomains; preload
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
referrer-policy: strict-origin-when-cross-origin
content-security-policy: default-src 'self'; ...
```

**Expected output for T17 (Frontend):**
```
x-frame-options: DENY
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=()
content-security-policy: default-src 'self'; ...
```

### 9.6 Online Header Scanner

After deployment, paste your domain into **[securityheaders.com](https://securityheaders.com)**.  
Target grade: **A** (all headers present and correct).

---

## 10. Pre-Deployment Checklist

Run this before every production deployment.

### Secrets

- [ ] `JWT_SECRET` is at least 64 characters and randomly generated
- [ ] `JWT_SECRET` is different from the development value in `backend/.env`
- [ ] `DO_SPACES_KEY` and `DO_SPACES_SECRET` have been rotated (see Section 7)
- [ ] `DATABASE_URL` points to NeonDB with `?sslmode=require`
- [ ] `NODE_ENV=production` is set in Railway
- [ ] `FRONTEND_URL` in Railway matches the actual Vercel deployment URL exactly

### Code

- [ ] `npx tsc --noEmit` in both `backend/` and `frontend/` returns zero errors
- [ ] No `console.log` statements printing sensitive data (JWT, passwords, tokens)
- [ ] Swagger UI is disabled in production (`NODE_ENV !== 'production'` gate in `main.ts`)

### Infrastructure

- [ ] Railway service is configured to auto-deploy from `main` branch only
- [ ] NeonDB connection is via SSL (check connection string)
- [ ] Vercel project has `VITE_API_URL` pointing to the Railway production URL

### Post-Deploy Verification

- [ ] Run T01–T17 tests from Section 9 against production URLs
- [ ] Login works, cookie is set as `HttpOnly; Secure; SameSite=None`
- [ ] Admin panel loads after login; all CRUD operations work
- [ ] Logout clears cookie; attempting to re-access admin redirects to login
- [ ] [securityheaders.com](https://securityheaders.com) scan returns grade A or B

---

## 11. Incident Response

### Suspected Token Compromise

If you believe the admin session cookie or JWT secret has been compromised:

1. **Immediately** — change `JWT_SECRET` in Railway to a new value (`openssl rand -hex 32`). This invalidates **all** existing tokens instantly since they were signed with the old secret.
2. Redeploy the Railway service to pick up the new secret.
3. Change the admin password via Prisma Studio or a seed script.
4. Review Railway access logs for suspicious `POST /api/auth/login` patterns.

### Suspected SQL Injection / Data Breach

1. Rotate `DATABASE_URL` credentials in NeonDB dashboard.
2. Update Railway env var and redeploy.
3. Review NeonDB query logs (available in the NeonDB console) for anomalous queries.
4. Prisma ORM makes SQL injection structurally impossible, but review any recent `$queryRaw` additions if the codebase has changed.

### Suspected XSS in Blog Content

1. In the admin panel, navigate to Blog Posts and identify any suspicious post.
2. The content was sanitized by DOMPurify on render, so execution was already blocked.
3. Edit or delete the post to remove the malicious content from the database.
4. If the post was published, it was sanitized before display — no user data is at risk.

### Rate Limit Bypass / DDoS

The in-memory throttler resets on Railway instance restart. For sustained attacks:

1. Enable Railway's built-in DDoS protection in project settings.
2. Add Cloudflare as a proxy in front of the Railway URL (free tier is sufficient).
3. For persistent abuse from a specific IP, add a Cloudflare WAF rule to block it.
4. Long-term: replace in-memory throttler storage with Redis (`ThrottlerStorageRedisService`).

### DigitalOcean Spaces Key Leak

1. Log into DigitalOcean → API → Spaces Access Keys.
2. Delete the compromised key pair immediately.
3. Generate a new key pair.
4. Update `DO_SPACES_KEY` and `DO_SPACES_SECRET` in Railway.
5. Redeploy.
6. Audit Spaces bucket access logs for any unauthorized uploads or downloads.

---

## 12. Known Limitations & Roadmap

### Current Limitations

| Limitation | Risk | Fix When |
|---|---|---|
| Rate limit state is in-memory (per Railway instance) | On multi-instance scale-out, limits reset per instance | Before scaling beyond 1 Railway instance |
| `SameSite=None` cookie requires HTTPS; local `http://` dev uses `Lax` | Dev-only behavior; no production impact | — |
| No CSRF token | Mitigated by `SameSite` cookie + exact-origin CORS; acceptable for current threat model | If state-mutating forms are ever embedded in third-party sites |
| Swagger UI enabled in development | Developer convenience; disabled in production | — |
| Admin accounts managed via DB seed only | No self-service password reset | Phase 2: add password reset via SMTP |
| Blog content HTML stored as raw HTML in DB | Sanitized on render, but raw in DB | Phase 2: sanitize on write, not only on read |
| DO_SPACES credentials in plaintext `.env` on disk | `.env` excluded from git; rotate keys | Immediately (see Section 7) |

### Planned Security Improvements (Phase 2)

- **Email-based password reset** — token stored in DB, expires in 1 hour, single use
- **Redis-backed rate limiting** — persistent across Railway instances and restarts
- **Audit log** — write a log entry to the DB for every admin action (login, delete, status change)
- **Two-factor authentication** — TOTP (Google Authenticator compatible) for admin login
- **Sanitize blog content on write** — run DOMPurify server-side (via `isomorphic-dompurify`) before storing in DB
- **Database row-level security** — NeonDB supports PostgreSQL RLS for defense-in-depth
- **Automated secret rotation** — Railway + GitHub Actions workflow to rotate `JWT_SECRET` monthly

---

*This document reflects the security state as of the implementation completed on 2026-06-19. Update this document whenever the authentication flow, rate limits, CSP directives, or threat model changes.*
