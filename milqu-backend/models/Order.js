// models/Order.js
const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  id:    { type: String, required: true },
  name:  { type: String, required: true },
  price: { type: Number, required: true },
  qty:   { type: Number, required: true },
  e:     { type: String },   // emoji
  unit:  { type: String }
}, { _id: false });

const CustomerSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  phone:   { type: String, required: true },
  email:   { type: String },
  address: { type: String, required: true },
  notes:   { type: String }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderId:       { type: String, required: true, unique: true },
  customer:      { type: CustomerSchema, required: true },
  items:         { type: [OrderItemSchema], required: true },
  total:         { type: Number, required: true },
  paymentMethod: { type: String, enum: ['upi', 'card', 'netbanking', 'cod'], required: true },
  status:        { type: String, enum: ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'], default: 'confirmed' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  createdAt:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);