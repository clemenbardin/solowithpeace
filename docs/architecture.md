# Architecture — SoloWithPeace

## Vue d'ensemble

SoloWithPeace est une application web de mise en relation de voyageurs solos, suivant une architecture **client-serveur découplée** avec une API REST et une stack de monitoring SRE complète.

---

## Diagramme applicatif

```
┌────────────────────────────────────────────────────────────────────┐
│                       Navigateur utilisateur                       │
└───────────────────────────────┬────────────────────────────────────┘
                                │ HTTP :3000
┌───────────────────────────────▼────────────────────────────────────┐
│  FRONTEND  —  Next.js 16 (App Router, TypeScript)                  │
│                                                                    │
│   app/page.tsx          → Page d'accueil (trips, activités, tém.)  │
│   app/login/            → Authentification                         │
│   app/register/         → Inscription                              │
│   app/dashboard/        → Espace utilisateur                       │
│   context/AuthContext   → State global JWT (localStorage)          │
│   app/api/[...path]/    → Proxy runtime /api/* → BACKEND_URL       │
└───────────────────────────────┬────────────────────────────────────┘
                                │ HTTP proxy /api/*  (solo-network)
┌───────────────────────────────▼────────────────────────────────────┐
│  BACKEND  —  Express 5 (Node.js 24, CommonJS)                      │
│                                                                    │
│   GET  /api/health              → Health check                     │
│   GET  /metrics                 → Métriques Prometheus             │
│   POST /api/auth/register|login → Authentification JWT             │
│   GET  /api/auth/me             → Profil (Bearer token)            │
│   GET  /api/trips               → Voyages (filtre, limit)          │
│   POST /api/trips/:id/join      → Inscription voyage (auth)        │
│   GET  /api/activities          → Activités                        │
│   GET  /api/testimonials        → Témoignages                      │
│                                                                    │
│   middleware/metrics.js  → prom-client (Golden Signals + métier)   │
└─────────────────────┬──────────────────────────────────────────────┘
                      │ Mongoose ODM
┌─────────────────────▼──────────────────────────────────────────────┐
│  BASE DE DONNÉES  —  MongoDB 7 (Atlas cloud)                       │
│                                                                    │
│   Collection users        → Comptes utilisateurs                   │
│   Collection trips        → Voyages groupés                        │
│   Collection activities   → Activités disponibles                  │
│   Collection testimonials → Témoignages voyageurs                  │
└────────────────────────────────────────────────────────────────────┘
```

---

## Diagramme infrastructure (Docker)

```
┌────────────────────────────────────────────────────────────────────┐
│  solo-network  (Docker bridge)                                     │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ solo-frontend│  │ solo-backend │  │ solo-mongo               │ │
│  │ :3000        │  │ :5000        │  │ :27017 (interne)         │ │
│  │ Next.js      │  │ Express 5    │  │ MongoDB 7                │ │
│  │ node:24-alp  │  │ node:24-alp  │  │ mongo:7                  │ │
│  └──────────────┘  └──────┬───────┘  └──────────────────────────┘ │
│                           │ /metrics (scrape interne)              │
│  ┌──────────────┐  ┌──────▼───────┐  ┌──────────────────────────┐ │
│  │ solo-grafana │  │solo-prometheus│  │ solo-alertmanager        │ │
│  │ :3001        │  │ :9090        │  │ :9093                    │ │
│  │ Grafana 10.4 │◄─┤ Prom 2.51    ├─►│ Alertmgr 0.27           │ │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘ │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐                               │
│  │solo-node-exp │  │  solo-loki   │◄── solo-promtail              │
│  │ :9100        │  │ :3100        │    (agent logs Docker)        │
│  │ Node Exporter│  │ Loki 2.9     │                               │
│  └──────────────┘  └──────────────┘                               │
└────────────────────────────────────────────────────────────────────┘
```

### Volumes Docker

| Volume | Contenu | Service |
|--------|---------|---------|
| `mongo_data` | Données MongoDB | solo-mongo |
| `backend_node_modules` | Dépendances backend (cache) | solo-backend |
| `frontend_node_modules` | Dépendances frontend (cache) | solo-frontend |
| `frontend_next` | Cache de build Next.js | solo-frontend |
| `prometheus_data` | Métriques (rétention 30j) | solo-prometheus |
| `grafana_data` | Dashboards, utilisateurs, sessions | solo-grafana |
| `alertmanager_data` | État des silences | solo-alertmanager |
| `loki_data` | Logs (rétention 7j) | solo-loki |

---

## Ports exposés

| Port | Service | Accès | Usage |
|------|---------|-------|-------|
| 3000 | Frontend Next.js | Public | Interface utilisateur |
| 5000 | Backend Express | Public | API REST (via proxy frontend) |
| 9090 | Prometheus | Dev/Ops | Requêtage PromQL |
| 3001 | Grafana | Dev/Ops | Dashboards monitoring |
| 9093 | Alertmanager | Dev/Ops | Gestion alertes |
| 9100 | Node Exporter | Dev/Ops | Métriques hôte |
| 3100 | Loki | Interne | Collecte logs |
| 27017 | MongoDB | Interne Docker | Base de données |

En production (`docker-compose.prod.yml`), seuls les ports 3000 et 5000 sont exposés publiquement.

---

## Flux d'authentification

