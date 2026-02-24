#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INSTALLER_PATH="$APP_DIR/public/downloads/CES_SMART_Installer.exe"

echo "[1/6] Node.js version"
node -v

echo "[2/6] NPM version"
npm -v

echo "[3/6] Backend health check"
curl -fsS --max-time 5 "http://localhost:3000/api/health" >/dev/null
echo "OK: /api/health"

echo "[4/6] Setup API route check"
curl -fsS --max-time 5 "http://localhost:3000/api/setup/installer" >/dev/null
echo "OK: /api/setup/installer"

echo "[5/6] Installer file check"
if [ -f "$INSTALLER_PATH" ]; then
  ls -lh "$INSTALLER_PATH"
else
  echo "Installer missing: $INSTALLER_PATH" >&2
  exit 2
fi

echo "[6/6] PM2 process check (if installed)"
if command -v pm2 >/dev/null 2>&1; then
  pm2 status | sed -n '1,12p'
else
  echo "PM2 not installed - skipped"
fi

echo "SETUP_VERIFY_SUCCESS"
