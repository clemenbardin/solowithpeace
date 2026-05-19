# Guide de contribution — SoloWithPeace

## Prérequis

- Node.js 20 LTS
- Docker & Docker Compose
- Git

## Setup local

```bash
# 1. Cloner le repo
git clone https://github.com/<org>/solowithpeace.git
cd solowithpeace

# 2. Configurer les variables d'environnement
cp .env.example .env
# Modifier .env si nécessaire

# 3. Démarrer les services
docker compose up -d

# 4. Peupler la base de données
docker compose exec backend npm run seed

# 5. Vérifier que tout fonctionne
curl http://localhost:5000/api/health
# → { "status": "OK", "mongodb": "connected" }
```

Frontend accessible sur `http://localhost:3000`
Mongo Express sur `http://localhost:8081`

## Workflow de branches

On utilise **GitHub Flow** :

```
main          ← production stable (protégée)
develop       ← intégration continue (protégée)
feat/<slug>   ← nouvelle fonctionnalité
fix/<slug>    ← correction de bug
docs/<slug>   ← documentation uniquement
ci/<slug>     ← pipeline CI/CD
chore/<slug>  ← maintenance, dépendances
```

**Toujours créer une branche depuis `develop` :**

```bash
git checkout develop && git pull
git checkout -b feat/ma-fonctionnalite
```

## Convention de commits (Conventional Commits)

```
<type>(<scope>): <description courte>

[corps optionnel]
```

Types autorisés : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `ci`, `chore`

Exemples :
```
feat(trips): ajouter filtre par destination
fix(auth): corriger expiration du token JWT
docs(readme): mettre à jour les instructions Docker
ci(github-actions): ajouter job de lint
```

## Processus de Pull Request

1. Ouvrir une issue si nécessaire
2. Créer une branche depuis `develop`
3. Commits atomiques avec messages conventionnels
4. Ouvrir une PR vers `develop` en remplissant le template
5. CI doit passer (lint + tests)
6. Au moins 1 review requise
7. Merge en squash

**Les PR directement vers `main` sont interdites.**

## Standards de code

- **Backend** : CommonJS, ESLint standard, pas de `var`, `prefer-const`
- **Frontend** : TypeScript strict, ESLint Next.js
- Pas de secrets dans le code (utiliser `.env`)
- Tester les changements avant d'ouvrir une PR