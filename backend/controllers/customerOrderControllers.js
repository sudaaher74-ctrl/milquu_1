// One-off orders placed from the customer app — the extras a customer adds to
// tomorrow's crate on top of their plan. The plan itself is charged nightly by
// the subscription engine, not here.

import Order from '../models/Order.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { isServiceableArea, areaName } from '../config/serviceAreas.js';
import { istTomorrow, istDateKey, isLockedForChanges } from '../utils/ist.js';
import { priceBasket, PricingError } from '../services/subscriptionPricing.js';
import { toPaise, toRupees } from '../utils/money.js';

// @route  POST /api/users/orders
// @desc   Place a one-off order for tomorrow, paid from the wallet
// @access Private
export const createMyOrder = async (req, res) => {
  try {
    const { items } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const address = user.deliveryAddress;
    if (!address?.line1 || !address?.area) {
      return res.status(400).json({ message: 'Add a delivery address before ordering' });
    }
    if (!isServiceableArea(address.area)) {
      return res.status(400).json({ message: 'We do not deliver to that area yet' });
    }

    const deliveryDate = istTomorrow();
    if (isLockedForChanges(deliveryDate)) {
      return res.status(409).json({
        message: 'Tomorrow’s round is already with the dairy. Anything ordered now arrives the morning after.'
      });
    }

    // Priced at the one-off rate, from the Product collection. Nothing the
    // client sent about price or total is read.
    const basket = await priceBasket(items);
    if (basket.totalPaise <= 0) {
      return res.status(400).json({ message: 'Add something to your crate first' });
    }

    const balancePaise = toPaise(user.walletBalance || 0);
    if (balancePaise < basket.totalPaise) {
      return res.status(402).json({
        message: 'Your wallet does not cover this order',
        shortfall: toRupees(basket.totalPaise - balancePaise)
      });
    }

    const order = await Order.create({
      user: user._id,
      name: user.name,
      phone: user.phone,
      orderItems: basket.items.map((item) => ({
        name: item.name,
        qty: item.quantity,
        image: item.image || '/placeholder.jpg',
        price: item.price,
        product: item.product
      })),
      shippingAddress: {
        address: [address.line1, address.line2, areaName(address.area)].filter(Boolean).join(', '),
        city: 'Navi Mumbai',
        postalCode: '000000',
        country: 'India'
      },
      paymentMethod: 'Wallet',
      paymentStatus: 'PAID',
      taxPrice: 0,
      totalPrice: toRupees(basket.totalPaise),
      isPaid: true,
      paidAt: new Date(),
      isDelivered: false,
      scheduledDeliveryDate: deliveryDate,
      orderSource: 'App'
    });

    // Debit atomically so two taps of the button cannot both read a stale balance.
    const debited = await User.findByIdAndUpdate(
      user._id,
      { $inc: { walletBalance: -toRupees(basket.totalPaise) } },
      { returnDocument: 'after' }
    );

    await WalletTransaction.create({
      user: user._id,
      amount: toRupees(basket.totalPaise),
      type: 'debit',
      description: `Crate for ${istDateKey(deliveryDate)}`,
      balanceAfter: toRupees(toPaise(debited.walletBalance))
    });

    res.status(201).json({ order, walletBalance: debited.walletBalance });
  } catch (error) {
    if (error instanceof PricingError) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
