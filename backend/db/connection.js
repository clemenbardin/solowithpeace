const mongoose = require('mongoose');
const { mongoConnectionStatus } = require('../metrics');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  await mongoose.connect(uri);
  console.log('[MongoDB] Connexion établie');
  mongoConnectionStatus.set(1);
}

module.exports = connectDB;