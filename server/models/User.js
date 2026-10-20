const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  color: { type: String, default: 'bg-blue-600' },
  favorites: { type: [Number], default: [] } // массив ID фильмов из TMDB
});

module.exports = mongoose.model('User', userSchema);