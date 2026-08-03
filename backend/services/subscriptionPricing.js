// Turning a customer's requested crate into a priced subscription. Every price
// here comes from the Product collection — a price, quantity subtotal or total
// arriving from the client is ignored outright.

import Product, { priceOf } from '../models/Product.js';
import { toPaise, toRupees, sumItemsPaise } from '../utils/money.js';
import { deliveriesPerMonth, RHYTHMS } from '../utils/rhythm.js';

/** Map any accepted frequency spelling onto one of the app's three rhythms. */
export const normaliseRhythm = (frequency) => {
  const value = String(frequency || 'daily').toLowerCase();
  if (value === 'alternate' || value === 'alternate days') return 'alternate';
  if (value === 'custom' || value === 'weekly') return 'custom';
  if (value === 'one-time') return 'one-time';
  return 'daily';
};

/** The legacy `frequency` enum value to store alongside a rhythm. */
export const legacyFrequency = (rhythm) =>
  rhythm === 'one-time' ? 'One-time' : RHYTHMS[rhythm]?.frequency ?? 'Daily';

export class PricingError extends Error {
  constructor(message, path) {
    super(message);
    this.path = path;
    this.status = 400;
  }
}

/**
 * Price a crate at the standing-order rate.
 *
 * Returns the item rows to store (with server prices), the cost of one
 * delivery, and the cost of a typical month at the given rhythm. Throws a
 * PricingError naming the offending item if a product id is unknown.
 */
export const priceCrate = async (items, { rhythm = 'daily', weekdays = [], onPlan = true } = {}) => {
  const ids = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: ids } }).select('name price planPrice image unit');
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const priced = items.map((item) => {
    const product = byId.get(String(item.product));
    if (!product) {
      throw new PricingError('One of the items in your crate is no longer available', 'items');
    }
    return {
      product: product._id,
      quantity: item.quantity,
      // Server price, always. Never item.price.
      price: priceOf(product, onPlan),
      name: product.name,
      image: product.image,
      unit: product.unit
    };
  });

  const dailyPaise = sumItemsPaise(priced);
  const perMonth = deliveriesPerMonth(rhythm, weekdays);

  return {
    // Only product/quantity/price are stored on the subscription; name and
    // image are returned for the caller to build an order line from.
    items: priced.map(({ product, quantity, price }) => ({ product, quantity, price })),
    detailedItems: priced,
    dailyTotal: toRupees(dailyPaise),
    monthlyTotal: toRupees(dailyPaise * perMonth),
    deliveriesPerMonth: perMonth
  };
};

/** Price a one-off basket, at the higher non-plan rate. */
export const priceBasket = async (items) => {
  const { detailedItems } = await priceCrate(items, { onPlan: false });
  return {
    items: detailedItems,
    totalPaise: sumItemsPaise(detailedItems),
    total: toRupees(sumItemsPaise(detailedItems))
  };
};

export { toPaise, toRupees };
