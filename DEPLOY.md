# PRIM AI Institute - Deployment Guide

> **For:** Human admins and AI assistants (Claude Code, etc.)
> **Project root:** `/home/jadeja/Videos/Doc of STAD/Project Prime Ai/prim-ai-institute/`
> **Production server:** `64.227.143.243` (DigitalOcean droplet, Ubuntu)
> **Live domain:** `https://primaiinstitute.com`

---

## Architecture at a Glance

```
primaiinstitute.com
│
├── Nginx (reverse proxy + static file server)
│   ├── /api/* ➞ NestJS backend on :3001 (managed by PM2)
│   └── /* ➞ /var/www/primai/frontend/dist/ (Vite static build)
│
├── Backend: NestJS 10 + Prisma 5 + PostgreSQL 16
│   └── /var/www/primai/backend/
│
├── Frontend: React 19 + Vite 5 + Tailwind CSS v4
│   └── /var/www/primai/frontend/
│
└── Database: PostgreSQL 16 running locally on the droplet
    └── DB: primai_db | User: primai | Host: localhost:5432
```

---

## 1. SSH Access

```bash
ssh root@64.227.143.243
# Password: Primai@#789Ai
```

For non-interactive use (scripts, AI agents) - use Python paramiko:

```python
import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('64.227.143.243', username='root', password='Primai@#789Ai', timeout=30)
```

---

## 2. Git Remotes

| Remote | URL | Purpose |
|--------|-----|---------|
| `boop` | `https://primeaidev-boop:ghp_...@github.com/primeaidev-boop/Prime-ai-Website.git` | **Push target** (has embedded PAT - always push here) |
| `origin` | same repo without credentials | Pull-only fallback |

**The production server uses `origin` (no PAT needed - it only pulls).**

```bash
# Push from local dev:
git push boop main

# Pull on production server:
cd /var/www/primai && git fetch origin && git merge origin/main --ff-only
```

> **Why `--ff-only`?** The server's local branch is named `master` (not `main`). Using
> `--ff-only` against `origin/main` works because it's a clean linear history.
> Never run `git pull` bare on the server - it will error because there is no
> upstream tracking branch set for `master`.

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
feat/fix/style: short description

Longer explanation if needed.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"

# Push to GitHub via boop remote
git push boop main
```

### Step 2 - Pull on the production server

```bash
ssh root@64.227.143.243 "cd /var/www/primai && git fetch origin && git merge origin/main --ff-only"
```

### Step 3A - Frontend only changed

```bash
ssh root@64.227.143.243 "cd /var/www/primai/frontend && npm run build"
# Nginx serves dist/ directly - no restart needed.
```

### Step 3B - Backend changed (new routes, services, etc.)

```bash
ssh root@64.227.143.243 "cd /var/www/primai/backend && npm run build && pm2 restart primai-backend"
```

### Step 3C - New npm packages added

```bash
# Run npm install BEFORE building, on the server
ssh root@64.227.143.243 "cd /var/www/primai/frontend && npm install && npm run build"
# Or for backend:
ssh root@64.227.143.243 "cd /var/www/primai/backend && npm install && npm run build && pm2 restart primai-backend"
```

### Step 3D - New Prisma migration

```bash
# Migrations are applied with migrate deploy (non-interactive, safe for production)
ssh root@64.227.143.243 "cd /var/www/primai/backend && npx prisma migrate deploy && npx prisma generate && npm run build && pm2 restart primai-backend"
```

### Step 4 - Verify

```bash
# Check PM2 status
ssh root@64.227.143.243 "pm2 list"

# Smoke-test the API
ssh root@64.227.143.243 "curl -s -o /dev/null -w 'API: %{http_code}\n' http://localhost:3001/api/settings/public"

# Smoke-test live site
ssh root@64.227.143.243 "curl -s -o /dev/null -w 'Site: %{http_code}\n' https://primaiinstitute.com/"
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
| Only `.md` / docs files | ✗ | ✗ | ✗ | ✗ |

