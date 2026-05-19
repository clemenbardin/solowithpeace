# Base de données — SoloWithPeace

## Technologie

**MongoDB 7** via **Mongoose 8** (ODM).

La connexion se fait via `backend/db/connection.js`, avec l'URI configurée dans `MONGO_URI`.

## Collections

### `users`

| Champ | Type | Contraintes |
|---|---|---|
| `email` | String | unique, lowercase, trim, required |
| `password` | String | required (bcrypt hash) |
| `name` | String | required, trim |
| `role` | String | default: `'Voyageur'` |
| `avatar_initials` | String | 2 caractères majuscules |
| `createdAt` / `updatedAt` | Date | auto (timestamps) |

Index : `{ email: 1 }` unique

### `trips`

| Champ | Type | Contraintes |
|---|---|---|
| `title` | String | required |
| `description` | String | — |
| `destination` | String | required |
| `start_date` / `end_date` | String | format `YYYY-MM-DD` |
| `spots_total` / `spots_left` | Number | default: 8 |
| `category` | String | — |
| `gradient` | String | classes Tailwind CSS |
| `created_by` | ObjectId | ref: `User` |
| `createdAt` / `updatedAt` | Date | auto (timestamps) |

### `activities`

| Champ | Type | Contraintes |
|---|---|---|
| `title` | String | required |
| `description` | String | — |
| `category` | String | outdoor / social / culture / food |
| `icon_type` | String | mountain / party / culture / food |
| `color` | String | default: `'emerald'` |
| `participant_count` | Number | default: 0 |

### `testimonials`

| Champ | Type | Contraintes |
|---|---|---|
| `author_name` | String | required |
| `author_initials` | String | required |
| `author_color` | String | default: `'emerald'` |
| `quote_title` | String | required |
| `quote_body` | String | required |
| `subtitle` | String | — |

## Seed (données de test)

Peupler la base avec les données de développement :

```bash
# Première fois
docker compose exec backend npm run seed

# Réinitialiser complètement
docker compose exec backend npm run seed:reset
```

Le script insère : 4 utilisateurs, 6 voyages, 4 activités, 4 témoignages.

**Comptes de test :**

| Email | Mot de passe | Rôle |
|---|---|---|
| admin@admin.com | admin | Admin |
| alice@example.com | alice123 | Voyageur |
| bob@example.com | bob123 | Voyageur |
| user@user.com | user | Voyageur |

## Modèle fichier

Tous les modèles se trouvent dans `backend/models/` et utilisent `toJSON: { virtuals: true }` pour exposer `id` (string) comme alias de `_id`.