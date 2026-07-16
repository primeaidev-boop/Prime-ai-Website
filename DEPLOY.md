# PRIM AI Institute - Deployment Guide

> **For:** Human admins and AI assistants (Claude Code, etc.)
> **Project root:** `/home/jadeja/Videos/Doc of STAD/Project Prime Ai/prim-ai-institute/`
> **Production server:** `200.97.169.195` (Hostinger KVM 2, Ubuntu 24.04)
> **Live domain:** `https://primaiinstitute.com`
> **Last major update:** 2026-07-14 - migrated from DigitalOcean to Hostinger,
> added HTTP/2 + Brotli + asset caching. See "Server History" at the bottom.

---

## Architecture at a Glance

```
primaiinstitute.com  (DNS: GoDaddy ➞ A record ➞ 200.97.169.195)
│
├── Nginx 1.24 (reverse proxy + static files, HTTP/2 + Brotli + gzip)
│   ├── /api/*     ➞ NestJS backend on :3001 (managed by PM2)
│   ├── /uploads/  ➞ /var/www/primai/uploads/  (1y immutable cache)
│   ├── /assets/   ➞ Vite hashed chunks         (1y immutable cache)
│   └── /*         ➞ /var/www/primai/frontend/dist/ (SPA fallback,
│                     index.html served with Cache-Control: no-cache)
│
├── Backend: NestJS 10 + Prisma 5 + PostgreSQL 16
│   └── /var/www/primai/backend/
│
├── Frontend: React 19 + Vite 5 + Tailwind CSS v4 (pure client-side SPA)
│   └── /var/www/primai/frontend/
│
└── Database: PostgreSQL 16 running locally on the VPS
    └── DB: primai_db | User: primai_user | Host: localhost:5432
```

---

## 1. SSH Access

```bash
ssh root@200.97.169.195
# Password: Primai@#789Ai
```

For non-interactive use (scripts, AI agents) - use Python paramiko:

```python
import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('200.97.169.195', username='root', password='Primai@#789Ai', timeout=30)
```

---

## 2. Git Remotes

| Remote | URL | Purpose |
|--------|-----|---------|
| `boop` | `https://primeaidev-boop:ghp_...@github.com/primeaidev-boop/Prime-ai-Website.git` | **Push target** (has embedded PAT - always push here) |
| `origin` | same repo without credentials | Pull-only fallback |

**The production server's clone tracks `main` directly** (fresh clone during
the 2026-07 migration - the old server's `master`-branch quirk is gone).

```bash
# Push from local dev:
git push boop main

# Pull on production server (robust form, works regardless of tracking setup):
cd /var/www/primai && git fetch origin && git merge origin/main --ff-only
```

---

## 3. Standard Deploy Workflow

This is the sequence used for every production deploy. Follow it in order.

### Step 1 - Commit and push from local

```bash
cd /home/jadeja/Videos/Doc\ of\ STAD/Project\ Prime\ Ai/prim-ai-institute

# Stage all changes (or specific files)
git add -A

# Commit (Co-author line is required by project convention)
git commit -m "$(cat <<'EOF'
feat/fix/style/perf: short description

Longer explanation if needed.

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Push to GitHub via boop remote
git push boop main
```

### Step 2 - Pull on the production server

```bash
ssh root@200.97.169.195 "cd /var/www/primai && git fetch origin && git merge origin/main --ff-only"
```

### Step 3A - Frontend only changed

```bash
ssh root@200.97.169.195 "cd /var/www/primai/frontend && npm run build"
# Nginx serves dist/ directly - no restart needed.
# index.html is no-cache, hashed assets are immutable ➞ users get the new
# build on their next page load automatically.
```

### Step 3B - Backend changed (new routes, services, etc.)

```bash
ssh root@200.97.169.195 "cd /var/www/primai/backend && npm run build && pm2 restart primai-backend"
```

### Step 3C - New npm packages added

```bash
# Run npm install BEFORE building, on the server
ssh root@200.97.169.195 "cd /var/www/primai/frontend && npm install && npm run build"
# Or for backend:
ssh root@200.97.169.195 "cd /var/www/primai/backend && npm install && npm run build && pm2 restart primai-backend"
```

### Step 3D - New Prisma migration

```bash
# Migrations are applied with migrate deploy (non-interactive, safe for production)
ssh root@200.97.169.195 "cd /var/www/primai/backend && npx prisma migrate deploy && npx prisma generate && npm run build && pm2 restart primai-backend"
```

### Step 4 - Verify

