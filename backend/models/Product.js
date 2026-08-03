import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  // The standing-order rate. Milk is cheaper on a plan than bought one-off, so
  // subscriptions price from here and one-off orders price from `price`.
  // Products without a separate plan rate leave this null and fall back to
  // `price` — see planPriceOf() below, which is the only place that decides.
  planPrice: { type: Number, default: null },
  unit: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true }, // e.g., 'milk', 'by-products'
  labels: [{ type: String }], // e.g., ['Farm Fresh', 'A2 Protein']
  
  // ERP Fields
  purchasePrice: { type: Number, default: 0 },
  marginPercentage: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  stockValue: { type: Number, default: 0 },
  
  // New Inventory Tracking & COGS Fields
  openingStockQty: { type: Number, default: 0 },
  openingStockValue: { type: Number, default: 0 },
  currentStockQty: { type: Number, default: 0 },
  currentStockValue: { type: Number, default: 0 },
  stockBatches: [{
    qty: { type: Number, required: true },
    costPerUnit: { type: Number, required: true },
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

/**
 * The rate to charge for one unit of a product. `onPlan` picks the
 * standing-order rate where the product has one. Server-side callers must use
 * this rather than any price the client sent.
 */
export const priceOf = (product, onPlan = false) => {
  if (!product) return 0;
  if (onPlan && product.planPrice != null && product.planPrice > 0) return product.planPrice;
  return product.price;
};

const Product = mongoose.model('Product', productSchema);

export default Product;
