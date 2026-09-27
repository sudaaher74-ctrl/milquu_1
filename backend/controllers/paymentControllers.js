import { isGatewayConfigured, isValidPaymentSignature, razorpayClient } from '../utils/razorpay.js';
import { priceBasket, PricingError } from '../services/subscriptionPricing.js';

// @desc    Create a Razorpay order for a website cart
// @route   POST /api/payment/orders
// @access  Public
//
// The amount is priced here from the Product collection. It used to be taken
// from the request, so the customer's browser decided what it would be charged.
export const createOrder = async (req, res) => {
  try {
    if (!isGatewayConfigured()) {
      return res.status(500).json({ message: 'Payment gateway is not configured' });
    }

    const basket = await priceBasket(req.body.items);
    if (basket.totalPaise <= 0 || basket.totalPaise > 10000000) {
      return res.status(400).json({ message: 'Invalid cart total' });
    }

    const order = await razorpayClient().orders.create({
      amount: basket.totalPaise,
      currency: 'INR',
      receipt: `WEB${Date.now().toString().slice(-10)}_${Math.random().toString(36).slice(2, 6)}`,
      // Checked again when the order is placed, so this payment can only pay
      // for a website order — never a wallet top-up — and only this amount.
      notes: { purpose: 'order' }
    });
    if (!order) {
      return res.status(500).json({ message: 'Error creating Razorpay order' });
    }

    res.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    if (error instanceof PricingError) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating payment order' });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Public
export const verifyPayment = async (req, res) => {
  try {
    if (!isGatewayConfigured()) {
      return res.status(500).json({ message: 'Payment gateway is not configured' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (isValidPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Payment verification error' });
  }
};

// @desc    Get Razorpay Key
// @route   GET /api/payment/key
// @access  Public
export const getRazorpayKey = (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID) {
    return res.status(500).json({ message: 'Payment gateway is not configured' });
  }
  res.json({ key: process.env.RAZORPAY_KEY_ID });
};
