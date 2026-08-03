import mongoose from 'mongoose';

/**
 * A customer's standing order.
 *
 * The fields the admin dashboard, the ERP and the delivery-staff app read —
 * `deliveryAddress` (a string), `frequency`, `deliverySlot` — keep their
 * existing meaning and are written on every save. The app's richer rhythm
 * (`weekdays`, `skipDates`, `slotWindow`) is additive: `frequency` and
 * `deliverySlot` are derived from it so the older readers stay correct.
 */
const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
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
  // Cost of one delivery, and of a typical month at this rhythm. Both are
  // computed server-side from the Product collection. The engine and the
  // wallet's reserved-balance maths read these; before, they read a
  // `monthlyTotal` that only ever arrived from the client and was usually
  // absent, making the daily cost NaN.
  dailyTotal: { type: Number, default: 0 },
  monthlyTotal: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Pending', 'Cancelled', 'Delivered', 'Paused', 'Completed'], default: 'Pending', index: true },
  deliveryAddress: { type: String, required: true },
  frequency: { type: String, enum: ['Daily', 'Alternate Days', 'Weekly', 'One-time'], default: 'One-time' },
  // Which weekdays this plan delivers on, 0 = Sunday … 6 = Saturday. Set when
  // the customer picks specific days; `frequency` is set to 'Weekly' alongside
  // it so the existing readers still see something they understand.
  weekdays: { type: [Number], default: undefined },
  // Individual dates the customer has skipped, stored at midnight IST.
  // pauseStartDate/pauseEndDate can only express one contiguous holiday; this
  // is what expresses "skip Thursday and the 14th".
  skipDates: { type: [Date], default: [] },
  startDate: { type: Date, default: Date.now },
  pauseStartDate: { type: Date },
  pauseEndDate: { type: Date },
  assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryStaff', index: true },
  deliverySlot: { type: String, enum: ['Morning', 'Evening'], default: 'Morning' },
  // The app offers two morning windows, which 'Morning' alone cannot express.
  // deliverySlot stays populated for the admin and delivery-staff views.
  slotWindow: { type: String, enum: ['early', 'late'], default: 'early' },
  deliveryArea: { type: String, index: true }
}, {
  strict: false,
  timestamps: true
});

// The engine sweeps active subscriptions; the app lists one customer's own.
subscriptionSchema.index({ status: 1, _id: 1 });
subscriptionSchema.index({ user: 1, status: 1 });

/** The two morning windows the app offers, as shown to the customer. */
export const SLOT_WINDOWS = {
  early: { label: '6:00 – 7:30 am', deliverySlot: 'Morning' },
  late: { label: '7:30 – 9:00 am', deliverySlot: 'Morning' }
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
