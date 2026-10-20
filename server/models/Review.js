import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  movie_id: { type: Number, required: true },
  movie_title: { type: String },
  movie_poster: { type: String },
  author: { type: String, required: true },
  text: { type: String, required: true },
  rating: { type: Number, required: true },
  date: { type: String, required: true },
  user_email: { type: String, required: true }
});

module.exports = mongoose.model('Review', reviewSchema);