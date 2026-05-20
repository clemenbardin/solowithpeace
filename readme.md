# SoloWithPeace — Plateforme de mise en relation pour voyageurs solos

**SoloWithPeace** est une plateforme sociale destinée aux voyageurs solos : connexions temporaires, voyages groupés, activités partagées et témoignages de voyageurs.

Stack : **Next.js 16** (frontend) · **Express 5** (backend) · **MongoDB 7** · **Prometheus + Grafana** (monitoring)

---

## Équipe et répartition

| Membre | Rôle | Responsabilités |
|--------|------|-----------------|
| **Jordan Jimenez** | Lead DevOps / Backend | Infrastructure Docker, CI/CD, monitoring Prometheus/Grafana, API Express |
| **Branis Kaci** | Fullstack | Routes backend, modèles MongoDB, composants frontend |
| **Clément Bardin** | Frontend / QA | Pages Next.js, tests React Testing Library, UX |

---

## Sommaire

- [Architecture](#architecture)
- [Démarrage rapide](#démarrage-rapide)
- [Structure du projet](#structure-du-projet)
- [Stack technique](#stack-technique)
- [Variables d'environnement](#variables-denvironnement)
- [API REST](#api-rest)
- [Tests](#tests)
- [Pipeline CI/CD](#pipeline-cicd)
- [Monitoring](#monitoring)
- [Production](#production)
- [Documentation](#documentation)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Navigateur (port 3000)                    │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTP
┌───────────────────────────▼──────────────────────────────────┐
│  solo-network (Docker bridge)                                │
│                                                              │
│  ┌──────────────────┐   /api/* proxy   ┌─────────────────┐  │
│  │   Next.js 16     │ ───────────────► │   Express 5     │  │
│  │   :3000          │                  │   :5000         │  │
│  └──────────────────┘                  └────────┬────────┘  │
│                                                 │ Mongoose  │
│  ┌──────────────────────────────────────┐  ┌────▼─────────┐ │
│  │  Stack Monitoring                    │  │  MongoDB 7   │ │
│  │  Prometheus     :9090                │  │  :27017      │ │
│  │  Grafana        :3001                │  └─────────────-┘ │
│  │  Alertmanager   :9093                │                   │
│  │  Node Exporter  :9100                │                   │
│  │  Loki           :3100                │                   │
│  │  Promtail       (agent logs)         │                   │
│  └──────────────────────────────────────┘                   │
└──────────────────────────────────────────────────────────────┘
```

Voir [docs/architecture.md](docs/architecture.md) pour les diagrammes détaillés et les choix techniques justifiés.

---

## Démarrage rapide

### Prérequis

- **Docker** et **Docker Compose** (recommandé)
- ou **Node.js 20+** pour le mode développement local

### Option 1 — Docker Compose (recommandé)

```bash
# 1. Cloner le projet
git clone https://github.com/VOTRE_ORG/solowithpeace.git
cd solowithpeace

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env : renseigner MONGO_URI et JWT_SECRET

# 3. Démarrer tous les services
docker compose up -d

# 4. Peupler la base de données (première fois)
docker compose exec backend npm run seed
```

**Services disponibles :**

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Interface utilisateur Next.js |
| Backend API | http://localhost:5000 | API REST Express |
| Health check | http://localhost:5000/api/health | État du service |
| Métriques | http://localhost:5000/metrics | Endpoint Prometheus scrape |
| Prometheus | http://localhost:9090 | Interface de requêtage PromQL |
| Grafana | http://localhost:3001 | Dashboards (admin / solowithpeace_admin) |
| Alertmanager | http://localhost:9093 | Gestion des alertes |

### Option 2 — Développement local (sans Docker)

```bash
# Backend
cd backend
npm install
cp .env.example .env    # adapter MONGO_URI et JWT_SECRET
npm run dev             # → http://localhost:5000

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev             # → http://localhost:3000
```

### Commandes Docker utiles

```bash
# Voir les logs en temps réel
docker compose logs -f

# Arrêter les services
docker compose down

# Reset complet (supprime les volumes)
docker compose down -v

# Rebuild après modification du code
docker compose up --build

# Accéder au shell d'un container
docker compose exec backend sh
docker compose exec frontend sh

# Réinitialiser la base de données
docker compose exec backend npm run seed:reset
```

---

## Structure du projet

```
solowithpeace/
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Lint + tests (matrix Node 20/22)
│       ├── docker.yml              # Build & push images (main + tags)
│       └── deploy-staging.yml      # Images staging (develop)
├── .husky/
│   └── pre-commit                  # Hook ESLint pré-commit
├── backend/
│   ├── __tests__/                  # Tests Jest + Supertest
│   ├── db/                         # Connexion MongoDB + script seed
│   ├── middleware/
│   │   └── metrics.js              # Métriques Prometheus (prom-client)
│   ├── models/                     # Schémas Mongoose (User, Trip, Activity, Testimonial)
│   ├── routes/                     # Handlers Express (auth, trips, activities, testimonials)
│   ├── app.js                      # Configuration Express + middleware
│   ├── index.js                    # Point d'entrée serveur
│   └── Dockerfile                  # Multi-stage : development / production
├── frontend/
│   ├── __tests__/                  # Tests Jest + React Testing Library
│   ├── app/                        # Pages Next.js (App Router)
│   │   ├── dashboard/              # Tableau de bord utilisateur
│   │   ├── login/                  # Page de connexion
│   │   └── register/               # Page d'inscription
│   ├── context/
│   │   └── AuthContext.js          # Gestion état authentification
│   ├── next.config.ts              # Proxy /api/* → backend:5000
│   └── Dockerfile                  # Multi-stage : development / production
├── monitoring/
│   ├── prometheus/
│   │   ├── prometheus.yml          # Scrape configs + rétention 30 jours
│   │   └── rules/
│   │       ├── alerts.yml          # 5 règles d'alerte (Golden Signals + SLO)
│   │       └── slo_recording.yml   # Recording rules SLO availability + latence
│   ├── alertmanager/
│   │   └── alertmanager.yml        # Routing + notifications email
│   ├── grafana/
│   │   ├── provisioning/           # Datasources + dashboards auto-provisionnés
│   │   └── dashboards/             # JSON : Golden Signals, Métier, SLO
│   ├── loki/
│   │   └── loki-config.yml         # Logs centralisés, rétention 7 jours
│   └── promtail/
│       └── promtail-config.yml     # Collecte logs Docker backend
├── docs/
│   ├── architecture.md             # Architecture + choix techniques justifiés
│   ├── database.md                 # Schémas MongoDB, seed, comptes de test
│   ├── devops.md                   # Workflow Git, CI/CD, tests, déploiement
│   ├── sre-production.md           # SLO, runbooks, procédures d'incident
│   └── retrospective.md            # Retour d'expérience
├── docker-compose.yml              # Environnement complet (dev + monitoring)
├── docker-compose.prod.yml         # Overrides production
├── .env.example                    # Template variables d'environnement
├── CONTRIBUTING.md                 # Guide de contribution
└── README.md
```

---

## Stack technique

| Couche | Technologie | Version | Justification |
|--------|-------------|---------|---------------|
| **Frontend** | Next.js + React | 16 / 19 | SSR, App Router, TypeScript natif, SEO |
| **Styling** | Tailwind CSS | 4 | Utilitaire, pas de CSS custom, cohérence UI |
| **Backend** | Express | 5 | Léger, flexible, vaste écosystème |
| **Runtime** | Node.js (Alpine) | 24 | LTS récent, image Docker minimale |
| **Base de données** | MongoDB + Mongoose | 7 / 8 | Flexibilité schéma, hébergement Atlas cloud |
| **Authentification** | JWT + bcryptjs | — | Stateless, adapté aux API REST |
| **Métriques** | prom-client | 15 | Standard de facto Prometheus/Node.js |
| **Logs** | Winston + Loki | — | JSON structuré, centralisation temps réel |
| **Monitoring** | Prometheus + Grafana | 2.51 / 10.4 | Stack SRE industrielle standard |
| **Alerting** | Alertmanager | 0.27 | Routing, déduplication, silences |
| **Tests** | Jest + Supertest + RTL | 29 | Couverture unitaire + intégration |
| **CI/CD** | GitHub Actions | — | Natif GitHub, gratuit, matrix builds |
| **Conteneurs** | Docker multi-stage | — | Images optimisées, séparation dev/prod |
| **Qualité** | ESLint v9 + Husky | — | Cohérence code, pre-commit bloquant |

---

## Variables d'environnement

Copier `.env.example` vers `.env` et adapter les valeurs :

```env
# MongoDB Atlas
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/?appName=SolowithPeace
MONGO_DB_NAME=solowithpeace

# Backend
JWT_SECRET=changer_ce_secret_en_production_64_caracteres_minimum
NODE_ENV=development
PORT=5000

# Monitoring Grafana
GRAFANA_ADMIN_PASSWORD=solowithpeace_admin
```

Le frontend utilise un proxy Next.js (`next.config.ts`) qui redirige `/api/*` vers le backend : aucune variable côté frontend n'est nécessaire en développement.

---

## API REST

### Authentification

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/api/auth/register` | Non | Créer un compte (email, password, name) |
| `POST` | `/api/auth/login` | Non | Se connecter → retourne JWT (7 jours) |
| `POST` | `/api/auth/logout` | Non | Déconnexion (stateless côté serveur) |
| `GET` | `/api/auth/me` | Bearer JWT | Profil de l'utilisateur courant |

### Voyages (Trips)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/api/trips` | Non | Lister les voyages (params : `category`, `limit`) |
| `GET` | `/api/trips/:id` | Non | Détail d'un voyage |
| `POST` | `/api/trips/:id/join` | Bearer JWT | Rejoindre un voyage (décrémente `spots_left`) |

### Activités

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/api/activities` | Non | Lister (triées par nb participants desc) |
| `GET` | `/api/activities/:id` | Non | Détail d'une activité |

### Témoignages

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/api/testimonials` | Non | Lister tous les témoignages |

### Système

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/api/health` | Non | `{ status: "OK", timestamp }` |
| `GET` | `/metrics` | Non | Métriques Prometheus (scrape interne) |

**Authentification :** header `Authorization: Bearer <token>`. Retourne 401 si absent ou expiré.

---

## Tests

### Lancer les tests

```bash
# Backend
cd backend
npm test                  # Tous les tests
npm run test:coverage     # Avec rapport HTML dans backend/coverage/

# Frontend
cd frontend
npm test
npm run test:coverage     # Rapport dans frontend/coverage/
```

### Résultats

| Projet | Tests | Couverture lignes |
|--------|-------|-------------------|
| Backend | 30/30 | **97%** |
| Frontend | 9/9 | **> 60%** |

### Architecture des tests

**Backend** — Jest + Supertest + MongoDB Memory Server :

| Fichier | Scénarios couverts |
|---------|-------------------|
| `health.test.js` | `/api/health` retourne OK, 404 sur route inconnue |
| `auth.test.js` | Register (succès, email dupliqué, champs manquants), login (succès, mauvais mdp), `/me` (token valide/invalide) |
| `trips.test.js` | Listing, filtre par catégorie, détail, join (succès, plus de places, non authentifié) |
| `activities.test.js` | Listing, tri par participants, détail, 404 |
| `testimonials.test.js` | Listing, structure des champs |

Chaque suite de test démarre une base MongoDB en mémoire (`mongodb-memory-server`) pour une isolation totale — aucune donnée de test ne persiste.

**Frontend** — Jest + React Testing Library :

| Fichier | Scénarios couverts |
|---------|-------------------|
| `AuthContext.test.jsx` | Initialisation, `login()`, `register()`, `logout()`, restauration de session depuis localStorage |

### Seuil CI bloquant

La pipeline échoue si la couverture descend sous **60%** sur `statements`, `branches`, `functions` ou `lines` (configuré dans `jest.config.js`).

---

## Pipeline CI/CD

### Workflows GitHub Actions

| Workflow | Déclencheur | Jobs |
|----------|-------------|------|
| `ci.yml` | Push / PR → `main`, `develop` | Lint backend + frontend, tests matrix Node 20/22 |
| `docker.yml` | Push → `main` ou tag `v*.*.*` | Build & push images production vers GHCR |
| `deploy-staging.yml` | Push → `develop` | Build & push images staging vers GHCR |

### Flux CI

```
Push → lint-backend ──┐
     → lint-frontend ──┼──► test-backend  (Node 20) ──┐
                       │  ► test-backend  (Node 22) ──┼──► ci-success
                       │  ► test-frontend (Node 20) ──┤
                       └──► test-frontend (Node 22) ──┘
```

Un job en échec bloque le merge de la Pull Request.

### Gestion des secrets

Les secrets CI (tokens GHCR) sont stockés dans GitHub Secrets. Aucun secret n'est commité dans le dépôt.

---

## Monitoring

La stack de monitoring démarre automatiquement avec `docker compose up`. Grafana est auto-provisionné avec les datasources et les 3 dashboards.

### Dashboards Grafana

| Dashboard | Panneaux clés |
|-----------|--------------|
| **Golden Signals** | Latence P50/P95/P99 · Taux d'erreur · Trafic RPS · Saturation CPU/mémoire · Event loop lag |
| **Métriques Métier** | Taux de conversion join voyage · Volume auth · Top endpoints · Inscriptions 24h |
| **SLO & Error Budget** | Disponibilité 30j · Budget d'erreur restant · Burn rate · Compliance latence |

### SLO

| SLO | Objectif | Budget d'erreur mensuel |
|-----|----------|------------------------|
| Disponibilité | 99.9% requêtes non-5xx | 43.2 minutes / mois |
| Latence P95 | < 500ms | 5% des requêtes autorisées > 500ms |

### Alertes (5)

| Alerte | Condition | Sévérité |
|--------|-----------|---------|
| `HighErrorRate` | > 5% erreurs 5xx sur 5 min | Critical |
| `HighP95Latency` | P95 > 500ms sur 3 min | Warning |
| `BackendServiceDown` | Service injoignable 1 min | Critical |
| `HighCPUSaturation` | CPU > 80% sur 5 min | Warning |
| `ErrorBudgetBurnFast` | Burn rate > 14.4× sur 1h | Critical |

Les notifications sont envoyées par email à l'équipe. Voir [docs/sre-production.md](docs/sre-production.md) pour les runbooks.

---

## Production

```bash
# Déploiement production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Le fichier `docker-compose.prod.yml` applique les overrides suivants :
- Stage `production` des Dockerfiles (images minimales, sans devDependencies)
- Volumes bind-mount supprimés (code embarqué dans l'image)
- Ports monitoring non exposés publiquement
- Limites CPU/mémoire définies
- Variables sensibles chargées depuis `.env.prod` (non commité)

Voir [docs/sre-production.md](docs/sre-production.md) pour la procédure complète et les runbooks.

---

## Qualité de code

### Linting

```bash
cd backend && npm run lint        # Vérifier
cd backend && npm run lint:fix    # Corriger automatiquement

cd frontend && npm run lint
cd frontend && npm run lint:fix
```

**Règles ESLint actives :** `no-unused-vars` · `eqeqeq` · `no-var` · `prefer-const` · `no-trailing-spaces`

### Pre-commit (Husky + lint-staged)

```bash
# Installation (racine du projet)
npm install
```

Husky configure automatiquement un hook `pre-commit` qui exécute ESLint sur les fichiers stagés. Un commit est bloqué si des erreurs sont détectées.

---

## Documentation

| Document | Contenu |
|----------|---------|
| [docs/architecture.md](docs/architecture.md) | Diagrammes, stack, choix techniques justifiés |
| [docs/database.md](docs/database.md) | Schémas MongoDB, données de seed, comptes de test |
| [docs/devops.md](docs/devops.md) | Workflow Git, pipeline CI/CD, stratégie de tests, déploiement, monitoring |
| [docs/sre-production.md](docs/sre-production.md) | SLO, procédures d'incident, runbooks, métriques clés |
| [docs/retrospective.md](docs/retrospective.md) | Difficultés rencontrées, améliorations futures, leçons apprises |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guide de contribution, conventions |
