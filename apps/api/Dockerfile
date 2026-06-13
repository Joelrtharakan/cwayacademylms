# ── Stage 1: Build ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for Puppeteer (certificate PDF)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy monorepo root files
COPY package*.json turbo.json ./
COPY packages/db/package*.json ./packages/db/
COPY apps/api/package*.json ./apps/api/

# Install all dependencies
RUN npm ci --workspace=apps/api --workspace=packages/db

# Copy source files
COPY packages/db/ ./packages/db/
COPY apps/api/    ./apps/api/

# Generate Prisma client
RUN npx prisma generate --schema=./packages/db/prisma/schema.prisma

# Build TypeScript
RUN npm run build --workspace=apps/api

# ── Stage 2: Production runner ───────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install Chromium for Puppeteer (certificate generation)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy built files and dependencies
COPY --from=builder /app/node_modules         ./node_modules
COPY --from=builder /app/packages/db          ./packages/db
COPY --from=builder /app/apps/api/dist        ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/

# Copy Prisma schema for migrations
COPY --from=builder /app/packages/db/prisma   ./packages/db/prisma

EXPOSE 5000

# Run migrations then start the server
CMD ["sh", "-c", \
  "npx prisma migrate deploy --schema=./packages/db/prisma/schema.prisma && \
   node apps/api/dist/server.js"]
