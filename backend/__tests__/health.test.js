const request = require('supertest');
const app = require('../app');

describe('GET /api/health', () => {
  it('retourne status OK avec timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.timestamp).toBeDefined();
  });

  it('retourne 404 pour une route inconnue', async () => {
    const res = await request(app).get('/api/route-inexistante');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
