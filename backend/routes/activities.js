const express = require('express');
const Activity = require('../models/Activity');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ participant_count: -1 });
    res.json(activities);
  } catch (err) {
    console.error('[activities GET /]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activité non trouvée' });
    res.json(activity);
  } catch (err) {
    console.error('[activities GET /:id]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;