const express = require('express');
const cors = require('cors');
const { register, httpRequestsTotal, httpRequestsDurationMs } = require('./metrics');

const { router: authRouter } = require('./routes/auth');
const tripsRouter = require('./routes/trips');
const activitiesRouter = require('./routes/activities');
const testimonialsRouter = require('./routes/testimonials');
const flagsRouter = require('./routes/flags');

const app = express();

app.use((req, res, next) => {
  const end = httpRequestsDurationMs.startTimer();
  res.on('finish', () => {
    const route = req.route?.path || req.path;
    httpRequestsTotal.inc({ method: req.method, route, status_code: res.statusCode });
    end({ method: req.method, route, status_code: res.statusCode });
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

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
