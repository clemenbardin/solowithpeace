const request = require('supertest');
const app = require('../app');

describe('Users Routes', () => {
  it('retourne un profil public sans données sensibles', async () => {
    const trips = await request(app).get('/api/trips');
    const trip = await request(app).get(`/api/trips/${trips.body[0]._id}`);
    const userId = trip.body.created_by._id;

    const res = await request(app).get(`/api/users/${userId}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBeDefined();
    expect(res.body.bio).toBeDefined();
    expect(res.body.email).toBeUndefined();
    expect(res.body.password).toBeUndefined();
  });
});
