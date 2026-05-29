import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  phone: { type: String },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Pending', 'Cancelled', 'Delivered', 'active', 'paused'], default: 'Pending' },
  deliveryAddress: { type: String, required: true },
  frequency: { type: String, enum: ['Daily', 'Alternate Days', 'Weekly', 'One-time', 'daily', 'alternate'], default: 'One-time' },
  startDate: { type: Date, default: Date.now }
}, {
  strict: false,
  timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
