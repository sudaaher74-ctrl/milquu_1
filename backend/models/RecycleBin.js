import mongoose from 'mongoose';

const recycleBinSchema = new mongoose.Schema({
  itemType: {
    type: String,
    required: true,
    enum: ['Order', 'Customer', 'KhataBill', 'Purchase'],
    index: true
  },
  originalId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    default: ''
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  relatedData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  metadata: {
    customerName: { type: String, default: '' },
    customerId: { type: mongoose.Schema.Types.ObjectId, default: null },
    date: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    litres: { type: Number, default: 0 },
    billingCycle: { type: String, default: '' }
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedByName: {
    type: String,
    default: 'Admin'
  },
  deletedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

recycleBinSchema.index({ itemType: 1, deletedAt: -1 });
recycleBinSchema.index({ 'metadata.customerId': 1 });

const RecycleBin = mongoose.model('RecycleBin', recycleBinSchema);
export default RecycleBin;
