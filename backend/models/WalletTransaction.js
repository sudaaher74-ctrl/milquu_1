import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  // Set on Razorpay top-ups. Unique, so the same payment can never be
  // credited twice even when two verify requests race each other.
  razorpayPaymentId: {
    type: String
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true
});

walletTransactionSchema.index({ createdAt: -1 });
walletTransactionSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);

export default WalletTransaction;
