import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  supplierName: { type: String, required: true },
  category: { type: String, required: true }, // e.g., 'Raw Milk', 'Packaging', 'Transport'
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  status: { type: String, required: true, enum: ['Pending', 'Received', 'Paid'], default: 'Pending' },
  date: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

export default Purchase;
