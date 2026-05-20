# Déploiement Continu et Staging

## Stratégie

- La branche `develop` est dédiée au staging.
- Les builds Docker sont générés automatiquement à chaque `push` sur `develop`.
- Les images sont taguées avec `develop` et un SHA unique.
- Le déploiement de production reste réservé à la branche `main` avec des tags versionnés.

### Approche recommandée

- Stratégie principale : **Rolling deployment** pour mettre à jour progressivement les conteneurs sans interruption majeure.
- Pour les nouvelles versions critiques : **Blue-Green deployment** afin de basculer rapidement vers une version stable en cas de problème.
- Pour les mises à jour destinées à un petit groupe : **Canary deployment** pour tester un nouveau build sur une portion limitée du trafic avant une mise en production complète.

## Infrastructure recommandée

- Utiliser un service de déploiement comme Render, Railway ou Heroku.
- Configurer une base MongoDB de staging séparée de la production.
- Gérer les secrets via le service choisi ou GitHub Secrets.

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
