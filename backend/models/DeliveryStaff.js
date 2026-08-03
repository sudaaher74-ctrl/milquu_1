import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const deliveryStaffSchema = new mongoose.Schema({
  staffId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Simple string for demo, should be hashed in prod
  vehicleType: { type: String, default: 'Bike' },
  vehicleNumber: { type: String },
  city: { type: String, default: 'Navi Mumbai' },
  area: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  delivered: { type: Number, default: 0 },
  image: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    lastUpdated: { type: Date }
  }
}, {
  timestamps: true
});

deliveryStaffSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Takes no `next` — Mongoose 9 does not pass one to a promise-returning hook.
// The early return also stops an unchanged password being re-hashed, which
// would lock the staff member out.
deliveryStaffSchema.pre('save', async function() {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const DeliveryStaff = mongoose.model('DeliveryStaff', deliveryStaffSchema);

export default DeliveryStaff;
