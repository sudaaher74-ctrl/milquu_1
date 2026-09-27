import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  supplierName: { type: String, required: true },
  supplierPhone: { type: String, default: '' },
  supplierAddress: { type: String, default: '' },
  supplierGst: { type: String, default: '' },
  category: { type: String, required: true }, // e.g., 'Raw Milk', 'Packaging', 'Transport'
  productName: { type: String, required: true },
  unit: { type: String, default: 'Litre' },
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number, default: 0 },
  status: { type: String, required: true, enum: ['Pending', 'Received', 'Paid', 'Partial'], default: 'Pending' },
  paymentMode: { type: String, default: 'Cash' },
  notes: { type: String, default: '' },
  payments: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      paymentMode: { type: String, default: 'Cash' },
      reference: { type: String, default: '' },
      notes: { type: String, default: '' }
    }
  ],
  date: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

export default Purchase;
