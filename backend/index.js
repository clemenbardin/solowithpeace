const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { router: authRouter } = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Backend sur http://localhost:${PORT}`);
});