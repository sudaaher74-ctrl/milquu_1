import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: false, // Optional for POS walk-in customers
    ref: 'User',
  },
  name: { type: String }, // For guest checkout
  phone: { type: String }, // For guest checkout
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
      },
    }
  ],
  shippingAddress: {
    address: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  paymentMethod: { type: String, required: true, default: 'Cash on Delivery' },
  paymentStatus: { type: String, required: true, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
  },
  taxPrice: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, required: true, default: false },
  deliveredAt: { type: Date },
  proofOfDelivery: { type: String },
  deliveryStatus: { type: String, default: 'Pending' },
  failedReason: { type: String },
  deliverySlot: { type: String, enum: ['Morning', 'Evening'], default: 'Morning' },
  scheduledDeliveryDate: { type: Date },
  scheduledDeliveryWindow: { type: String, default: '4:00 AM – 7:00 AM' },
  deliveryStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryStaff',
  },
  orderSource: { 
    type: String, 
    required: true, 
    enum: ['Website', 'App', 'POS'], 
    default: 'Website' 
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
