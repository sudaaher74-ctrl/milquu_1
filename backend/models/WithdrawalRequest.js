import mongoose from 'mongoose';

const withdrawalRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  amount: {
    type: Number,
    required: true,
  },
  refundMethod: {
    type: String,
    required: true,
    enum: ['UPI', 'Bank Account'],
  },
  upiId: {
    type: String,
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountName: String,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending',
  },
  adminRemarks: {
    type: String,
  },
  processedAt: {
    type: Date,
  }
}, {
  timestamps: true
});

const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

export default WithdrawalRequest;
