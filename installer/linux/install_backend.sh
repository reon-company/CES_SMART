#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

echo "== CES SmartFarm backend installer =="
echo "ROOT: $ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: node is not installed."
  echo "Install Node.js 18+ first."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed."
  exit 1
fi

echo "Node: $(node -v)"
echo "NPM : $(npm -v)"

cd "$BACKEND_DIR"

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "Created backend/.env from .env.example"
  else
    echo "Error: backend/.env.example not found"
    exit 1
  fi
else
  echo "Keeping existing backend/.env"
fi

echo "Installing backend dependencies..."
npm install

if command -v pm2 >/dev/null 2>&1; then
  echo "Starting backend with PM2..."
  pm2 start ecosystem.config.js --only ces-smartfarm || pm2 restart ces-smartfarm
  pm2 save || true
  echo "PM2 status:"
  pm2 status
else
  echo "PM2 not found. Start manually with:"
  echo "  cd backend && npm start"
fi

echo ""
echo "Done."
echo "Next:"
echo "1) Edit backend/.env"
echo "2) Apply DB schema: backend/database/schema.sql"
echo "3) Check health: curl http://localhost:3000/api/health"
