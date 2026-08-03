import mongoose from 'mongoose';

/**
 * One row per (subscription, delivery date) the engine has acted on.
 *
 * This is what makes the engine idempotent. The unique index is the guard: a
 * second run on the same day fails to insert, so it cannot create a second
 * order or take a second debit. The row is written *before* the order and the
 * wallet debit, so a crash mid-run leaves a claimed row rather than a silent
 * double charge — `status` records how far the run actually got.
 *
 * The guard lives here rather than as a unique index on Order because the ERP
 * and the storefront also create orders, and they must stay free to create
 * more than one per customer per day.
 */
const subscriptionDeliverySchema = new mongoose.Schema({
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  // Midnight IST of the day being delivered — see utils/ist.js. Two runs on the
  // same day must produce the identical value here or the guard does nothing.
  deliveryDate: { type: Date, required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  amount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['claimed', 'charged', 'failed'],
    default: 'claimed',
    index: true
  },
  note: { type: String }
}, {
  timestamps: true
});

subscriptionDeliverySchema.index({ subscription: 1, deliveryDate: 1 }, { unique: true });

const SubscriptionDelivery = mongoose.model('SubscriptionDelivery', subscriptionDeliverySchema);

export default SubscriptionDelivery;
