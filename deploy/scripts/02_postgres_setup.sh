#!/usr/bin/env bash
# Sets up PostgreSQL: creates DB + limited-permission user.
# Run as root AFTER 01_initial_setup.sh.
# Usage: bash 02_postgres_setup.sh
set -euo pipefail

read -rsp "Enter a strong DB password for primai_user: " DB_PASS
echo ""

sudo -u postgres psql <<SQL
CREATE DATABASE primai_db;
CREATE USER primai_user WITH ENCRYPTED PASSWORD '${DB_PASS}';
GRANT CONNECT ON DATABASE primai_db TO primai_user;
GRANT USAGE ON SCHEMA public TO primai_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO primai_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO primai_user;
SQL

echo ""
echo "=== Verifying PostgreSQL only listens on localhost ==="
PG_LISTEN=$(grep -r "listen_addresses" /etc/postgresql/*/main/postgresql.conf | head -1)
echo "  $PG_LISTEN"
if echo "$PG_LISTEN" | grep -qE "'localhost'|'127\.0\.0\.1'"; then
  echo "  [OK] PostgreSQL is not exposed to the internet."
else
  echo "  [WARNING] Check listen_addresses — must be 'localhost', not '*'."
fi

echo ""
echo "=== Postgres setup complete ==="
echo "Your DATABASE_URL: postgresql://primai_user:${DB_PASS}@localhost:5432/primai_db"
echo ""
echo "SAVE that password now, then run 03_app_deploy.sh."
