import mongoose from 'mongoose';

const financierTransactionSchema = new mongoose.Schema({
  transactionId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  financier: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Financier', 
    required: true,
    index: true 
  },
  financierName: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['FINANCED', 'REPAYMENT'], 
    required: true,
    index: true 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: [1, 'Amount must be greater than 0'] 
  },
  date: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  paymentMode: { 
    type: String, 
    default: 'UPI' 
  },
  reference: { 
    type: String, 
    default: '' 
  },
  linkedVendor: { 
    type: String, 
    default: '' 
  },
  purchaseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Purchase',
    default: null 
  },
  vendorPaymentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'VendorPayment',
    default: null 
  },
  notes: { 
    type: String, 
    default: '' 
  },
  runningBalance: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true
});

financierTransactionSchema.index({ financier: 1, date: -1 });

const FinancierTransaction = mongoose.model('FinancierTransaction', financierTransactionSchema);

export default FinancierTransaction;

