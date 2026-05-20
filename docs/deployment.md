# Déploiement Continu et Staging

## Stratégie

- La branche `develop` est dédiée au staging.
- Les builds Docker sont générés automatiquement à chaque `push` sur `develop`.
- Les images sont taguées avec `develop` et un SHA unique.
- Le déploiement de production reste réservé à la branche `main` avec des tags versionnés.
- La procédure de rollback consiste à redéployer l'image Docker d'une version précédente via le registre.

## Infrastructure recommandée

- Utiliser un service de déploiement comme Render, Railway ou Heroku.
- Configurer une base MongoDB de staging séparée de la production.
- Gérer les secrets via le service choisi ou GitHub Secrets.

## Secrets sécurisés

Au minimum, configurez les variables suivantes dans GitHub Actions ou votre plateforme :

- `MONGO_URI` pour la base de données MongoDB de staging.
- `JWT_SECRET` pour la signature des tokens.
- `RENDER_API_KEY` si vous utilisez Render.
- `GITHUB_TOKEN` est déjà fourni par GitHub Actions.

## Procédure de rollback

1. Identifier le tag Docker stable précédent dans le registre.
2. Rebasculer le service de staging sur le tag précédent.
3. Vérifier les logs et la santé de l’application.
4. Si nécessaire, mettre à jour le tag `develop` pour éviter un redéploiement automatique du commit défectueux.
