const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
  const activities = db.prepare(
    'SELECT * FROM activities ORDER BY participant_count DESC'
  ).all();
  res.json(activities);
});

router.get('/:id', (req, res) => {
  const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
  if (!activity) return res.status(404).json({ error: 'Activité non trouvée' });
  res.json(activity);
});

module.exports = router;
