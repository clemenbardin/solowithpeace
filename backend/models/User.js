const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:           { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:        { type: String, required: true },
  name:            { type: String, required: true, trim: true },
  role:            { type: String, default: 'Voyageur' },
  avatar_initials: { type: String },
  bio:             { type: String },
  country:         { type: String },
  languages:       [{ type: String }],
  interests:       [{ type: String }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = mongoose.model('User', userSchema);
