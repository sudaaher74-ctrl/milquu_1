// Orders placed from the website cart (/cart), by guests or signed-in customers.
//
// The website used to charge the customer through Razorpay and then post the
// order to /api/users/orders, which requires a login and a different payload —
// so the payment went through and the order was rejected. This endpoint takes
// the cart as the website has it, prices it here, and for an online payment
// proves the money actually arrived, for this amount, before recording anything.

import Order from '../models/Order.js';
import { priceBasket, PricingError } from '../services/subscriptionPricing.js';
import { toRupees } from '../utils/money.js';
import { normalisePhone } from '../utils/phone.js';
import { istStartOfDay, istTomorrow, istHour } from '../utils/ist.js';
import { isGatewayConfigured, isValidPaymentSignature, razorpayClient } from '../utils/razorpay.js';

// Matches the cut-offs the storefront's slot picker shows the customer.
const MORNING_CUTOFF_HOUR_IST = 23; // tomorrow 4–7 am, order before 11 pm
const EVENING_CUTOFF_HOUR_IST = 15; // today 5–7 pm, order before 3 pm

/** The delivery date for a slot, decided here in IST rather than by the browser. */
const deliveryDateFor = (slot, now = new Date()) => {
  if (slot === 'Evening') {
    return istHour(now) < EVENING_CUTOFF_HOUR_IST ? istStartOfDay(now) : istTomorrow(now);
  }
  return istHour(now) < MORNING_CUTOFF_HOUR_IST ? istTomorrow(now) : null;
};

const SLOT_WINDOWS = { Morning: '4:00 AM – 7:00 AM', Evening: '5:00 PM – 7:00 PM' };

// @route  POST /api/orders/checkout
// @access Public (a signed-in customer's order is linked to their account)
export const placeWebOrder = async (req, res) => {
  try {
    const {
      name, phone, items, shippingAddress, paymentMethod, deliverySlot,
      razorpay_order_id, razorpay_payment_id, razorpay_signature
    } = req.body;

    const isOnline = paymentMethod === 'ONLINE';

    // A paid order is never refused for timing: one paid seconds after the
    // morning cut-off goes out the morning after instead.
    let scheduledDeliveryDate = deliveryDateFor(deliverySlot);
    if (!scheduledDeliveryDate && isOnline) {
      scheduledDeliveryDate = new Date(istTomorrow().getTime() + 24 * 60 * 60 * 1000);
    }
    if (!scheduledDeliveryDate) {
      return res.status(409).json({ message: 'Tomorrow morning’s slot has closed for tonight. Please choose the evening slot.' });
    }

    const basket = await priceBasket(items);
    if (basket.totalPaise <= 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    if (isOnline) {
      if (!isGatewayConfigured()) {
        return res.status(500).json({ message: 'Payment gateway is not configured' });
      }
      if (!isValidPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
      if (await Order.exists({ razorpayPaymentId: razorpay_payment_id })) {
        return res.status(400).json({ message: 'This payment has already been used for an order' });
      }
      const rzpOrder = await razorpayClient().orders.fetch(razorpay_order_id);
      if (rzpOrder?.notes?.purpose && rzpOrder.notes.purpose !== 'order') {
        return res.status(400).json({ message: 'This payment was not made for an order' });
      }
      if (!rzpOrder || Number(rzpOrder.amount) !== basket.totalPaise) {
        // The amount paid must be exactly what this cart costs now.
        return res.status(400).json({
          message: 'The amount paid does not match your cart. Please contact us with your payment ID for a refund.',
          paymentId: razorpay_payment_id
        });
      }
    }

    const customer = req.user && req.user.role === 'user' ? req.user : null;

    const order = await Order.create({
      user: customer?._id,
      name: String(name).trim(),
      phone: normalisePhone(phone),
      orderItems: basket.items.map((item) => ({
        name: item.name,
        qty: item.quantity,
        image: item.image || '/img/categories/logo.png',
        price: item.price,
        product: item.product
      })),
      shippingAddress: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode || '',
        country: 'India'
      },
      paymentMethod: isOnline ? 'ONLINE' : 'COD',
      paymentStatus: isOnline ? 'PAID' : 'PENDING',
      razorpayOrderId: isOnline ? razorpay_order_id : undefined,
      razorpayPaymentId: isOnline ? razorpay_payment_id : undefined,
      razorpaySignature: isOnline ? razorpay_signature : undefined,
      paymentResult: isOnline ? { id: razorpay_payment_id, status: 'paid', update_time: new Date().toISOString() } : undefined,
      taxPrice: 0,
      totalPrice: toRupees(basket.totalPaise),
      isPaid: isOnline,
      paidAt: isOnline ? new Date() : undefined,
      isDelivered: false,
      deliverySlot,
      scheduledDeliveryDate,
      scheduledDeliveryWindow: SLOT_WINDOWS[deliverySlot],
      orderSource: 'Website'
    });

    res.status(201).json(order);
  } catch (error) {
    if (error instanceof PricingError) {
      return res.status(400).json({ message: error.message });
    }
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'This payment has already been used for an order' });
    }
    res.status(500).json({ message: 'Could not place the order', error: error.message });
  }
};
