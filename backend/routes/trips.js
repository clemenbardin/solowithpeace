const express = require('express');
const Trip = require('../models/Trip');
const { verifyToken, verifyAdmin } = require('./auth');
const { tripsJoinedTotal } = require('../metrics');

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
    if (!trip) {return res.status(404).json({ error: 'Voyage non trouvé' });}
    res.json(trip);
  } catch (err) {
    console.error('[trips GET /:id]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/:id/join', verifyToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {return res.status(404).json({ error: 'Voyage non trouvé' });}
    if (trip.spots_left <= 0) {return res.status(400).json({ error: 'Plus de places disponibles' });}

    await Trip.findByIdAndUpdate(req.params.id, { $inc: { spots_left: -1 } });
    tripsJoinedTotal.inc();
    res.json({ message: 'Inscription confirmée', trip_id: trip._id });
  } catch (err) {
    console.error('[trips POST /:id/join]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: create a trip
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.title || !data.destination) {
      return res.status(400).json({ error: 'title et destination requis' });
    }
    const spots_total = Number(data.spots_total) || 8;
    const spots_left = typeof data.spots_left !== 'undefined' ? Number(data.spots_left) : spots_total;
    const trip = await Trip.create({ ...data, spots_total, spots_left, created_by: req.user.id });
    res.status(201).json(trip);
  } catch (err) {
    console.error('[trips POST /]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: update a trip
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const updates = req.body || {};
    if (updates.spots_total && !updates.spots_left) {
      updates.spots_left = updates.spots_total; // if admin changes total, reset left unless provided
    }
    const trip = await Trip.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!trip) { return res.status(404).json({ error: 'Voyage non trouvé' }); }
    res.json(trip);
  } catch (err) {
    console.error('[trips PUT /:id]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: delete a trip
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) { return res.status(404).json({ error: 'Voyage non trouvé' }); }
    res.json({ message: 'Voyage supprimé' });
  } catch (err) {
    console.error('[trips DELETE /:id]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;