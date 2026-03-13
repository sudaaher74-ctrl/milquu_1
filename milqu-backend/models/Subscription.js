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
  paymentMethod:  { type: String, enum: ['upi', 'card', 'netbanking', 'cod'], default: 'upi' },
  status:         { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' },
  createdAt:      { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);