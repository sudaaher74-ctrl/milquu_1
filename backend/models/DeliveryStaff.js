import mongoose from 'mongoose';

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
  image: { type: String }
}, {
  timestamps: true
});

const DeliveryStaff = mongoose.model('DeliveryStaff', deliveryStaffSchema);

export default DeliveryStaff;
