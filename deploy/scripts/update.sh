#!/usr/bin/env bash
# Pull latest code and restart services.
# Run as root on the droplet for every update.
# Usage: bash /var/www/primai/deploy/scripts/update.sh
set -euo pipefail

APP_DIR="/var/www/primai"

echo "=== Pulling latest code ==="
cd "$APP_DIR"
git pull origin main

echo ""
echo "=== Rebuilding backend ==="
cd "$APP_DIR/backend"
npm ci --omit=dev
npm run build
npx prisma migrate deploy

echo ""
echo "=== Rebuilding frontend ==="
cd "$APP_DIR/frontend"
npm ci
npm run build

echo ""
echo "=== Restarting backend ==="
pm2 restart primai-backend

echo ""
pm2 status
echo "=== Update complete ==="
