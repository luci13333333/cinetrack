import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String, default: '' },
  color: { type: String, default: 'bg-blue-600' },
  favorites: { type: [Number], default: [] },
  watchlist: { type: [Number], default: [] },
});

export default mongoose.model('User', userSchema);