import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  color: { type: String, default: 'bg-blue-600' },
  favorites: { type: [Number], default: [] }
});

export default mongoose.model('User', userSchema);