import mongoose from 'mongoose';

const procurementSchema = new mongoose.Schema({
  procId: { type: String, required: true, unique: true },
  farmerName: { type: String, required: true },
  shift: { type: String, required: true, enum: ['Morning', 'Evening'] },
  milkType: { type: String, required: true, enum: ['Cow', 'Buffalo', 'A2 Cow'] },
  quantityLiters: { type: Number, required: true },
  fatPercentage: { type: Number, required: true },
  snfPercentage: { type: Number, required: true },
  ratePerLiter: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Procurement = mongoose.model('Procurement', procurementSchema);

export default Procurement;
