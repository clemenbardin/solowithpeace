const mongoose = require('mongoose');

const featureFlagSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  enabled: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('FeatureFlag', featureFlagSchema);
