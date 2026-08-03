import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { normalisePhone } from '../utils/phone.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Customers sign up with a phone number, so email is optional. Both are
  // sparse-unique: a document without the field does not collide with another
  // one that also lacks it, which is what lets phone-only and email-only
  // accounts (admin, manager, staff) coexist in this collection.
  email: { type: String, unique: true, sparse: true, index: true },
  // The customer's sign-in identifier, stored normalised to 10 digits.
  // Not `required` at the schema level: existing records predate it and would
  // fail to save on an unrelated write (a wallet credit) if it were. New
  // signups are required to supply one by registerSchema.
  phone: { type: String, unique: true, sparse: true, index: true },
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
  // Kept in step with PASSWORD_MIN in validations/userValidations.js — when the
  // two disagreed, a valid-looking password failed here as an unhandled 500.
  password: { type: String, required: true, minlength: 8 },
  walletBalance: { type: Number, default: 0 }
}, {
  timestamps: true
});

/**
 * Normalise the two identifiers before every write. A blank string must become
 * `undefined` rather than '' — a sparse unique index treats '' as a real value,
 * so two accounts saved without an email would collide on it.
 */
userSchema.pre('save', function (next) {
  if (this.isModified('phone')) {
    const phone = normalisePhone(this.phone);
    this.phone = phone || undefined;
  }
  if (this.isModified('email')) {
    const email = String(this.email || '').trim().toLowerCase();
    this.email = email || undefined;
  }
  next();
});

// Method to compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving to database
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new). This must
  // return — without it every later save (a wallet credit, an address change)
  // fell through and re-hashed the stored hash, locking the customer out.
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
