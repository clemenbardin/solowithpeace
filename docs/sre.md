# SRE et Production — SoloWithPeace

## SLO définis

### SLO 1 — Disponibilité : 99.9%

- **Objectif** : 99.9% des requêtes HTTP reçoivent une réponse non-5xx
- **Error budget** : 43.2 minutes d'indisponibilité par mois
- **Mesure** : `rate(http_requests_total{status_code!~"5.."}[30d]) / rate(http_requests_total[30d])`

**Justification** : Le service est un prototype à usage pédagogique. 99.9% est ambitieux mais atteignable sans infrastructure redondante. Un SLO plus strict (99.99%) nécessiterait du load balancing et plusieurs zones de disponibilité.

### SLO 2 — Latence : P95 < 500ms

- **Objectif** : 95% des requêtes répondent en moins de 500ms
- **Mesure** : `histogram_quantile(0.95, rate(http_request_duration_ms_bucket[5m]))`

**Justification** : 500ms est le seuil perceptible par un utilisateur. En dessous, l'expérience est fluide. Au-delà, l'interface paraît lente.

---

## Alertes configurées

| Alerte | Condition | Sévérité | Délai |
|--------|-----------|----------|-------|
| `BackendDown` | backend inaccessible | critical | 1 min |
| `HighErrorRate` | taux 5xx > 5% | warning | 5 min |
| `HighLatency` | P95 > 500ms | warning | 5 min |
| `HighMemoryUsage` | RAM > 400MB | warning | 10 min |
| `ErrorBudgetCritical` | error budget > 50% consommé | critical | 1h |

Les alertes sont basées sur des **symptômes** (ce que ressent l'utilisateur), pas sur des causes internes.

---

## Runbooks

### BackendDown

**Symptôme** : Prometheus ne peut plus scraper `backend:5000/metrics`.

1. Vérifier l'état du container : `docker compose ps backend`
2. Lire les logs : `docker compose logs backend --tail=50`
3. Redémarrer : `docker compose restart backend`
4. Si persistant : vérifier `MONGO_URI` et la connexion Atlas (`docker compose exec backend node -e "require('./db/connection')()"`)

### HighErrorRate

**Symptôme** : Plus de 5% des requêtes retournent une erreur 5xx.

1. Identifier les routes concernées dans Grafana → Dashboard Golden Signals → Error Rate par route
2. Lire les logs : `docker compose logs backend --tail=100 | grep ERROR`
3. Si erreur MongoDB : vérifier Atlas (connexions actives, quota)
4. Si erreur code : identifier le commit récent (`git log --oneline -5`) et rollback si nécessaire

### HighLatency

**Symptôme** : P95 dépasse 500ms, SLO latence en danger.

1. Vérifier la charge : Dashboard Golden Signals → Active Connections + Request Rate
2. Vérifier MongoDB : temps de réponse Atlas dans Grafana → Explore → Loki → `{container="solo-backend"}`
3. Vérifier cAdvisor (port 8080) : CPU/RAM du container backend
4. Si surcharge : réduire le trafic ou scaler

### HighMemoryUsage

**Symptôme** : Le process backend dépasse 400MB de RAM.

1. Identifier les fuites : `docker compose exec backend node --expose-gc -e "global.gc(); console.log(process.memoryUsage())"`
2. Redémarrer en dernier recours : `docker compose restart backend`
3. Investiguer les endpoints lourds dans les logs Loki

### ErrorBudgetCritical

**Symptôme** : Plus de 50% de l'error budget du mois consommé.

1. Consulter le Dashboard SLO dans Grafana → trend des 30 derniers jours
2. Identifier la période de dégradation dans l'historique Prometheus
3. Si le budget est épuisé : geler les déploiements non-critiques jusqu'à la fin du mois
4. Post-mortem obligatoire si SLO violé

---

## Procédure d'incident

```
1. DÉTECTER   — Alerte Alertmanager ou signalement utilisateur
2. QUALIFIER  — Sévérité ? Utilisateurs impactés ? Depuis quand ?
3. MITIGER    — Appliquer le runbook correspondant
4. RÉSOUDRE   — Corriger la cause racine
5. POST-MORTEM — Documenter : timeline, cause, fix, prévention
```

---

## Métriques clés et interprétation

| Métrique | Dashboard | Interprétation |
|----------|-----------|----------------|
| `swp_http_requests_total` | Golden Signals | Volume de trafic — hausse soudaine = possible attaque ou campagne |
| `swp_http_request_duration_ms` | Golden Signals | Latence P95 — dépasse 500ms → alerte SLO |
| `http_requests_total{status_code=~"5.."}` | Golden Signals | Erreurs serveur — > 5% → alerte critique |
| `swp_http_active_connections` | Golden Signals | Saturation — hausse sans baisse → fuite de connexions |
| `swp_auth_success_total` | Business | Activité utilisateurs — chute soudaine = problème auth |
| `swp_trips_join_total` | Business | Engagement — indicateur santé fonctionnelle |
| Error budget restant | SLO | < 25% → vigilance ; 0% → SLO violé ce mois |
