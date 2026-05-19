const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  author_name:     { type: String, required: true },
  author_initials: { type: String, required: true },
  author_color:    { type: String, default: 'emerald' },
  quote_title:     { type: String, required: true },
  quote_body:      { type: String, required: true },
  subtitle:        { type: String },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = mongoose.model('Testimonial', testimonialSchema);