import mongoose from 'mongoose';

const vendorPaymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  supplierName: { type: String, required: true },
  supplierPhone: { type: String, default: '' },
  purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase' },
  poNumber: { type: String, default: '' },
  amount: { type: Number, required: true },
  paymentMode: { type: String, required: true, default: 'Cash' }, // Cash, UPI, Bank Transfer, Cheque
  reference: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

const VendorPayment = mongoose.model('VendorPayment', vendorPaymentSchema);

export default VendorPayment;
