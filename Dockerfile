# -----------------------------
# Base image
# -----------------------------
FROM node:20-slim AS base
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# -----------------------------
# Dependencies
# -----------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# -----------------------------
# Build
# -----------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy DATABASE_URL (Prisma generate için)
ARG DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dummy"
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate
RUN npm run build

# -----------------------------
# Runner (Production)
# -----------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV PRISMA_CONFIG_PATH=/app/prisma.config.js

# Next standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma schema + config
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.js ./prisma.config.js
COPY --from=builder /app/package.json ./package.json

# Migration + Seed scriptleri
COPY --from=builder /app/scripts ./scripts

# Prisma runtime engine
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Entrypoint
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh && chmod +x ./scripts/*.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
