# Stage 1: Base
FROM node:20-slim AS base
WORKDIR /app
ENV PORT=8000

# Stage 2: Dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
# Install all dependencies (included devDeps for build tools)
RUN npm ci

# Stage 3: Builder
FROM deps AS builder
# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build && npm run swagger

# Stage 4: Runner (Production)
FROM base AS runner
ENV NODE_ENV=production

# Install Chromium and necessary fonts for Puppeteer
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-ipafont-gothic \
  fonts-wqy-zenhei \
  fonts-thai-tlwg \
  fonts-kacst \
  fonts-freefont-ttf \
  libxss1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use the installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Run as non-root user
# Node official images come with a generic 'node' user
RUN chown -R node:node /app
USER node

# Install production dependencies only
COPY --chown=node:node package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy built artifacts and Prisma client
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --chown=node:node --from=builder /app/swagger-output.json ./swagger-output.json

# Copy templates for rendering
COPY --chown=node:node src/templates ./dist/templates

# Create upload directory
RUN mkdir -p /app/uploads && chown node:node /app/uploads

# Healthcheck targeting our /api/v1/health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/v1/health || exit 1

EXPOSE 8000
CMD ["npm", "start"]
