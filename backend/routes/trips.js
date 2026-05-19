const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('./auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { category, limit = 20 } = req.query;
  let query = 'SELECT * FROM trips';
  const params = [];

  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }

  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(Number(limit));

  const trips = db.prepare(query).all(...params);
  res.json(trips);
});

router.get('/:id', (req, res) => {
  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Voyage non trouvé' });
  res.json(trip);
});

router.post('/:id/join', verifyToken, (req, res) => {
  const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Voyage non trouvé' });
  if (trip.spots_left <= 0) return res.status(400).json({ error: 'Plus de places disponibles' });

  db.prepare('UPDATE trips SET spots_left = spots_left - 1 WHERE id = ?').run(req.params.id);
  res.json({ message: 'Inscription confirmée', trip_id: trip.id });
});

module.exports = router;
