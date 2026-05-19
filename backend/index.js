const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./db/connection');

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/testimonials', testimonialsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[SoloWithPeace] Backend démarré sur http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('[SoloWithPeace] Erreur de connexion MongoDB:', err);
    process.exit(1);
  });
