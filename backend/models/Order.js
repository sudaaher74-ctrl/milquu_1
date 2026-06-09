import mongoose from 'mongoose';
import Product from './Product.js';

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
      cogs: { type: Number, default: 0 },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
      },
    }
  ],
  totalCogs: { type: Number, default: 0 },
  grossProfit: { type: Number, default: 0 },
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

// Pre-save hook to calculate COGS using FIFO
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      let orderTotalCogs = 0;
      
      for (const item of this.orderItems) {
        if (item.product) {
          const product = await Product.findById(item.product);
          if (product) {
            let qtyToFulfill = item.qty;
            let itemCogs = 0;
            
            // Deduct from currentStockQty
            product.currentStockQty -= item.qty;
            product.stock -= item.qty; // Keep legacy stock updated just in case
            
            // FIFO logic
            while (qtyToFulfill > 0 && product.stockBatches && product.stockBatches.length > 0) {
              const batch = product.stockBatches[0];
              if (batch.qty <= qtyToFulfill) {
                // Consume entire batch
                itemCogs += batch.qty * batch.costPerUnit;
                qtyToFulfill -= batch.qty;
                product.stockBatches.shift(); // Remove the empty batch
              } else {
                // Consume partial batch
                itemCogs += qtyToFulfill * batch.costPerUnit;
                batch.qty -= qtyToFulfill;
                qtyToFulfill = 0;
              }
            }
            
            // If still qtyToFulfill > 0, it means we don't have enough purchase batches to cover.
            // We use openingStockValue or 0 cost for the remainder.
            if (qtyToFulfill > 0) {
              // Assume 0 cost or average cost. For simplicity, assuming 0 cost.
            }
            
            item.cogs = itemCogs;
            orderTotalCogs += itemCogs;
            
            // Update currentStockValue
            let newValue = 0;
            product.stockBatches.forEach(b => newValue += (b.qty * b.costPerUnit));
            product.currentStockValue = newValue;
            product.stockValue = newValue; // Keep legacy updated
            
            await product.save();
          }
        }
      }
      
      this.totalCogs = orderTotalCogs;
      this.grossProfit = this.totalPrice - this.totalCogs;
    } catch (err) {
      console.error('Error calculating COGS in Order pre-save hook:', err);
    }
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
