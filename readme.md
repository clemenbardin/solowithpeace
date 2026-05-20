# SoloWithPeace — Plateforme de mise en relation pour voyageurs solos

[![CI](https://github.com/VOTRE_ORG/solowithpeace/actions/workflows/ci.yml/badge.svg)](https://github.com/VOTRE_ORG/solowithpeace/actions/workflows/ci.yml)
[![Docker](https://github.com/VOTRE_ORG/solowithpeace/actions/workflows/docker.yml/badge.svg)](https://github.com/VOTRE_ORG/solowithpeace/actions/workflows/docker.yml)

**SoloWithPeace** est une plateforme sociale destinée aux voyageurs solos : connexions temporaires, voyages groupés, activités et témoignages.

Stack : **Next.js 16** (frontend) + **Express 5** (backend) + **MongoDB** / **Mongoose**

---

## Structure du projet

```
solowithpeace/
├── .github/
│   └── workflows/
│       ├── ci.yml          # Pipeline CI (lint + tests + matrix)
│       └── docker.yml      # Build & push images Docker
├── .husky/
│   └── pre-commit          # Hook pré-commit (lint-staged)
├── backend/                # API Express
│   ├── __tests__/          # Tests unitaires (Jest + Supertest)
│   ├── db/
│   ├── routes/
│   ├── app.js
│   ├── index.js
│   ├── eslint.config.mjs   # ESLint strict backend
│   ├── jest.config.js
│   └── Dockerfile          # Multi-stage (dev / production)
├── frontend/               # App Next.js
│   ├── __tests__/          # Tests unitaires (Jest + RTL)
│   ├── app/
│   ├── context/
│   ├── eslint.config.mjs   # ESLint strict (Next + règles custom)
│   ├── jest.config.js
│   └── Dockerfile          # Multi-stage (dev / builder / production)
├── docker-compose.yml      # Environnement de développement complet
├── package.json            # Husky + lint-staged (racine)
└── README.md
```

---

## Démarrage rapide

### Prérequis

- **Node.js** 20+ et **npm**
- **Docker** et **Docker Compose** (pour la conteneurisation)

### Option 1 — Local (sans Docker)

```bash
# Backend
cd backend
npm install
cp .env.example .env     # adapter JWT_SECRET
npm run dev              # http://localhost:5000

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev              # http://localhost:3000
```

### Option 2 — Docker Compose (développement)

```bash
# Lancer l'ensemble de l'application
docker-compose up --build

# En arrière-plan
docker-compose up -d --build

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:3000  |
| Backend  | http://localhost:5000  |
| Health   | http://localhost:5000/api/health |

---

## Docker

### Dockerfiles multi-stage

Les deux Dockerfiles utilisent une architecture **multi-stage** pour optimiser les images :

**Backend** (`backend/Dockerfile`) :

| Stage         | Description                          |
|---------------|--------------------------------------|
| `deps`        | Installation des dépendances de prod |
| `development` | Hot-reload avec nodemon              |
| `production`  | Image minimale, utilisateur non-root |

**Frontend** (`frontend/Dockerfile`) :

| Stage         | Description                             |
|---------------|-----------------------------------------|
| `deps`        | Installation des dépendances            |
| `builder`     | Build Next.js (`output: standalone`)    |
| `development` | Hot-reload avec polling                 |
| `production`  | Image standalone minimale, non-root     |

### Commandes Docker utiles

```bash
# Build uniquement le backend en production
docker build --target production -t solowithpeace/backend:latest ./backend

# Build uniquement le frontend en production
docker build --target production -t solowithpeace/frontend:latest ./frontend

# Inspecter les layers d'une image
docker history solowithpeace/backend:latest

# Supprimer les images inutilisées
docker image prune -f
```

### Volumes persistants

| Volume                  | Contenu                         |
|-------------------------|---------------------------------|
| `sqlite_data`           | Base de données SQLite          |
| `backend_node_modules`  | Dépendances backend             |
| `frontend_node_modules` | Dépendances frontend            |
| `frontend_next`         | Cache de build Next.js          |

---

## Variables d'environnement

### Backend (`backend/.env`)

```env
PORT=5000
JWT_SECRET=votre_secret_jwt_fort_ici
NODE_ENV=development
```

### Frontend

Le frontend utilise un proxy Next.js (`next.config.ts`) qui redirige `/api/*` vers le backend. Aucune variable d'environnement n'est requise en développement local.

---

## Tests

### Lancer les tests

```bash
# Backend
cd backend
npm test                  # Tous les tests
npm run test:coverage     # Avec rapport de couverture

# Frontend
cd frontend
npm test
npm run test:coverage
```

### Résultats actuels

| Projet   | Tests | Couverture lignes |
|----------|-------|-------------------|
| Backend  | 30/30 | **97%**           |
| Frontend | 9/9   | **> 60%**         |

### Architecture des tests

**Backend** (`backend/__tests__/`) — Jest + Supertest :
- `health.test.js` — endpoint `/api/health` et gestion 404
- `auth.test.js` — register, login, logout, `/me`
- `trips.test.js` — listing, filtres, détail, inscription
- `activities.test.js` — listing, tri, détail
- `testimonials.test.js` — listing, structure
- `flags.test.js` — feature flags, lecture et administration

En mode `NODE_ENV=test`, la base de données utilise **MongoDB Memory Server** pour une isolation complète et des tests d'intégration réels.

**Frontend** (`frontend/__tests__/`) — Jest + React Testing Library :
- `AuthContext.test.jsx` — initialisation, login, register, logout, restauration de session

### Couverture minimale

La couverture est vérifiée automatiquement. Le pipeline échoue si elle tombe en dessous de **60%** sur l'une de ces métriques : `statements`, `branches`, `functions`, `lines`.

---

## Pipeline CI/CD

### GitHub Actions

| Workflow | Déclencheur | Jobs |
|----------|-------------|------|
| `ci.yml` | Push/PR sur `main`/`develop` | Lint backend, lint frontend, tests backend ×2 runtimes, tests frontend ×2 runtimes |
| `docker.yml` | Push sur `main`, tags `v*.*.*` | Build & push images vers GHCR |
| `deploy-staging.yml` | Push sur `develop` | Build & publish staging Docker images |

### Matrix de runtimes

Les tests sont exécutés sur **Node.js 20.x** et **22.x** en parallèle. Le pipeline échoue si l'un des jobs est en erreur.

### Images Docker (GitHub Container Registry)

```
ghcr.io/VOTRE_ORG/solowithpeace/backend:latest
ghcr.io/VOTRE_ORG/solowithpeace/frontend:latest
```

Pour utiliser les images publiées :

```bash
docker pull ghcr.io/VOTRE_ORG/solowithpeace/backend:latest
docker pull ghcr.io/VOTRE_ORG/solowithpeace/frontend:latest
```

---

## Qualité de code

### ESLint

```bash
# Backend
cd backend && npm run lint
cd backend && npm run lint:fix

# Frontend
cd frontend && npm run lint
cd frontend && npm run lint:fix
```

**Règles strictes activées (backend + frontend) :**
- `no-unused-vars` — erreur sur les variables inutilisées
- `eqeqeq` — utiliser `===` obligatoirement
- `no-var` — interdire `var`, utiliser `const`/`let`
- `prefer-const` — préférer `const`
- `no-trailing-spaces` — pas d'espaces en fin de ligne
- `no-multiple-empty-lines` — 1 ligne vide maximum

### Pre-commit hooks (Husky + lint-staged)

À l'installation (`npm install` à la racine), Husky configure automatiquement un hook `pre-commit` qui exécute ESLint sur les fichiers stagés avant chaque commit.

```bash
# Installation à la racine
npm install

# Forcer l'initialisation manuelle si nécessaire
npx husky init
```

### Standards de code

- **CommonJS** côté backend (`require`/`module.exports`)
- **ES Modules** + **TypeScript** côté frontend
- Nommage : `camelCase` pour les variables/fonctions, `PascalCase` pour les composants React
- Commits : message en impératif, 72 caractères max par ligne
- Pas de secrets dans le code : utiliser `.env` (ignoré par git)

---

## API REST

| Méthode | Endpoint | Auth |
|---------|----------|------|
| `GET` | `/api/health` | Non |
| `POST` | `/api/auth/register` | Non |
| `POST` | `/api/auth/login` | Non |
| `POST` | `/api/auth/logout` | Non |
| `GET` | `/api/auth/me` | Bearer JWT |
| `GET` | `/api/trips` | Non |
| `GET` | `/api/trips/:id` | Non |
| `POST` | `/api/trips/:id/join` | Bearer JWT |
| `GET` | `/api/activities` | Non |
| `GET` | `/api/activities/:id` | Non |
| `GET` | `/api/testimonials` | Non |

---

## Technologies utilisées

| Couche | Technologies |
|--------|-------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Node.js, Express 5, better-sqlite3, JWT, bcryptjs |
| Tests | Jest, Supertest, React Testing Library |
| CI/CD | GitHub Actions |
| Conteneurs | Docker (multi-stage), Docker Compose |
| Qualité | ESLint v9, Husky, lint-staged |

---

## Auteurs

- Jordan Jimenez
- Branis Kaci
- Clément Bardin
