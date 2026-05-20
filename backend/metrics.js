const promClient = require('prom-client');

const register = promClient.register;
promClient.collectDefaultMetrics({ register });

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestsDurationMs = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Durée des requêtes HTTP en ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [50, 100, 200, 300, 500, 1000, 2000],
});

const tripsCreatedTotal = new promClient.Counter({
  name: 'swp_trips_created_total',
  help: 'Nombre total de voyages créés',
});

const tripsJoinedTotal = new promClient.Counter({
  name: 'swp_trips_joined_total',
  help: "Nombre total d'inscriptions à un voyage",
});

const authSuccessTotal = new promClient.Counter({
  name: 'swp_auth_success_total',
  help: 'Nombre de connexions réussies',
});

const mongoConnectionStatus = new promClient.Gauge({
  name: 'swp_mongo_connected',
  help: '1 si MongoDB est connecté, 0 sinon',
});

module.exports = {
  register,
  httpRequestsTotal,
  httpRequestsDurationMs,
  tripsCreatedTotal,
  tripsJoinedTotal,
  authSuccessTotal,
  mongoConnectionStatus,
};