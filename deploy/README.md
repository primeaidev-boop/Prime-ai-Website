# Prim AI Institute — DigitalOcean Deployment Guide

**Droplet:** 64.227.143.243 (BLR1, Ubuntu 22.04, $16/mo)  
**Domain:** primaiinstitute.com  
**Stack:** NestJS (port 3001, PM2) + Vite React (static, served by Nginx) + PostgreSQL (local)

---

## First-time login to the droplet

```bash
ssh root@64.227.143.243
# Password: check the DigitalOcean email they sent when you created the droplet
# Tip: set up SSH key auth after first login to avoid typing password every time
```

---

## Step-by-step deployment

### Step 1 — Initial server setup (run once)

```bash
# On your local machine — copy scripts to droplet
scp -r deploy/scripts root@64.227.143.243:/root/primai-scripts

# SSH into droplet
ssh root@64.227.143.243

# Run setup script
bash /root/primai-scripts/01_initial_setup.sh
```

### Step 2 — PostgreSQL setup (run once)

```bash
bash /root/primai-scripts/02_postgres_setup.sh
# It will prompt you for a DB password — save it securely
```

### Step 3 — Create the .env file on the server

```bash
# Generate a JWT secret
openssl rand -hex 32

# Create the backend .env (fill in the values)
nano /var/www/primai/backend/.env
```

Contents (copy from `deploy/backend.env.production` and fill in your values):
- Replace `YOUR_STRONG_DB_PASSWORD` with what you set in Step 2
- Replace `PASTE_64_CHAR_RANDOM_HEX_HERE` with the openssl output above

### Step 4 — Deploy the app (run once)

```bash
# Edit 03_app_deploy.sh first — set your actual GitHub repo URL
nano /root/primai-scripts/03_app_deploy.sh

bash /root/primai-scripts/03_app_deploy.sh
```

### Step 5 — Issue SSL certificate (run once)

```bash
certbot --nginx -d primaiinstitute.com -d www.primaiinstitute.com
# Follow the prompts — enter your email, agree to ToS

# Verify auto-renewal works
certbot renew --dry-run
```

---

## Updating the site (every time you push changes)

```bash
ssh root@64.227.143.243
bash /var/www/primai/deploy/scripts/update.sh
```

Or set up GitHub Actions to do this automatically (see below).

---

## Architecture on the droplet

```
Internet
    │
    ▼
Nginx (ports 80, 443)
    ├── /api/* ──────────────────────► NestJS (port 3001, PM2)
    │                                      │
    │                                      ▼
    │                               PostgreSQL (port 5432, localhost only)
    │
    └── /* ──────────────────────────► /var/www/primai/frontend/dist/
                                       (static Vite build, no Node.js)
```

**Ports open to internet:** 22 (SSH), 80 (HTTP redirect), 443 (HTTPS)  
**Ports internal only:** 3001 (NestJS), 5432 (PostgreSQL)

---

## Security checklist — already implemented in code

| Item | Status |
|---|---|
| Helmet.js security headers | ✅ in `backend/src/main.ts` |
| CORS exact-origin whitelist | ✅ in `backend/src/main.ts` |
| Rate limiting (100/15min global, 5/15min login) | ✅ via `@nestjs/throttler` |
| JWT in httpOnly cookie (not localStorage) | ✅ in `auth.controller.ts` |
| bcrypt password hashing | ✅ in `auth.service.ts` |
| Input validation (class-validator) | ✅ via `ValidationPipe` |
| PostgreSQL localhost-only | ✅ default postgres config |
| UFW firewall | ✅ script sets it up |
| SSL/HTTPS | ✅ Let's Encrypt via Certbot |

---

## Useful commands on the droplet

```bash
# Check backend status
pm2 status
pm2 logs primai-backend --lines 50

# Restart backend after env change
pm2 restart primai-backend

# Check Nginx config
nginx -t
systemctl status nginx

# Check firewall
ufw status verbose

# Check PostgreSQL
sudo -u postgres psql -c "\l"

# SSL certificate status
certbot certificates
```

---

## Optional: GitHub Actions auto-deploy

Create `.github/workflows/deploy.yml` to auto-deploy on push to main.
Ask Claude Code to set this up when ready.
