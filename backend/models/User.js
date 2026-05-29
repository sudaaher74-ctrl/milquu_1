import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  password: { type: String } // optional for later if auth is implemented
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
