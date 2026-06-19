const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  destination: { type: String, required: true },
  start_date:  { type: String },
  end_date:    { type: String },
  spots_total: { type: Number, default: 8 },
  spots_left:  { type: Number, default: 8 },
  category:    { type: String },
  gradient:    { type: String },
  created_by:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    joined_at: { type: Date, default: Date.now },
  }],
  accommodation: {
    type:        { type: String, enum: ['commun', 'personnel'], default: 'commun' },
    description: { type: String },
  },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = mongoose.model('Trip', tripSchema);