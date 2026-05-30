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
  paymentMethod: { type: String, required: true, default: 'Cash' },
  taxPrice: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, required: true, default: false },
  deliveredAt: { type: Date },
  proofOfDelivery: { type: String },
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
