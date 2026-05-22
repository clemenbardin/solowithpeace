# Déploiement Render

## Services en production

| Service | URL | Source |
|---------|-----|--------|
| Frontend (Next.js) | https://swp-frontend-w4y3.onrender.com | `frontend/Dockerfile` |
| Backend (Express) | https://swp-backend-ohy0.onrender.com | `backend/Dockerfile` |
| Base de données | MongoDB Atlas | Variable `MONGO_URI` |

---

## Variables d'environnement à configurer

### Backend (`swp-backend`)

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGO_URI` | URI MongoDB Atlas |
| `JWT_SECRET` | Clé secrète aléatoire |

### Frontend (`swp-frontend`)

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `BACKEND_URL` | `https://swp-backend-ohy0.onrender.com` |

> `BACKEND_URL` est lue **au runtime** par le proxy — pas besoin de redéployer si l'URL du backend change.

---

## Proxy frontend → backend

Le frontend ne contacte jamais le backend directement depuis le navigateur. Toutes les requêtes `/api/*` passent par une route Next.js côté serveur :

```
Navigateur → /api/trips
  → Next.js route handler (frontend/app/api/[...path]/route.ts)
  → lit process.env.BACKEND_URL au moment de la requête
  → https://swp-backend-ohy0.onrender.com/api/trips
  → réponse renvoyée au navigateur
```

**Pourquoi ce design :**
- L'URL du backend n'est pas baked dans le build — on peut la changer sans rebuilder
- Le backend n'a pas besoin d'exposer des headers CORS permissifs
- Fonctionne identiquement en local (`BACKEND_URL=http://backend:5000`) et en production

---

## Seed base de données (première mise en production)

```bash
cd backend
node db/seed.js --reset
```

Nécessite que `MONGO_URI` soit défini dans `backend/.env`.

---

## Limites du plan gratuit Render

- Les services **s'endorment après 15 minutes** d'inactivité
- La première requête après le sommeil prend ~20–30 secondes (cold start)
- Passer en plan payant pour éliminer ce délai en production réelle