```bash
# Check PM2 status
ssh root@200.97.169.195 "pm2 list"

# Smoke-test the API
ssh root@200.97.169.195 "curl -s -o /dev/null -w 'API: %{http_code}\n' http://localhost:3001/api/settings/public"

# Smoke-test live site (expect 200 + HTTP/2)
curl -s -o /dev/null -w 'Site: %{http_code} http=%{http_version}\n' https://primaiinstitute.com/
```

---

## 4. Decision Matrix - What to Run After Each Change

| What changed | npm install? | Backend build? | pm2 restart? | Frontend build? |
|---|:-:|:-:|:-:|:-:|
| Frontend `.tsx`/`.ts`/`.css` only | ✗ | ✗ | ✗ | ✅ |
| New frontend npm package | ✅ | ✗ | ✗ | ✅ |
| Backend `.ts` only (no schema) | ✗ | ✅ | ✅ | ✗ |
| New backend npm package | ✅ | ✅ | ✅ | ✗ |
| Prisma schema change (new model/field) | ✗ | ✅ | ✅ | ✗ |
| Backend + frontend changed | ✗ | ✅ | ✅ | ✅ |
| Nginx config change | ✗ | ✗ | ✗ | ✗ (see §7) |
| Only `.md` / docs files | ✗ | ✗ | ✗ | ✗ |

---

## 5. Creating a Prisma Migration

`prisma migrate dev` **does not work** on the local dev machine
(non-interactive terminal). Always use this manual workflow instead:

```bash
# 1. Edit backend/prisma/schema.prisma to add your new model or field.

# 2. Hand-write the SQL migration file locally:
mkdir -p backend/prisma/migrations/YYYYMMDDHHMMSS_your_migration_name
# Write the SQL to:
#   backend/prisma/migrations/YYYYMMDDHHMMSS_your_migration_name/migration.sql

# 3. If the table already exists locally (e.g., from a prior db push):
cd backend
npx prisma migrate resolve --applied YYYYMMDDHHMMSS_your_migration_name
npx prisma generate

# 4. If the table does NOT exist locally yet:
npx prisma migrate deploy   # creates the table + marks migration applied
npx prisma generate

# 5. On PRODUCTION - migrate deploy always works non-interactively:
ssh root@200.97.169.195 "cd /var/www/primai/backend && npx prisma migrate deploy && npx prisma generate"
```

**Migration filename convention:** `YYYYMMDDHHMMSS_snake_case_description`
(e.g., `20260623090740_add_tutorial_leads`)

---

## 6. PM2 - Backend Process Manager

```bash
pm2 list                        # show all processes + status
pm2 restart primai-backend      # restart after a build
pm2 logs primai-backend --lines 50 --nostream   # tail recent logs
pm2 logs primai-backend --lines 50 --nostream 2>&1 | grep ERROR  # errors only
pm2 save                        # persist process list across reboots
```

- Backend starts from `/var/www/primai/backend/dist/src/main.js`
  (note: `dist/src/main.js`, not `dist/main.js`).
- PM2 config: `/var/www/primai/backend/ecosystem.config.js`
  (300 MB memory cap, logs under `/var/log/pm2/`).
- Boot persistence: systemd unit `pm2-root` is **enabled** - after a server
  reboot PM2 resurrects the saved process list automatically. Verify with
  `systemctl is-enabled pm2-root`.

---

## 7. Nginx

```bash
nginx -t                        # ALWAYS test config before reloading
systemctl reload nginx          # apply config change (graceful, zero downtime)
systemctl status nginx          # health check
cat /var/log/nginx/error.log    # error logs
```

- Live config: `/etc/nginx/sites-available/primaiinstitute.com`
  (symlinked into `sites-enabled/`; the stock `default` site is also enabled
  as the catch-all for direct-IP requests - leave it alone).
- **Source of truth in repo: `deploy/nginx/primai.conf`** - kept in sync with
  the deployed file. If you change one, change the other.
- Rollback copies live next to the config:
  `primaiinstitute.com.pre-perf-*.bak` (restore with `cp` + `nginx -t` + reload).

### Performance features (added 2026-07-14 - do not remove when editing)

| Feature | Where | Why |
|---|---|---|
| `listen 443 ssl http2` | both listen lines | HTTP/2 multiplexing for the SPA's many chunks |
| `brotli on` + types | server block | ~24% smaller JS than default gzip (needs `libnginx-mod-http-brotli-filter` apt package, already installed) |
| `gzip_comp_level 6`, `gzip_vary on` | server block | better gzip for non-brotli clients |
| `location /assets/` ➞ 1y immutable | server block | Vite filenames are content-hashed - safe to cache forever; repeat visits make zero asset requests |
| `location = /index.html` ➞ `no-cache` | server block | deploys reach users on their next navigation |

