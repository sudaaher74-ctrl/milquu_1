import Razorpay from 'razorpay';
import crypto from 'crypto';

const getRazorpaySecret = () => process.env.RAZORPAY_SECRET || process.env.RAZORPAY_KEY_SECRET;

const isGatewayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && getRazorpaySecret());

// @desc    Create a new Razorpay order
// @route   POST /api/payment/orders
// @access  Public
export const createOrder = async (req, res) => {
  try {
    if (!isGatewayConfigured()) {
      return res.status(500).json({ message: 'Payment gateway is not configured' });
    }

    const amount = Number(req.body.amount);
    const { currency = 'INR', receipt = 'receipt#1' } = req.body;

    if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: getRazorpaySecret(),
    });

    // Amount is in paise for INR and must be an integer
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt
    };

    const order = await instance.orders.create(options);
    if (!order) {
      return res.status(500).json({ message: 'Error creating Razorpay order' });
    }

    res.json(order);
  } catch (error) {
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

    if (
      typeof razorpay_order_id !== 'string' ||
      typeof razorpay_payment_id !== 'string' ||
      typeof razorpay_signature !== 'string'
    ) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    const generated_signature = crypto
      .createHmac('sha256', getRazorpaySecret())
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const provided = Buffer.from(razorpay_signature, 'utf8');
    const expected = Buffer.from(generated_signature, 'utf8');

    if (provided.length === expected.length && crypto.timingSafeEqual(provided, expected)) {
      // Payment is successful
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
