const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/solowithpeace';
  await mongoose.connect(uri);
  console.log('[MongoDB] Connexion établie');
}

module.exports = connectDB;