---

## 8. Database

```bash
# Connect (note: user is primai_user, NOT primai)
PGPASSWORD='<see backend/.env DATABASE_URL>' psql -U primai_user -h localhost -d primai_db

# Common checks
\dt                             # list all tables (22 as of 2026-07)
SELECT COUNT(*) FROM demo_bookings;
SELECT COUNT(*) FROM tutorial_leads;

# Migration status
cd /var/www/primai/backend && npx prisma migrate status
```

- PostgreSQL **16** (the old DO server ran 14 - dumps from 14 restore into 16
  fine; the reverse is not guaranteed).
- CMS-style content (tutorials, projects, course pages) is stored as JSON
  blobs in `site_settings` (keys: `tutorial_data`, `projects_data`,
  `course_page_data`) - there are no dedicated tables for those. This is by
  design, not an error.

**Default admin credentials:**
- Email: `admin@primaiinstitute.com`
- Password: `Admin@123`

### Backup (recommended before risky changes)

```bash
ssh root@200.97.169.195 "PGPASSWORD='<db-password>' pg_dump -U primai_user -h localhost -F c -b -f /root/primai_backup_\$(date +%Y%m%d).dump primai_db"
```

---

## 9. Environment Variables

### Backend (`/var/www/primai/backend/.env`, chmod 600)

```env
DATABASE_URL="postgresql://primai_user:PASSWORD@localhost:5432/primai_db"
JWT_SECRET="long-random-string"
JWT_EXPIRES_IN="8h"
PORT="3001"
NODE_ENV="production"
FRONTEND_URL="https://primaiinstitute.com"
HTTPS_ENABLED="true"
ADMIN_WHATSAPP="917573055191"
ADMIN_EMAIL="info@stadsolution.com"
MSG91_AUTH_KEY=""          # optional: WhatsApp notifications via MSG91
ADDITIONAL_ORIGINS="https://primaiinstitute.com,https://www.primaiinstitute.com"
UPLOAD_DIR="/var/www/primai/uploads"
PUBLIC_URL="https://primaiinstitute.com"
```

### Frontend

No `.env` file needed in production. The Vite build uses relative `/api` paths
which Nginx proxies to the local NestJS backend. **Never set `VITE_API_URL` in production.**

---

## 10. SSL Certificate - ⚠️ READ THIS

