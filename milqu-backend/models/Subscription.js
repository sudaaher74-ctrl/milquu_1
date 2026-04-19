// models/Subscription.js
const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  subscriptionId: { type: String, required: true, unique: true },
  name:           { type: String, required: true },
  phone:          { type: String, required: true },
  address:        { type: String, required: true },
  milkType:       { type: String, enum: ['cow', 'buffalo', 'organic'], required: true },
  qty:            { type: Number, required: true },
  schedule:       { type: String, enum: ['daily', 'alternate', 'weekdays', 'custom'], required: true },
  startDate:      { type: String },
  notes:          { type: String },
  monthlyTotal:   { type: String },
  paymentMethod:  { type: String, enum: ['upi', 'card', 'netbanking', 'cod'], default: 'cod' },
  area_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: false },
  assigned_delivery_boy_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: false },
  status:         { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' }
}, { timestamps: true });

SubscriptionSchema.index({ status: 1, createdAt: -1 });
SubscriptionSchema.index({ phone: 1, createdAt: -1 });
SubscriptionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
