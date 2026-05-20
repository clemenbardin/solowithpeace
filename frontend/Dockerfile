# ── Stage 1 : installation des dépendances ───────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Stage 2 : build de production ────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_API_URL doit être disponible au build (rewrites next.config.ts)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Stage 3 : développement (hot-reload) ─────────────────────────────────────
FROM node:24-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["npm", "run", "dev"]

# ── Stage 4 : production (standalone) ────────────────────────────────────────
FROM node:24-alpine AS production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copie les fichiers publics
COPY --from=builder /app/public ./public

# Copie le standalone - CORRECTION ICI
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copie les fichiers statiques
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Vérifie que server.js existe (debug)
RUN ls -la

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Le server.js est à la racine du dossier standalone
CMD ["node", "server.js"]