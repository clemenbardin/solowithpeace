const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
  const testimonials = db.prepare(
    'SELECT * FROM testimonials ORDER BY created_at ASC'
  ).all();
  res.json(testimonials);
});

module.exports = router;
