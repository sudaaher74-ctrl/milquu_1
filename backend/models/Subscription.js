import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Pending', 'Cancelled', 'Delivered'], default: 'Pending' },
  deliveryAddress: { type: String, required: true },
  frequency: { type: String, enum: ['Daily', 'Alternate Days', 'Weekly', 'One-time'], default: 'Daily' },
  startDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
