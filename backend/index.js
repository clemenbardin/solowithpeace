const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { router: authRouter } = require('./routes/auth');
const tripsRouter = require('./routes/trips');
const activitiesRouter = require('./routes/activities');
const testimonialsRouter = require('./routes/testimonials');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/testimonials', testimonialsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.listen(PORT, () => {
  console.log(`[SoloWithPeace] Backend démarré sur http://localhost:${PORT}`);
});
