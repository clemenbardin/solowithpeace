# ── Stage 1 : dépendances de production ──────────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2 : développement (hot-reload) ─────────────────────────────────────
FROM node:24-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# ── Stage 3 : production ──────────────────────────────────────────────────────
FROM node:24-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nodeserver

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN mkdir -p /app/db && chown -R nodeserver:nodejs /app/db

USER nodeserver
EXPOSE 5000
CMD ["node", "index.js"]
