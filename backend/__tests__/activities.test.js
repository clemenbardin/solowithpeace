const request = require('supertest');
const app = require('../app');

describe('Activities Routes', () => {
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
      const res = await request(app).get('/api/activities/1');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.title).toBeDefined();
    });

    it('retourne 404 pour un id inexistant', async () => {
      const res = await request(app).get('/api/activities/99999');
      expect(res.status).toBe(404);
    });
  });
});