```
1. Client → POST /api/auth/login { email, password }
           ← 200 { token: "eyJ...", user: {...} }

2. Client stocke le token dans localStorage

3. Client → GET /api/auth/me
            Authorization: Bearer eyJ...
           ← 200 { id, name, email, role }

4. Client → POST /api/trips/:id/join
            Authorization: Bearer eyJ...
           ← 200 { message: "Inscription confirmée", trip_id }

5. Token expiré après 7 jours → 401 Unauthorized → redirection login
```

**Sécurité :**
- Mots de passe hashés avec bcryptjs (rounds : 10)
- JWT signé avec `JWT_SECRET` (variable d'environnement obligatoire)
- Pas de token stocké côté serveur (stateless)

---

## Flux de monitoring

```
1. Chaque requête HTTP → middleware metrics.js (prom-client)
   → Histogramme latence, compteur requêtes, compteur erreurs 5xx

2. Prometheus scrape → backend:5000/metrics toutes les 15s
   → Stockage local (rétention 30 jours)
   → Évaluation des règles d'alerte toutes les 15s

3. Seuil franchi → Alertmanager
   → Groupement, déduplication
   → Notification email jordan.jimenez@eslc.fr

4. Grafana → interroge Prometheus (datasource auto-provisionné)
   → 3 dashboards : Golden Signals, Métier, SLO

5. Promtail → collecte logs JSON backend (via Docker socket)
   → Loki (indexation par labels)
   → Grafana Explore (requêtage LogQL)
```

---

## Stack technique complète

### Frontend

| Technologie | Version | Rôle |
|-------------|---------|------|
| Next.js | 16.2.1 | Framework React (App Router, SSR, proxy API) |
| React | 19.2.4 | Librairie UI |
| TypeScript | 5 | Typage statique |
| Tailwind CSS | 4 | Styling utilitaire |
| Axios | 1.13 | Client HTTP pour les appels API |
| Jest + RTL | 29 / 16 | Tests unitaires composants |

### Backend

| Technologie | Version | Rôle |
|-------------|---------|------|
| Node.js | 24-alpine | Runtime JavaScript |
| Express | 5.2.1 | Framework web HTTP |
| Mongoose | 8.0 | ODM MongoDB |
| jsonwebtoken | 9.0 | Génération/validation tokens JWT |
| bcryptjs | 3.0 | Hashage mots de passe |
| cors | 2.8 | Middleware CORS |
| dotenv | 17.3 | Chargement variables .env |
| prom-client | 15.1 | Exposition métriques Prometheus |
| Winston | 3.14 | Logging structuré JSON |
| Jest + Supertest | 29 / 7 | Tests unitaires API |

### Monitoring

| Technologie | Version | Rôle |
|-------------|---------|------|
| Prometheus | 2.51.2 | Collecte et stockage métriques |
| Grafana | 10.4.2 | Visualisation dashboards |
| Alertmanager | 0.27.0 | Gestion et routage alertes |
| Node Exporter | 1.7.0 | Métriques système hôte |
| Loki | 2.9.5 | Agrégation et indexation logs |
| Promtail | 2.9.5 | Agent collecte logs Docker |

### Infrastructure

| Technologie | Version | Rôle |
|-------------|---------|------|
| Docker | — | Conteneurisation |
| Docker Compose | — | Orchestration locale |
| GitHub Actions | — | CI/CD (lint, tests, build, push) |
| GHCR | — | Registry images Docker |
| MongoDB Atlas | 7 | Base de données cloud |

---

## Choix techniques justifiés

### MongoDB (vs PostgreSQL)

MongoDB a été choisi pour sa **flexibilité de schéma**, adaptée à un prototype évoluant rapidement. Les entités métier (voyages, activités) ont des attributs variables selon le contexte. Mongoose apporte la validation de schéma sans rigidité relationnelle.

### Express 5 (vs Fastify, Nest.js)

Express est le framework Node.js le plus répandu, avec le plus grand écosystème de middlewares. La v5 apporte la gestion native des erreurs async sans try/catch explicite. Fastify aurait été plus performant, mais Express suffisait pour le volume de requêtes attendu et était plus familier à l'équipe.

### Next.js App Router (vs Pages Router)

Le projet utilise Next.js 16 avec l'App Router pour bénéficier du **server-side rendering** et de la colocation des composants. Le proxy natif (`rewrites` dans `next.config.ts`) évite les problèmes CORS en développement.

### Dockerfiles multi-stage

Chaque Dockerfile possède un stage `development` (nodemon, toutes les devDependencies) et un stage `production` (image minimale, utilisateur non-root, pas de devDependencies). Cela réduit la taille des images de production de ~400MB à ~120MB et minimise la surface d'attaque.

### prom-client pour les métriques

`prom-client` est la librairie officielle Prometheus pour Node.js. Elle expose nativement les métriques Node.js (`collectDefaultMetrics`) et permet d'ajouter des métriques custom. L'endpoint `/metrics` (hors `/api/`) est scrapeé par Prometheus toutes les 15 secondes.

### Loki + Promtail pour les logs

Loki centralise les logs structurés JSON émis par Winston. Contrairement à Elasticsearch, Loki n'indexe que les labels (container, level, route), ce qui le rend léger. Promtail collecte automatiquement les logs des containers Docker via le socket Unix.

### Alertes symptôme-based

Les 5 alertes sont définies sur des **symptômes utilisateur** (taux d'erreur élevé, latence dégradée, service injoignable) plutôt que sur des causes (processus CPU, I/O disque). Cette approche SRE réduit les faux positifs et garantit que chaque alerte correspond à un impact réel.
