const request = require('supertest');
const app = require('../app');

describe('Feature Flags API', () => {
  let adminToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@admin.com', password: 'admin' });
    adminToken = res.body.token;
  });

  it('retourne la liste des flags', async () => {
    const res = await request(app).get('/api/flags');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((flag) => flag.key === 'show_exclusive_trips')).toBe(true);
    expect(res.body.some((flag) => flag.key === 'enable_testimonials_banner')).toBe(true);
  });

  it('permet à un administrateur de mettre à jour un flag', async () => {
    const res = await request(app)
      .patch('/api/flags/show_exclusive_trips')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ enabled: true });

    expect(res.status).toBe(200);
    expect(res.body.key).toBe('show_exclusive_trips');
    expect(res.body.enabled).toBe(true);
  });

  it('refuse la mise à jour d’un flag inconnu', async () => {
    const res = await request(app)
      .patch('/api/flags/unknown_flag')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ enabled: true });

    expect(res.status).toBe(404);
  });
});
