#!/usr/bin/env bash
# First-time deployment of Prim AI Institute to /var/www/primai.
# Run as root on the droplet AFTER 02_postgres_setup.sh and after
# you have placed .env files (see deploy/README.md).
# Usage: bash 03_app_deploy.sh
set -euo pipefail

APP_DIR="/var/www/primai"
REPO_URL="https://github.com/YOUR_USERNAME/prim-ai-institute.git"  # TODO: set your repo URL

echo "=== [1/6] Clone repository ==="
mkdir -p "$APP_DIR"
git clone "$REPO_URL" "$APP_DIR"

echo ""
echo "=== [2/6] Place .env files BEFORE building ==="
echo "You must copy backend/.env to $APP_DIR/backend/.env"
echo "Press Enter once you have created $APP_DIR/backend/.env ..."
read -r

if [ ! -f "$APP_DIR/backend/.env" ]; then
  echo "[ERROR] $APP_DIR/backend/.env not found. Aborting."
  exit 1
fi

echo ""
echo "=== [3/6] Build backend (NestJS ➞ dist/) ==="
cd "$APP_DIR/backend"
npm ci --omit=dev
npm run build
# Run migrations on production DB
npx prisma migrate deploy
# Seed only if DB is fresh (skips safely if already seeded)
npx prisma db seed || echo "[INFO] Seed skipped (data already exists)"

echo ""
echo "=== [4/6] Build frontend (Vite ➞ dist/) ==="
cd "$APP_DIR/frontend"
# No VITE_API_URL needed - axios falls back to relative /api
# Nginx routes /api/* to NestJS on the same domain, so relative paths work
npm ci
npm run build
# dist/ is served statically by Nginx - no Node.js process needed

echo ""
echo "=== [5/6] Copy Nginx config and enable site ==="
cp /var/www/primai/deploy/nginx/primai.conf /etc/nginx/sites-available/primai
ln -sf /etc/nginx/sites-available/primai /etc/nginx/sites-enabled/primai
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo ""
echo "=== [6/6] Start backend with PM2 ==="
cd "$APP_DIR/backend"
pm2 delete primai-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -1 | bash  # runs the systemd enable command PM2 prints

echo ""
pm2 status
echo ""
echo "=== App deployed. Now run Certbot for SSL: ==="
echo "  certbot --nginx -d primaiinstitute.com -d www.primaiinstitute.com"
