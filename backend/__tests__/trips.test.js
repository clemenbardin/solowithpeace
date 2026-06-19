const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

describe('Trips Routes', () => {
  let token;
  let firstTripId;
  let cultureTripId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@admin.com', password: 'admin' });
    token = res.body.token;
  });

  beforeEach(async () => {
    const allTrips = await request(app).get('/api/trips');
    firstTripId = String(allTrips.body?.[0]?._id || allTrips.body?.[0]?.id || '');
    cultureTripId = String(
      allTrips.body.find((trip) => trip.category === 'Culture')?._id ||
      allTrips.body.find((trip) => trip.category === 'Culture')?.id ||
      firstTripId
    );
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
      const res = await request(app).get(`/api/trips/${firstTripId}`);
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(firstTripId);
      expect(res.body.title).toBeDefined();
    });

    it('retourne les participants peuplés', async () => {
      const res = await request(app).get(`/api/trips/${cultureTripId}`);
      expect(res.status).toBe(200);
      expect(res.body.members.length).toBeGreaterThan(0);
      expect(res.body.members[0].user.name).toBeDefined();
      expect(res.body.members[0].user.email).toBeUndefined();
    });

    it('retourne 404 pour un id inexistant', async () => {
      const missingId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/trips/${missingId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/trips/:id/join', () => {
    it('rejoint un voyage avec token valide', async () => {
      const before = await request(app).get(`/api/trips/${firstTripId}`);
      const res = await request(app)
        .post(`/api/trips/${firstTripId}/join`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBeDefined();
      expect(res.body.trip.members.length).toBe(before.body.members.length + 1);
      expect(res.body.trip.spots_left).toBe(before.body.spots_left - 1);
    });

    it('refuse une inscription doublon', async () => {
      await request(app)
        .post(`/api/trips/${firstTripId}/join`)
        .set('Authorization', `Bearer ${token}`);

      const res = await request(app)
        .post(`/api/trips/${firstTripId}/join`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/déjà rejoint/);
    });

    it('refuse un voyage complet', async () => {
      const Trip = require('../models/Trip');
      await Trip.findByIdAndUpdate(firstTripId, { spots_left: 0 });

      const res = await request(app)
        .post(`/api/trips/${firstTripId}/join`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Plus de places/);
    });

    it('refuse de rejoindre sans token', async () => {
      const res = await request(app).post(`/api/trips/${firstTripId}/join`);
      expect(res.status).toBe(401);
    });

    it('retourne 404 pour un voyage inexistant', async () => {
      const missingId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post(`/api/trips/${missingId}/join`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