---

## 5. Creating a Prisma Migration

`prisma migrate dev` **does not work** in this environment (non-interactive terminal).
Always use this manual workflow instead:

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
ssh root@64.227.143.243 "cd /var/www/primai/backend && npx prisma migrate deploy && npx prisma generate"
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

The backend starts from `/var/www/primai/backend/dist/main.js`.
PM2 config is at `/var/www/primai/backend/ecosystem.config.js`.

---

## 7. Nginx

```bash
nginx -t                        # test config before reloading
systemctl reload nginx          # apply config change (graceful, zero downtime)
systemctl status nginx          # health check
cat /var/log/nginx/error.log    # error logs
```

Config file: `/etc/nginx/sites-available/primai` (symlinked to `/etc/nginx/sites-enabled/`)
Source copy in repo: `deploy/nginx/primai.conf`

---

## 8. Database

```bash
# Connect
psql -U primai -d primai_db

# Common checks
\dt                             # list all tables
SELECT COUNT(*) FROM demo_bookings;
SELECT COUNT(*) FROM tutorial_leads;

# Migration status
cd /var/www/primai/backend && npx prisma migrate status

# Seed (first-time only - creates default admin account)
npx prisma db seed
```

**Default admin credentials:**
- Email: `admin@primaiinstitute.com`
- Password: `Admin@123`

---

## 9. Environment Variables

### Backend (`/var/www/primai/backend/.env`)

```env
DATABASE_URL="postgresql://primai:PASSWORD@localhost:5432/primai_db"
JWT_SECRET="long-random-string"
JWT_EXPIRES_IN="7d"
PORT="3001"
NODE_ENV="production"
FRONTEND_URL="https://primaiinstitute.com"
HTTPS_ENABLED="true"
ADMIN_WHATSAPP="917573055191"
ADMIN_EMAIL="info@stadsolution.com"
MSG91_AUTH_KEY=""          # optional: WhatsApp notifications via MSG91
ADDITIONAL_ORIGINS=""      # optional: comma-separated extra CORS origins
```

### Frontend

No `.env` file needed in production. The Vite build uses relative `/api` paths
which Nginx proxies to the local NestJS backend. **Never set `VITE_API_URL` in production.**

---

## 10. SSL Certificate

Managed by Certbot. Certificates auto-renew via a system cron job.

```bash
certbot renew --dry-run          # test renewal
certbot certificates             # show expiry dates
```

---

## 11. Rollback

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

> For database rollbacks: there are no `down` migrations. If you need to undo a
> schema change, write a new forward migration that reverses it.

---

## 12. Local Development

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

## 13. Full Fresh Server Setup

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
```

---

## 14. Common Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `git merge` fails with "local changes" | A file was patched directly on server | `git checkout -- <file>` then re-merge |
| `npm run build` fails with "Cannot find module X" | New package added but not installed | `npm install` then build again |
| PM2 shows `errored` status | Backend crashed on startup | `pm2 logs primai-backend --lines 100 --nostream` to read the error |
| API returns 502 | NestJS is down | `pm2 restart primai-backend` |
| API returns 413 | Request body too large | Already patched: 10 MB limit set in `main.ts` |
| `prisma migrate deploy` fails P3018 | Table already exists (prior db push) | `npx prisma migrate resolve --applied <name>` |
| `prisma migrate dev` hangs | Non-interactive terminal | Use `migrate deploy` or `migrate resolve` instead - never use `migrate dev` on this machine |
| Cert renewal fails | Nginx config error | `nginx -t` first; fix config; then `certbot renew` |
| CORS error in browser | Request origin not in allowlist | Add origin to `ADDITIONAL_ORIGINS` in backend `.env` or to `allowedOrigins` in `main.ts` |
| Fonts / YouTube embeds blocked | CSP header too strict | Edit `frameSrc`/`fontSrc` directives in `backend/src/main.ts` ➞ rebuild + restart |
