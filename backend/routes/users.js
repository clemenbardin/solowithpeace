const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name role avatar_initials bio country languages interests createdAt');
    if (!user) {return res.status(404).json({ error: 'Utilisateur non trouvé' });}
    res.json(user);
  } catch (err) {
    console.error('[users GET /:id]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
