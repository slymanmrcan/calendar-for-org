#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL tanımlı değil."
  exit 1
fi

echo "Running Prisma migrations..."
npx --no-install prisma migrate deploy
