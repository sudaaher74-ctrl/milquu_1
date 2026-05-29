import mongoose from 'mongoose';

const wastageSchema = new mongoose.Schema({
  wastageId: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }, // e.g., 'kg', 'Liters', 'pcs'
  reason: { type: String, required: true },
  lossValue: { type: Number, required: true },
  reportedBy: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Wastage = mongoose.model('Wastage', wastageSchema);

export default Wastage;
