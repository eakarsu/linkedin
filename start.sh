#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${RUNTIME_PROJECT_SOURCE:-$SCRIPT_DIR}"

if [[ ! -f "$PROJECT_DIR/package.json" || ! -d "$PROJECT_DIR/node_modules" ]]; then
  echo "Project dependencies are missing; run npm ci before startup." >&2
  exit 1
fi

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${NEXTAUTH_SECRET:?NEXTAUTH_SECRET is required}"

APP_PORT="${BACKEND_PORT:-${PORT:-3000}}"
if [[ ! "$APP_PORT" =~ ^[0-9]+$ ]] || (( APP_PORT < 1024 || APP_PORT > 65535 )); then
  echo "BACKEND_PORT must be an integer from 1024 through 65535." >&2
  exit 1
fi

if [[ ${#NEXTAUTH_SECRET} -lt 32 ]]; then
  echo "NEXTAUTH_SECRET must contain at least 32 characters." >&2
  exit 1
fi

if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:"$APP_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port $APP_PORT is already in use; no process was changed." >&2
  exit 1
fi

export PORT="$APP_PORT"
export NEXTAUTH_URL="${NEXTAUTH_URL:-http://127.0.0.1:$APP_PORT}"
cd "$PROJECT_DIR"
exec "$PROJECT_DIR/node_modules/.bin/next" dev --webpack --hostname 127.0.0.1 --port "$APP_PORT"
