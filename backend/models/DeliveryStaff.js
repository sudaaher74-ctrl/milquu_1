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

deliveryStaffSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const DeliveryStaff = mongoose.model('DeliveryStaff', deliveryStaffSchema);

export default DeliveryStaff;
