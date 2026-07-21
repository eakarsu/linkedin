#!/usr/bin/env bash
set -euo pipefail

# This wrapper intentionally does not install packages, start services, write
# secrets, delete caches, kill ports, migrate, or seed. Operators own those
# explicit lifecycle steps; application startup is read-only.
: "${DATABASE_URL:?DATABASE_URL is required; see .env.example}"
exec "$(dirname "$0")/start.sh"
