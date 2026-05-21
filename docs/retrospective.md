# Retour d'expérience — SoloWithPeace

## Difficultés rencontrées et solutions

### 1. Communication inter-containers (Docker networking)

**Problème** : Le frontend utilisait `localhost:5000` pour appeler le backend — fonctionne en local natif mais échoue dans Docker, où `localhost` désigne le container frontend lui-même.

**Solution** : Utiliser le nom du service Docker (`backend:5000`) comme hostname. Dans Docker Compose, chaque service est résolvable par son nom sur le réseau `solo-network`.

---

### 2. Données absentes dans Grafana

**Problème** : Les dashboards affichaient "No data" malgré Prometheus opérationnel. Grafana générait des UIDs aléatoires pour les datasources provisionnées, ne correspondant pas aux UIDs référencés dans les JSON des dashboards (`"uid": "prometheus"`).

**Solution** : Ajouter des UIDs explicites dans `monitoring/grafana/provisioning/datasources/datasources.yml` (`uid: prometheus`, `uid: loki`). Supprimer le volume `grafana_data` pour repartir propre et éviter les conflits avec les UIDs déjà stockés en base SQLite.

---

### 3. Proxy frontend → backend sur Render

**Problème** : Les rewrites dans `next.config.ts` sont évalués au **build time**. La variable `NEXT_PUBLIC_API_URL` n'était pas disponible pendant le build Docker sur Render, causant un 502 — `localhost:5000` était compilé en dur dans le bundle.

**Solution** : Remplacer le rewrite par une route API Next.js (`app/api/[...path]/route.ts`) qui lit `process.env.BACKEND_URL` au **runtime**, à chaque requête. Plus besoin de build arg — la variable est simplement une variable d'environnement Node.js standard.

---

### 5. Conflits package-lock.json

**Problème** : Les merges entre branches généraient systématiquement des conflits sur `package-lock.json`, rendant les merges bloquants.

**Solution** : En cas de conflit, garder la version de la branche cible et régénérer : `git checkout --theirs package-lock.json && npm install`. Le fichier est régénéré proprement depuis `package.json`.

---

## Améliorations futures identifiées

- **Tracing distribué** (Jaeger / OpenTelemetry) : corréler les logs, métriques et traces pour diagnostiquer les lenteurs de bout en bout
- **Tests de charge** (k6) : simuler 100+ utilisateurs simultanés pour valider les SLO sous charge
- **Scan de sécurité** (Trivy, Snyk) : intégrer une analyse de vulnérabilités dans le pipeline CI
- **Séparation des bases** : utiliser une base MongoDB Atlas dédiée au staging (actuellement dev et prod partagent la même base)
- **CORS restrictif** : limiter `cors()` aux origines connues (domaine Render) plutôt que `*`
- **Healthcheck Render** : ajouter un endpoint de warmup pour éviter le cold start de 20-30s du plan gratuit

---

## Leçons apprises

**Sur Docker** : Les noms de services Docker Compose sont des hostnames DNS résolvables uniquement au sein du réseau interne. Toute URL codée en dur avec `localhost` est une erreur en environnement conteneurisé.

**Sur le monitoring** : Configurer explicitement les UIDs des datasources Grafana dès le départ évite des heures de debug. Les dashboards JSON doivent toujours référencer des UIDs stables, pas auto-générés.

**Sur le déploiement** : Les variables d'environnement Next.js avec le préfixe `NEXT_PUBLIC_` sont baked au build — elles ne peuvent pas être changées sans rebuild. Pour les URLs de services externes, préférer des variables sans préfixe lues au runtime côté serveur.

**Sur la collaboration Git** : Des conventions de commit et de nommage de branches strictes dès le début réduisent le coût des merges et améliorent la lisibilité de l'historique pour les reviews.
