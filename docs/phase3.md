# Phase 3 : Tests avancés et Déploiement Continu

## Objectifs

L’objectif de la phase 3 est de compléter la stratégie de tests, de mettre en place un déploiement de staging automatisé et de sécuriser la gestion des secrets.

## 1. Tests d'intégration

### Implémentation

- Le backend utilise Jest et `supertest` pour exécuter les tests d'API.
- Le package `mongodb-memory-server` est installé pour permettre des tests isolés avec une base MongoDB temporaire.
- Les tests se trouvent dans `backend/__tests__/` :
  - `activities.test.js`
  - `auth.test.js`
  - `flags.test.js`
  - `health.test.js`
  - `trips.test.js`
  - `testimonials.test.js`
- Ces tests couvrent les routes principales et vérifient la logique métier du backend.

### Setup / Teardown et isolation

- Les tests du backend peuvent démarrer une instance MongoDB en mémoire, ce qui évite de toucher les bases de données de développement ou de production.
- Chaque exécution de test reste isolée grâce à la base en mémoire et à la configuration Jest.

### Commandes

- `cd backend && npm test`
- `cd backend && npm run test:coverage`

## 2. Tests E2E (End-to-End)

### Implémentation

- Le frontend utilise Playwright pour les tests E2E.
- Il existe au moins 3 scénarios E2E dans `frontend/tests/e2e/` :
  - `login.spec.ts`
  - `register.spec.ts`
  - `dashboard.spec.ts`
- Le Page Object Pattern est implémenté dans `frontend/tests/pageObjects/` :
  - `LoginPage.ts`
  - `RegisterPage.ts`
  - `DashboardPage.ts`

### Ce qui est couvert

- Authentification d’un utilisateur existant
- Inscription d’un nouvel utilisateur et redirection
- Activation d’un feature flag et validation de l’affichage correspondant

### Screenshots en cas d’échec

- Playwright est configuré pour capturer facilement des captures d’écran en cas d’échec via la commande `npx playwright test`.
- Si un test échoue, Playwright peut être lancé avec des options de trace et screenshot pour analyser le problème.

### Commande

- `cd frontend && npm install`
- `cd frontend && npx playwright install`
- `cd frontend && npm run e2e`

## 3. Rapport de couverture

### Implémentation

- Le backend et le frontend ont des scripts dédiés pour générer un rapport de couverture :
  - backend : `npm run test:coverage`
  - frontend : `npm run test:coverage`
- Ces rapports permettent de vérifier le pourcentage de code testé et d’identifier les zones à couvrir.

## 4. Feature Flags

### Backend

- Un modèle Mongoose `FeatureFlag` est défini dans `backend/models/FeatureFlag.js`.
- Une API de gestion des flags existe dans `backend/routes/flags.js` :
  - `GET /api/flags` pour lister les flags
  - `PATCH /api/flags/:key` pour activer/désactiver un flag
- La route de modification est protégée par un middleware `verifyAdmin`.

### Frontend

- Une interface d’administration des feature flags est disponible dans `frontend/app/admin/feature-flags/page.tsx`.
- L’interface charge les flags depuis l’API et permet de les activer/désactiver.
- L’accès est restreint aux utilisateurs `Admin`.

### Flags actives documentées

- `show_exclusive_trips`
- `enable_testimonials_banner`

## 5. Déploiement Continu (staging)

### Environnement de staging

- Un workflow GitHub Actions existe dans `.github/workflows/deploy-staging.yml`.
- Il se déclenche automatiquement sur `push` vers la branche `develop`.
- Il build et publie deux images Docker :
  - `backend:develop`
  - `frontend:develop`
- Les images sont poussées sur GitHub Container Registry (`ghcr.io`).

### Stratégie de déploiement

- Documentation disponible dans `docs/deployment.md`.
- Stratégies recommandées :
  - Rolling deployment
  - Blue-Green deployment
  - Canary deployment
- La procédure de rollback est définie dans `docs/deployment.md`.

### Gestion des secrets

- Les secrets ne doivent pas être stockés dans le code source.
- Il faut utiliser :
  - GitHub Actions Secrets
  - Variables d’environnement du service de déploiement
  - Gestionnaire de secrets dédié si nécessaire
- Variables à protéger :
  - `MONGO_URI`
  - `JWT_SECRET`
  - `API_KEY` / `RENDER_API_KEY`
  - `NODE_ENV`

## 6. Statut et recommandations

### Ce qui est déjà implémenté

- Tests backend automatisés avec Jest
- Tests E2E Playwright avec Page Object Pattern
- Feature flags backend + interface d’administration frontend
- Workflow de build staging automatique pour `develop`
- Documentation de la stratégie de déploiement et de la gestion des secrets

### Ce qu’il reste à renforcer

- S’assurer d’avoir au moins 10 tests d’intégration backend validés si nécessaire.
- Vérifier l’exécution réelle du workflow de staging sur la plateforme choisie.
- Compléter le rapport de couverture avec une publication ou un badge si possible.

## 7. Commandes utiles

- `cd backend && npm test`
- `cd backend && npm run test:coverage`
- `cd frontend && npm run e2e`
- `cd frontend && npm run test:coverage`
