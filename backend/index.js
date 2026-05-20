require('dotenv').config();
const app = require('./app');
const connectDB = require('./db/connection');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[SoloWithPeace] Backend démarré sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[SoloWithPeace] Erreur de connexion MongoDB:', err);
    process.exit(1);
  });
