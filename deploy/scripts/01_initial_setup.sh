#!/usr/bin/env bash
# Run this ONCE as root on a fresh DigitalOcean Ubuntu 22.04 droplet.
# Usage: bash 01_initial_setup.sh
set -euo pipefail

echo "=== [1/7] System update ==="
apt update && apt upgrade -y

echo "=== [2/7] Node.js 20 LTS ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v && npm -v

echo "=== [3/7] PostgreSQL 16 ==="
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

echo "=== [4/7] Nginx ==="
apt install -y nginx
systemctl enable nginx

echo "=== [5/7] PM2 ==="
npm install -g pm2

echo "=== [6/7] Certbot ==="
apt install -y certbot python3-certbot-nginx

echo "=== [7/7] UFW firewall ==="
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
# NEVER open 3001 (NestJS) or 5432 (PostgreSQL) — Nginx + internal only
ufw --force enable
ufw status verbose

echo ""
echo "=== Initial setup complete. Run 02_postgres_setup.sh next. ==="
