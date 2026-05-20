const express = require('express');
const Trip = require('../models/Trip');
const { verifyToken } = require('./auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    const filter = category ? { category } : {};
    const trips = await Trip.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
    res.json(trips);
  } catch (err) {
    console.error('[trips GET /]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Voyage non trouvé' });
    res.json(trip);
  } catch (err) {
    console.error('[trips GET /:id]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/:id/join', verifyToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Voyage non trouvé' });
    if (trip.spots_left <= 0) return res.status(400).json({ error: 'Plus de places disponibles' });

    await Trip.findByIdAndUpdate(req.params.id, { $inc: { spots_left: -1 } });
    res.json({ message: 'Inscription confirmée', trip_id: trip._id });
  } catch (err) {
    console.error('[trips POST /:id/join]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;