// Fixtures for the integration tests. Deliberately minimal: each test builds
// only the state its own assertion depends on.

import User from '../../models/User.js';
import Product from '../../models/Product.js';
import Subscription from '../../models/Subscription.js';
import { istTomorrow } from '../../utils/ist.js';

let phoneCounter = 0;

export const makeUser = async (overrides = {}) => {
  phoneCounter += 1;
  return User.create({
    name: 'Test Customer',
    phone: `98200${String(10000 + phoneCounter).slice(-5)}`,
    password: 'passwor1',
    walletBalance: 1000,
    address: '12 Dairy Lane, New Panvel',
    deliveryAddress: {
      line1: '12 Dairy Lane',
      line2: 'Sector 5',
      label: 'Home',
      area: 'new-panvel'
    },
    ...overrides
  });
};

export const makeProduct = async (overrides = {}) =>
  Product.create({
    name: 'Pure Cow Milk',
    description: 'Fresh cow milk',
    price: 68,
    planPrice: 60,
    unit: '1 L',
    image: '/img/products/cowmilk.webp',
    category: 'milk',
    ...overrides
  });

/** An active daily plan starting tomorrow, priced at the plan rate. */
export const makeSubscription = async (user, product, overrides = {}) => {
  const quantity = overrides.quantity ?? 2;
  const price = overrides.price ?? product.planPrice;
  delete overrides.quantity;
  delete overrides.price;

  return Subscription.create({
    user: user._id,
    name: user.name,
    phone: user.phone,
    items: [{ product: product._id, quantity, price }],
    totalAmount: price * quantity,
    dailyTotal: price * quantity,
    monthlyTotal: price * quantity * 30,
    status: 'Active',
    deliveryAddress: '12 Dairy Lane, Sector 5, New Panvel',
    deliveryArea: 'new-panvel',
    frequency: 'Daily',
    slotWindow: 'early',
    deliverySlot: 'Morning',
    startDate: istTomorrow(),
    skipDates: [],
    ...overrides
  });
};
