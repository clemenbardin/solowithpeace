const request = require('supertest');
const app = require('../app');

describe('Testimonials Routes', () => {
  describe('GET /api/testimonials', () => {
    it('retourne la liste des témoignages', async () => {
      const res = await request(app).get('/api/testimonials');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('chaque témoignage a les champs attendus', async () => {
      const res = await request(app).get('/api/testimonials');
      expect(res.status).toBe(200);
      res.body.forEach((t) => {
        expect(t.author_name).toBeDefined();
        expect(t.quote_title).toBeDefined();
        expect(t.quote_body).toBeDefined();
      });
    });
  });
});
