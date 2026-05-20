# Base de données — SoloWithPeace

## Technologie

**MongoDB 7** via **Mongoose 8** (ODM).

La connexion se fait via `backend/db/connection.js`, avec l'URI configurée dans la variable d'environnement `MONGO_URI`.

**Hébergement :** MongoDB Atlas (cloud) — le container `mongo` dans Docker Compose sert de base locale pour le développement hors-connexion.

---

## Collections

### `users`

Comptes utilisateurs de la plateforme.

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `_id` | ObjectId | auto | Identifiant unique MongoDB |
| `email` | String | unique, lowercase, trim, required | Adresse email (identifiant de connexion) |
| `password` | String | required | Hash bcrypt (10 rounds) |
| `name` | String | required, trim | Nom affiché |
| `role` | String | default: `'Voyageur'` | Rôle de l'utilisateur |
| `avatar_initials` | String | 2 majuscules | Initiales générées depuis `name` |
| `createdAt` | Date | auto (timestamps) | Date de création |
| `updatedAt` | Date | auto (timestamps) | Date de dernière modification |

**Index :** `{ email: 1 }` unique

### `trips`

Voyages groupés disponibles sur la plateforme.

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `_id` | ObjectId | auto | Identifiant unique |
| `title` | String | required | Titre du voyage |
| `description` | String | — | Description détaillée |
| `destination` | String | required | Lieu de destination |
| `start_date` | String | format `YYYY-MM-DD` | Date de départ |
| `end_date` | String | format `YYYY-MM-DD` | Date de retour |
| `spots_total` | Number | default: 8 | Nombre total de places |
| `spots_left` | Number | default: 8 | Places restantes (décrémenté à chaque join) |
| `category` | String | — | Catégorie (nature, culture, etc.) |
| `gradient` | String | — | Classes Tailwind CSS pour l'affichage |
| `created_by` | ObjectId | ref: `User` | Utilisateur créateur |
| `createdAt` | Date | auto | Date de création |
| `updatedAt` | Date | auto | Date de modification |

**Tri par défaut :** `{ createdAt: -1 }` (plus récents en premier)

### `activities`

Activités disponibles affichées sur la page d'accueil.

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `_id` | ObjectId | auto | Identifiant unique |
| `title` | String | required | Nom de l'activité |
| `description` | String | — | Description |
| `category` | String | outdoor / social / culture / food | Catégorie |
| `icon_type` | String | mountain / party / culture / food | Icône utilisée |
| `color` | String | default: `'emerald'` | Couleur d'affichage (Tailwind) |
| `participant_count` | Number | default: 0 | Nombre de participants |
| `createdAt` | Date | auto | Date de création |

**Tri par défaut :** `{ participant_count: -1 }` (plus populaires en premier)

### `testimonials`

Témoignages de voyageurs affichés sur la page d'accueil.

| Champ | Type | Contraintes | Description |
|-------|------|-------------|-------------|
| `_id` | ObjectId | auto | Identifiant unique |
| `author_name` | String | required | Nom complet de l'auteur |
| `author_initials` | String | required | Initiales (ex: `"JD"`) |
| `author_color` | String | default: `'emerald'` | Couleur avatar |
| `quote_title` | String | required | Titre du témoignage |
| `quote_body` | String | required | Corps du témoignage |
| `subtitle` | String | — | Sous-titre optionnel |
| `createdAt` | Date | auto | Date de création |

**Tri par défaut :** `{ createdAt: 1 }` (ordre chronologique)

---

## Seed (données de test)

Peupler la base avec les données de développement :

```bash
# Première fois (ajoute les données sans supprimer l'existant)
docker compose exec backend npm run seed

# Réinitialisation complète (supprime tout et réinsère)
docker compose exec backend npm run seed:reset
```

Le script insère : **4 utilisateurs**, **6 voyages**, **4 activités**, **4 témoignages**.

### Comptes de test

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@admin.com | admin | Admin |
| alice@example.com | alice123 | Voyageur |
| bob@example.com | bob123 | Voyageur |
| user@user.com | user | Voyageur |

### Voyages de test

| Destination | Catégorie | Places |
|------------|----------|--------|
| Kyoto, Japon | culture | 8 |
| Patagonie, Argentine | nature | 6 |
| Barcelone, Espagne | urban | 10 |
| Marrakech, Maroc | culture | 8 |
| Islande | nature | 4 |
| Thaïlande | plage | 12 |

---

## Connexion et gestion des erreurs

**Fichier :** `backend/db/connection.js`

```
MONGO_URI (env) → mongoose.connect() → connecté / erreur fatale (process.exit(1))
```

En mode `NODE_ENV=test`, la connexion est remplacée par `mongodb-memory-server` : une instance MongoDB en mémoire, isolée, détruite après chaque suite de tests.

---

## Conventions de modèles

Tous les modèles Mongoose (`backend/models/`) utilisent :
- `{ timestamps: true }` — génère automatiquement `createdAt` et `updatedAt`
- `toJSON: { virtuals: true }` — expose `id` (string) comme alias de `_id` dans les réponses JSON
- Validation côté schéma pour les champs `required` (pas de validation côté route)
