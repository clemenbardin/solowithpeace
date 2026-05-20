require('dotenv').config();
const mongoose = require('mongoose');
const { seedInitialData, resetDatabase } = require('./setup');

async function seed() {
  const reset = process.argv.includes('--reset');
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/solowithpeace';
  await mongoose.connect(uri);
  console.log('[Seed] Connecté à MongoDB');

  if (reset) {
    await resetDatabase();
    console.log('[Seed] Collections vidées');
  }

  await seedInitialData();
  await mongoose.disconnect();
  console.log('[Seed] Terminé avec succès');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Erreur:', err);
  process.exit(1);
});
