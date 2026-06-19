const express = require('express');
const Testimonial = require('../models/Testimonial');
const { verifyAdmin } = require('./auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: 1 });
    res.json(testimonials);
  } catch (err) {
    console.error('[testimonials GET /]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: create testimonial
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.author_name || !data.author_initials || !data.quote_title || !data.quote_body) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }
    const t = await Testimonial.create(data);
    res.status(201).json(t);
  } catch (err) {
    console.error('[testimonials POST /]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: update testimonial
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body || {}, { new: true });
    if (!t) { return res.status(404).json({ error: 'Témoignage non trouvé' }); }
    res.json(t);
  } catch (err) {
    console.error('[testimonials PUT /:id]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Admin: delete testimonial
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndDelete(req.params.id);
    if (!t) { return res.status(404).json({ error: 'Témoignage non trouvé' }); }
    res.json({ message: 'Témoignage supprimé' });
  } catch (err) {
    console.error('[testimonials DELETE /:id]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;