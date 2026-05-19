const request = require('supertest');
const app = require('../app');

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('crée un nouveau compte valide', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'register1@test.com', password: 'password123', name: 'Test User' });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('register1@test.com');
      expect(res.body.user.name).toBe('Test User');
    });

    it('refuse les champs manquants', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'incomplete@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('refuse un mot de passe trop court (< 6 chars)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'short@test.com', password: '123', name: 'Short' });

      expect(res.status).toBe(400);
    });

    it('refuse un email déjà existant', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'admin@admin.com', password: 'password123', name: 'Doublon' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('connecte avec des identifiants valides', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@admin.com', password: 'admin' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('admin@admin.com');
    });

    it('refuse un mot de passe incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@admin.com', password: 'mauvais_mdp' });

      expect(res.status).toBe(401);
    });

    it('refuse un email inconnu', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'inconnu@test.com', password: 'password123' });

      expect(res.status).toBe(401);
    });

    it('refuse les champs manquants', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@admin.com' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('répond avec succès', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@admin.com', password: 'admin' });
      token = res.body.token;
    });

    it('retourne le profil avec un token valide', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('admin@admin.com');
    });

    it('refuse sans token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('refuse un token invalide', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token_invalide_xxx');

      expect(res.status).toBe(401);
    });

    it('refuse un header Authorization malformé', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat');

      expect(res.status).toBe(401);
    });
  });
});
