import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, index: true },
  // Legacy single-line address, kept so existing records and the storefront
  // checkout keep working. New writes also populate deliveryAddress below.
  address: { type: String },
  // Structured address used by the customer app. `area` is the serviceable
  // locality (New Panvel, Kharghar, …) and is what the app shows as "deliver to",
  // so it is indexed for the delivery-round queries that group by locality.
  deliveryAddress: {
    line1: { type: String },
    line2: { type: String },
    note: { type: String },
    label: { type: String, enum: ['Home', 'Office', 'Other'], default: 'Home' },
    area: { type: String, index: true }
  },
  role: { type: String, enum: ['user', 'admin', 'manager', 'staff', 'superadmin'], default: 'user' },
  password: { type: String, required: true, minlength: 12 },
  walletBalance: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Method to compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving to database
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