The current certificate was issued **2026-07-13 via a manual DNS-01 challenge**
(because DNS didn't point at this server yet during migration).

- Covers: `primaiinstitute.com` + `www.primaiinstitute.com`
- **Expires: 2026-10-11**
- **It does NOT auto-renew.** Manual-mode certs can't renew unattended.

**Action required before 2026-10-01 (do this once, then it's automatic forever):**
now that DNS points at this server, reissue via the nginx plugin, which
installs an auto-renewing HTTP-01 cert over the same paths:

```bash
ssh root@200.97.169.195
certbot certonly --nginx -d primaiinstitute.com -d www.primaiinstitute.com
# Verify auto-renewal is then active:
certbot renew --dry-run
certbot certificates   # shows expiry dates
```

No Nginx config change is needed afterwards - the cert paths
(`/etc/letsencrypt/live/primaiinstitute.com/...`) stay the same.

---

## 11. DNS

- **Registrar AND DNS host: GoDaddy** (authoritative nameservers
  `ns53/ns54.domaincontrol.com`). Manage records at
  `https://dcc.godaddy.com/manage/primaiinstitute.com/dns`.
- `A @ ➞ 200.97.169.195` (TTL 600s), `CNAME www ➞ primaiinstitute.com`.
- ⚠️ **DELETE the leftover `NS ns1-3.digitalocean.com` records** (from an old
  half-migration). Proven NOT inert on 2026-07-16: some ISP resolvers follow
  them to DigitalOcean DNS, which still answers with the old droplet IP -
  users were served the stale pre-migration site for days. As a shim, the old
  droplet's Nginx now reverse-proxies everything to the live server
  (rollback copy: `primai.pre-proxy-*.bak` on the droplet), but the records
  must be deleted before the droplet is destroyed.
  Do not touch the `domaincontrol.com` NS records.
- Leftover `TXT _acme-challenge*` records from the 2026-07 cert issuance can
  be deleted at any time.

---

## 12. Rollback

```bash
# On the production server:
cd /var/www/primai

git log --oneline -10            # find the last good commit hash

# Roll back to a specific commit
git checkout <COMMIT_HASH> -- frontend/  # frontend files only, or
git reset --hard <COMMIT_HASH>   # full rollback (USE WITH CAUTION)

# Rebuild whatever was rolled back
cd frontend && npm run build
# or
cd backend && npm run build && pm2 restart primai-backend
```

- **Nginx rollback:** `cp /etc/nginx/sites-available/primaiinstitute.com.pre-perf-<ts>.bak /etc/nginx/sites-available/primaiinstitute.com && nginx -t && systemctl reload nginx`
- **Database rollbacks:** there are no `down` migrations. Write a new forward
  migration that reverses the change.

---

## 13. Local Development

```bash
# Backend (terminal 1)
cd backend
npm install                          # first time only
npx prisma migrate dev --name init   # first time only  (works locally)
npx prisma db seed                   # first time only
npm run start:dev
# ➞ http://localhost:3001
# ➞ http://localhost:3001/api/docs  (Swagger, dev only)

# Frontend (terminal 2)
cd frontend
npm install                          # first time only
npm run dev
# ➞ http://localhost:5173

# Local DB
# Engine: PostgreSQL 16 on localhost:5432
# DB:     primai_db
# User:   jadeja (superuser, no password)
```

---

## 14. Full Fresh Server Setup

Run the deploy scripts in order (first-time only):

```bash
cd /tmp
git clone https://github.com/primeaidev-boop/Prime-ai-Website.git primai
cd primai/deploy/scripts

bash 01_system_setup.sh      # installs Node, Postgres, Nginx, PM2, Certbot
bash 02_db_setup.sh          # creates DB user + database
bash 03_app_deploy.sh        # clones repo, builds backend + frontend, starts PM2
bash 04_nginx_setup.sh       # writes Nginx config + symlink
bash 05_ssl_setup.sh         # runs certbot --nginx for the domain
# Extra (perf): apt-get install -y libnginx-mod-http-brotli-filter libnginx-mod-http-brotli-static
```

---

## 15. Common Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `git merge` fails with "local changes" | A file was patched directly on server | `git checkout -- <file>` then re-merge |
| `npm run build` fails with "Cannot find module X" | New package added but not installed | `npm install` then build again |
| PM2 shows `errored` status | Backend crashed on startup | `pm2 logs primai-backend --lines 100 --nostream` to read the error |
| API returns 502 | NestJS is down | `pm2 restart primai-backend` |
| API returns 429 | App rate limiter (100 req/15 min per IP) | Wait 15 min - by design, don't "fix" |
| API returns 413 | Request body too large | Already patched: 10 MB limit set in `main.ts` |
| `prisma migrate deploy` fails P3018 | Table already exists (prior db push) | `npx prisma migrate resolve --applied <name>` |
| `prisma migrate dev` hangs | Non-interactive terminal | Use `migrate deploy` or `migrate resolve` instead - never use `migrate dev` on this machine |
| HTTPS cert warning in browser | Cert expired (manual cert doesn't auto-renew!) | See §10 - reissue with `certbot certonly --nginx` |
| Users see old frontend after deploy | Build didn't run, or index.html cached | Rebuild; confirm `curl -sI https://primaiinstitute.com/ \| grep -i cache` shows `no-cache` |
| Fonts / YouTube embeds blocked | CSP header too strict | Edit `frameSrc`/`fontSrc` directives in `backend/src/main.ts` ➞ rebuild + restart |
| CORS error in browser | Request origin not in allowlist | Add origin to `ADDITIONAL_ORIGINS` in backend `.env` or to `allowedOrigins` in `main.ts` |

---

## 16. Server History

| Date | Event |
|---|---|
| 2026-06-19 | Initial deploy on DigitalOcean droplet `64.227.143.243` (Ubuntu 22.04, PG 14, Nginx 1.18) |
| 2026-07-13 | **Full migration to Hostinger KVM 2 `200.97.169.195`** (Ubuntu 24.04, PG 16, Nginx 1.24). DB dump/restore verified row-for-row; uploads checksum-verified; DNS cut over via GoDaddy; SSL reissued via DNS-01 |
| 2026-07-14 | Performance pass: HTTP/2, Brotli, immutable `/assets/` caching, lazy-loaded CertificateModal, image lazy-loading, API session cache. Measured ~40-58% faster TTFB vs old server + 24% smaller JS wire size |
| - | **Old DO droplet:** kept running as rollback safety net. After ~3-5 stable days it can be stopped (Nginx/PM2) and later destroyed. Until destroyed: never edit it, it holds the pre-migration state |
