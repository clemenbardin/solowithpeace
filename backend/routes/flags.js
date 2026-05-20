const express = require('express');
const FeatureFlag = require('../models/FeatureFlag');
const { verifyAdmin } = require('./auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const flags = await FeatureFlag.find().sort({ key: 1 });
    res.json(flags.map((flag) => ({
      key: flag.key,
      name: flag.name,
      description: flag.description,
      enabled: flag.enabled,
    })));
  } catch (err) {
    console.error('[flags GET /]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.patch('/:key', verifyAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Le champ enabled doit être un booléen' });
    }

    const flag = await FeatureFlag.findOneAndUpdate({ key }, { enabled }, { new: true, upsert: false });
    if (!flag) {
      return res.status(404).json({ error: 'Feature flag introuvable' });
    }

    res.json({ key: flag.key, enabled: flag.enabled });
  } catch (err) {
    console.error('[flags PATCH /:key]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
