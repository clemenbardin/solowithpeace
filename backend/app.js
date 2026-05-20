const express = require('express');
const cors = require('cors');

const { router: authRouter } = require('./routes/auth');
const tripsRouter = require('./routes/trips');
const activitiesRouter = require('./routes/activities');
const testimonialsRouter = require('./routes/testimonials');
const flagsRouter = require('./routes/flags');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/flags', flagsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

module.exports = app;
