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
export const priceCrate = async (items, { rhythm = 'daily', weekdays = [], onPlan = true, milkOnly = false } = {}) => {
  const ids = items.map((i) => {
    let pid = i.product;
    if (typeof pid === 'string' && pid.includes('-')) {
      pid = pid.split('-')[0];
    }
    return pid;
  });
  const products = await Product.find({ _id: { $in: ids } }).select('name price planPrice image unit category');
  const byId = new Map(products.map((p) => [String(p._id), p]));

  // Standing-order plans are cow or buffalo milk only — ghee, paneer, dahi and
  // lassi are one-off purchases (priceBasket), never a recurring line. This is
  // a business rule, not a data limitation: those products do carry a
  // planPrice for other reasons, so the check has to be explicit here.
  if (milkOnly && !items.some((i) => {
    let pid = i.product;
    if (typeof pid === 'string' && pid.includes('-')) pid = pid.split('-')[0];
    return byId.get(String(pid))?.category === 'milk';
  })) {
    throw new PricingError('A plan needs at least one milk item', 'items');
  }

  const priced = items.map((item) => {
    let rawProductId = item.product;
    let cleanProductId = rawProductId;
    if (typeof cleanProductId === 'string' && cleanProductId.includes('-')) {
      cleanProductId = cleanProductId.split('-')[0];
    }
    const product = byId.get(String(cleanProductId));
    if (!product) {
      throw new PricingError('One of the items in your crate is no longer available', 'items');
    }
    if (milkOnly && product.category !== 'milk') {
      throw new PricingError(`${product.name} can't be added to a standing plan — try a one-off order instead`, 'items');
    }
    const isMilk = product.category === 'milk' || (product.name || '').toLowerCase().includes('milk');
    const isHalfLitre = Boolean(
      (typeof rawProductId === 'string' && (rawProductId.toLowerCase().includes('500ml') || rawProductId.toLowerCase().includes('500_ml'))) ||
      (typeof item.unit === 'string' && item.unit.toLowerCase().includes('500')) ||
      (typeof item.name === 'string' && item.name.toLowerCase().includes('500'))
    );
    const basePrice = priceOf(product, onPlan);
    const unitPrice = (isMilk && isHalfLitre) ? Math.ceil(basePrice / 2) : basePrice;

    return {
      product: product._id,
      quantity: item.quantity,
      // Server price, always. Never item.price.
      price: unitPrice,
      name: isHalfLitre && !product.name.includes('500') ? `${product.name} (500 ml)` : product.name,
      image: product.image,
      unit: isHalfLitre ? '500 ml' : product.unit
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
