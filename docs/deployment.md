# Déploiement Continu et Staging

## Environnements

| Environnement | Branche | Hébergement |
|--------------|---------|-------------|
| Production | `main` | Render (voir [docs/render.md](render.md)) |
| Local / Dev | `develop` | Docker Compose |

## Stratégie

- La branche `develop` est dédiée au développement local via Docker Compose.
- Le déploiement de production se fait depuis `main` vers Render.
- Render redéploie automatiquement à chaque push sur la branche configurée.

### Approche recommandée

- Stratégie principale : **Rolling deployment** pour mettre à jour progressivement les conteneurs sans interruption majeure.
- Pour les nouvelles versions critiques : **Blue-Green deployment** afin de basculer rapidement vers une version stable en cas de problème.
- Pour les mises à jour destinées à un petit groupe : **Canary deployment** pour tester un nouveau build sur une portion limitée du trafic avant une mise en production complète.

## Infrastructure

- **Hébergement production** : Render (frontend + backend, plan gratuit)
- **Base de données** : MongoDB Atlas (cloud, partagé dev/prod)
- Gérer les secrets via Render Dashboard ou GitHub Secrets.

## Variables d'environnement et secrets sécurisés

- Ne stockez jamais les credentials ou les clés dans le code ou dans le dépôt.
- Utilisez les secrets GitHub Actions, les variables d'environnement gérées par la plateforme cloud, ou un gestionnaire de secrets dédié.
- Protégez les variables suivantes :
  - `MONGO_URI` pour la base de données MongoDB.
  - `JWT_SECRET` pour la signature des tokens.
  - `API_KEY` ou `RENDER_API_KEY` pour les services externes.
  - `NODE_ENV` doit rester configuré par l'environnement et non par le code.

## Procédure de rollback

1. Identifier le tag Docker stable précédent dans le registre.
2. Rebasculer le service vers ce tag précédent.
3. Vérifier l’état des logs, les indicateurs de santé et les endpoints critiques.
4. Si le déploiement précédent est sain, garder cette version active jusqu’à correction du problème.
5. Documenter le problème et le correctif avant de redéployer la nouvelle version.
