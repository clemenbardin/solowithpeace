const express = require('express');
const Trip = require('../models/Trip');
const { verifyToken } = require('./auth');
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
    const trip = await Trip.findById(req.params.id)
      .populate('created_by', 'name role avatar_initials')
      .populate('members.user', 'name role avatar_initials');
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
    const alreadyMember = trip.members.some((member) => member.user.toString() === req.user.id);
    if (alreadyMember) {return res.status(400).json({ error: 'Vous avez déjà rejoint ce voyage' });}

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      {
        $push: { members: { user: req.user.id } },
        $inc: { spots_left: -1 },
      },
      { new: true }
    ).populate('members.user', 'name role avatar_initials');
    tripsJoinedTotal.inc();
    res.json({ message: 'Inscription confirmée', trip: updatedTrip });
  } catch (err) {
    console.error('[trips POST /:id/join]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;