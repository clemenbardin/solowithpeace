const request = require('supertest');
const app = require('../app');

describe('Trips Routes', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@admin.com', password: 'admin' });
    token = res.body.token;
  });

  describe('GET /api/trips', () => {
    it('retourne la liste des voyages', async () => {
      const res = await request(app).get('/api/trips');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('filtre par catégorie', async () => {
      const res = await request(app).get('/api/trips?category=Culture');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((trip) => {
        expect(trip.category).toBe('Culture');
      });
    });

    it('limite le nombre de résultats', async () => {
      const res = await request(app).get('/api/trips?limit=2');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeLessThanOrEqual(2);
    });

    it('retourne un tableau vide pour une catégorie inexistante', async () => {
      const res = await request(app).get('/api/trips?category=CategorieInexistante');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /api/trips/:id', () => {
    it('retourne un voyage par id', async () => {
      const res = await request(app).get('/api/trips/1');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.title).toBeDefined();
    });

    it('retourne 404 pour un id inexistant', async () => {
      const res = await request(app).get('/api/trips/99999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/trips/:id/join', () => {
    it('rejoint un voyage avec token valide', async () => {
      const res = await request(app)
        .post('/api/trips/1/join')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBeDefined();
    });

    it('refuse de rejoindre sans token', async () => {
      const res = await request(app).post('/api/trips/1/join');
      expect(res.status).toBe(401);
    });

    it('retourne 404 pour un voyage inexistant', async () => {
      const res = await request(app)
        .post('/api/trips/99999/join')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
