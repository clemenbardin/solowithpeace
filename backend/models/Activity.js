const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title:             { type: String, required: true },
  description:       { type: String },
  category:          { type: String },
  icon_type:         { type: String },
  color:             { type: String, default: 'emerald' },
  participant_count: { type: Number, default: 0 },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = mongoose.model('Activity', activitySchema);
