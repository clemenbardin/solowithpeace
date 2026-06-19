# Guide DevOps — SoloWithPeace

## Workflow Git

Nous suivons **GitHub Flow** adapté :

```
main          ← production (protégée, merge via PR uniquement)
  └── develop ← intégration continue
        └── feature/fix/docs/...  ← branches de travail
```

**Conventions de nommage des branches :**
- `feat/nom-feature` — nouvelle fonctionnalité
- `fix/description` — correction de bug
- `docs/sujet` — documentation uniquement
- `chore/tache` — maintenance (dépendances, config)

**Conventions de commit :**
```
feat: ajouter la page dashboard
fix: corriger le proxy frontend vers backend
docs: mettre à jour le README
chore: bumper prom-client vers 15.1
```

**Règle** : pas de push direct sur `main` ni `develop`. Toute modification passe par une PR avec review.

---

## Pipeline CI/CD

### Vue d'ensemble

```
Push / PR
    │
    ├── main ou develop ──► ci.yml         (lint + tests)
    ├── develop          ──► deploy-staging.yml  (images Docker → GHCR)
    └── main / tag v*    ──► docker.yml    (images production → GHCR)
```

### `ci.yml` — Intégration continue

Déclenché sur push et PR vers `main` et `develop`.

| Job | Dépendance | Ce que ça fait |
|-----|-----------|----------------|
| `lint-backend` | — | ESLint sur le backend |
| `lint-frontend` | — | ESLint / Next lint sur le frontend |
| `test-backend` | lint-backend | Jest + coverage (matrix Node 20 / 22) |
| `test-frontend` | lint-frontend | Jest RTL + coverage (matrix Node 20 / 22) |
| `ci-success` | test-backend + test-frontend | Gate final |

Les rapports de couverture sont uploadés comme artefacts GitHub (rétention 7 jours).

### `deploy-staging.yml` — Staging

Déclenché sur push vers `develop`.

- Build les images Docker (`target: production`) pour backend et frontend
- Push sur GitHub Container Registry (GHCR) avec deux tags :
  - `:develop` (tag fixe, toujours à jour)
  - `:sha-<commit>` (tag immuable pour rollback)
- Cache Docker activé (`type=gha`) pour accélérer les builds successifs

### `docker.yml` — Production

Déclenché sur push vers `main` et sur les tags `v*.*.*`.

- Même logique que staging
- Tags supplémentaires : version sémantique (`v1.2.3`, `v1.2`)
- Images utilisées par Render pour le déploiement production

---

## Stratégie de tests

| Niveau | Outil | Emplacement | Commande |
|--------|-------|-------------|---------|
| Unitaires backend | Jest + Supertest | `backend/__tests__/` | `npm test` |
| Unitaires frontend | Jest + RTL | `frontend/__tests__/` | `npm test` |
| E2E | Playwright | `frontend/tests/e2e/` | `npm run e2e` |
| Couverture | Jest coverage | — | `npm run test:coverage` |

**Isolation backend** : les tests utilisent `mongodb-memory-server` — aucune connexion à MongoDB Atlas pendant les tests.

**Tests E2E couverts** :
- Connexion utilisateur existant
- Inscription nouvel utilisateur + redirection
- Interface admin feature flags

---

## Procédure de déploiement

### Local (développement)

```bash
docker compose up -d
# Frontend : http://localhost:3000
# Backend  : http://localhost:5000
```

### Production (Render)

Le déploiement se fait automatiquement depuis Render à chaque push sur la branche configurée.

Variables à configurer sur Render (voir [docs/render.md](render.md)) :
- `MONGO_URI`, `JWT_SECRET` sur le backend
- `BACKEND_URL` sur le frontend

### Seed base de données

```bash
cd backend && node db/seed.js --reset
```

---

## Configuration du monitoring

Toute la configuration est dans `monitoring/` :

| Fichier | Rôle |
|---------|------|
| `prometheus/prometheus.yml` | Jobs de scrape (backend:5000/metrics, cadvisor) |
| `prometheus/rules/alerts.yml` | 5 règles d'alerte |
| `alertmanager/alertmanager.yml` | Routage notifications |
| `grafana/provisioning/` | Datasources + dashboards provisionnés automatiquement |
| `loki/loki-config.yml` | Rétention logs 7 jours |
| `promtail/promtail-config.yml` | Collecte logs containers Docker |

Après modification d'une règle Prometheus, recharger sans redémarrer :
```bash
curl -X POST http://localhost:9090/-/reload
```
