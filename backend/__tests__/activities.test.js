const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

describe('Activities Routes', () => {
  let firstActivityId;

  beforeEach(async () => {
    const res = await request(app).get('/api/activities');
    firstActivityId = String(res.body?.[0]?._id || res.body?.[0]?.id || '');
  });

  describe('GET /api/activities', () => {
    it('retourne la liste des activités', async () => {
      const res = await request(app).get('/api/activities');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('retourne les activités triées par participant_count DESC', async () => {
      const res = await request(app).get('/api/activities');
      expect(res.status).toBe(200);
      for (let i = 0; i < res.body.length - 1; i++) {
        expect(res.body[i].participant_count).toBeGreaterThanOrEqual(
          res.body[i + 1].participant_count
        );
      }
    });
  });

  describe('GET /api/activities/:id', () => {
    it('retourne une activité par id', async () => {
      const res = await request(app).get(`/api/activities/${firstActivityId}`);
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(firstActivityId);
      expect(res.body.title).toBeDefined();
    });

    it('retourne 404 pour un id inexistant', async () => {
      const missingId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/activities/${missingId}`);
      expect(res.status).toBe(404);
    });
  });
});
