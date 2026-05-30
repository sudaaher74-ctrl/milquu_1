import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
// In production, this would use process.env.RAZORPAY_KEY_ID
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_dummy_secret',
});

// @desc    Create a new Razorpay order
// @route   POST /api/payment/orders
// @access  Public
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = 'receipt#1' } = req.body;
    
    // Amount is in paise for INR
    const options = {
      amount: amount * 100, 
      currency,
      receipt
    };
    
    const order = await instance.orders.create(options);
    if (!order) {
      return res.status(500).json({ message: 'Error creating Razorpay order' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Public
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_dummy_secret';
    
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
      
    if (generated_signature === razorpay_signature) {
      // Payment is successful
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
