import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import Order from '../models/Order.js';
import WalletTransaction from '../models/WalletTransaction.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import generateToken from '../utils/generateToken.js';
import { isServiceableArea } from '../config/serviceAreas.js';
import { normalisePhone, isValidPhone, looksLikeEmail } from '../utils/phone.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

/**
 * Turn a Mongoose write failure into an honest status code. A schema violation
 * or a duplicate key is the caller's fault and must be a 400 with the offending
 * field named — it used to surface as an opaque 500.
 */
const sendWriteError = (res, error) => {
  if (error?.name === 'ValidationError') {
    const errors = Object.values(error.errors || {}).map((e) => ({
      path: e.path,
      message: e.message
    }));
    return res.status(400).json({
      message: errors[0]?.message || 'Validation failed',
      errors
    });
  }
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || 'field';
    const label = field === 'phone' ? 'phone number' : field;
    return res.status(400).json({
      message: `An account with that ${label} already exists`,
      errors: [{ path: field, message: `That ${label} is already registered` }]
    });
  }
  return res.status(500).json({ message: 'Server error', error: error.message });
};

/** The public shape of a user, shared by register, login and profile. */
const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  deliveryAddress: user.deliveryAddress || null,
  walletBalance: user.walletBalance || 0,
  role: user.role
});

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // The phone number is the customer's identifier. Email is optional, so it
    // only has to be unique when one was actually supplied.
    const normalisedPhone = normalisePhone(phone);
    const normalisedEmail = String(email || '').trim().toLowerCase();

    const phoneTaken = await User.findOne({ phone: normalisedPhone });
    if (phoneTaken) {
      return res.status(400).json({
        message: 'An account with that phone number already exists',
        errors: [{ path: 'phone', message: 'That phone number is already registered' }]
      });
    }

    if (normalisedEmail) {
      const emailTaken = await User.findOne({ email: normalisedEmail });
      if (emailTaken) {
        return res.status(400).json({
          message: 'An account with that email already exists',
          errors: [{ path: 'email', message: 'That email is already registered' }]
        });
      }
    }

    const user = await User.create({
      name,
      email: normalisedEmail || undefined,
      password,
      phone: normalisedPhone,
      address,
      role: 'user'
    });

    if (user) {
      res.status(201).json({
        ...publicUser(user),
        token: generateToken(user._id, 'user')
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    return sendWriteError(res, error);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { identifier, email, phone, password } = req.body;

    // Customers sign in with a phone number; admin, manager and delivery-office
    // accounts still use an email. Older clients send `email` for both, so the
    // identifier is whichever field arrived and the shape decides the lookup.
    const supplied = String(identifier || phone || email || '').trim();

    const user = looksLikeEmail(supplied)
      ? await User.findOne({ email: supplied.toLowerCase() })
      : await User.findOne({ phone: normalisePhone(supplied) });

    if (user && (await user.matchPassword(password))) {
      res.json({
        ...publicUser(user),
        token: generateToken(user._id, user.role)
      });
    } else {
      // Deliberately not saying which half was wrong — that would confirm
      // whether a phone number has an account.
      res.status(401).json({ message: 'Invalid phone number or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json(publicUser(user));
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update the signed-in customer's own profile. Only the fields a customer owns
 * are writable here — role, wallet balance and email are deliberately not.
 */
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, phone, deliveryAddress } = req.body;

    if (typeof name === 'string' && name.trim()) user.name = name.trim();
    if (typeof phone === 'string' && phone.trim()) {
      // The phone number is the sign-in identifier, so it cannot be replaced
      // with something that could never be typed back in.
      if (!isValidPhone(phone)) {
        return res.status(400).json({
          message: 'Enter a valid 10-digit mobile number',
          errors: [{ path: 'phone', message: 'Enter a valid 10-digit mobile number' }]
        });
      }
      user.phone = normalisePhone(phone);
    }

    if (deliveryAddress) {
      const { line1, line2, note, label, area } = deliveryAddress;

      if (!line1 || !String(line1).trim()) {
        return res.status(400).json({ message: 'A flat or house number is required' });
      }
      if (!area || !isServiceableArea(area)) {
        return res.status(400).json({ message: 'We do not deliver to that area yet' });
      }

      user.deliveryAddress = {
        line1: String(line1).trim(),
        line2: String(line2 || '').trim(),
        note: String(note || '').trim(),
        label: ['Home', 'Office', 'Other'].includes(label) ? label : 'Home',
        area
      };
      // Keep the legacy single-line address in step for the storefront checkout
      // and the delivery lists that still read it.
      user.address = [user.deliveryAddress.line1, user.deliveryAddress.line2]
        .filter(Boolean)
        .join(', ');
    }

    const saved = await user.save();
    res.json(publicUser(saved));
  } catch (error) {
    // A phone number already on another account arrives here as a duplicate key
    return sendWriteError(res, error);
  }
};

export const getMySubscriptions = async (req, res) => {
  try {
    // We need to import Subscription at the top
    const subscriptions = await Subscription.find({ user: req.user._id }).populate('items.product');
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateSubscriptionStatus = async (req, res) => {
  try {
    const { status, pauseStartDate, pauseEndDate } = req.body; // e.g. 'paused', 'Active', 'Cancelled'
    
    const subscription = await Subscription.findById(req.params.id);
    
    if (subscription) {
      // Ensure the subscription belongs to the user
      if (subscription.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to update this subscription' });
      }
      
      subscription.status = status;
      if (pauseStartDate) subscription.pauseStartDate = new Date(pauseStartDate);
      if (pauseEndDate) subscription.pauseEndDate = new Date(pauseEndDate);
      
      // If resuming manually, clear the dates
      if (status === 'Active' || status === 'active') {
        subscription.pauseStartDate = undefined;
        subscription.pauseEndDate = undefined;
      }

      const updatedSubscription = await subscription.save();
      res.json(updatedSubscription);
    } else {
      res.status(404).json({ message: 'Subscription not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getMyWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const transactions = await WalletTransaction.find({ user: req.user._id }).sort({ createdAt: -1 });

    const withdrawalRequests = await WithdrawalRequest.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Calculate Reserved Balance dynamically
    let reservedBalance = 0;

    // 1. Pending Withdrawal Requests (locks up the requested amount)
    const pendingWithdrawals = withdrawalRequests.filter(req => ['Pending', 'Under Review'].includes(req.status));
    reservedBalance += pendingWithdrawals.reduce((sum, req) => sum + req.amount, 0);

    // 2. Active Subscriptions (Reserve 1 Day Cost)
    const activeSubs = await Subscription.find({ user: req.user._id, status: { $in: ['Active', 'active'] } });
    activeSubs.forEach(sub => {
      reservedBalance += (sub.monthlyTotal / 30); // 1 Day cost
    });

    // 3. Pending Orders Cost
    const pendingOrders = await Order.find({ user: req.user._id, isPaid: false, isDelivered: false });
    pendingOrders.forEach(order => {
      reservedBalance += order.totalPrice;
    });

    reservedBalance = Math.round(reservedBalance * 100) / 100; // Round to 2 decimal places

    const withdrawableBalance = Math.max(0, (user.walletBalance || 0) - reservedBalance);

    res.json({
      walletBalance: user.walletBalance || 0,
      reservedBalance,
      withdrawableBalance,
      transactions,
      withdrawalRequests
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, refundMethod, upiId, bankDetails } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Re-calculate withdrawable balance
    let reservedBalance = 0;
    const pendingWithdrawals = await WithdrawalRequest.find({ user: req.user._id, status: { $in: ['Pending', 'Under Review'] } });
    reservedBalance += pendingWithdrawals.reduce((sum, r) => sum + r.amount, 0);

    const activeSubs = await Subscription.find({ user: req.user._id, status: { $in: ['Active', 'active'] } });
    activeSubs.forEach(sub => reservedBalance += (sub.monthlyTotal / 30));

    const pendingOrders = await Order.find({ user: req.user._id, isPaid: false, isDelivered: false });
    pendingOrders.forEach(order => reservedBalance += order.totalPrice);

    const withdrawableBalance = Math.max(0, (user.walletBalance || 0) - reservedBalance);

    if (amount > withdrawableBalance) {
      return res.status(400).json({ message: `Insufficient withdrawable balance. You can only withdraw up to ₹${withdrawableBalance.toFixed(2)}` });
    }

    const withdrawalRequest = await WithdrawalRequest.create({
      user: user._id,
      amount: Number(amount),
      refundMethod,
      upiId,
      bankDetails,
      status: 'Pending'
    });

    console.log(`[SIMULATED SMS to ${user.phone}]: Hi ${user.name}, your refund request of ₹${amount} has been received and is under review.`);

    res.status(201).json({
      message: 'Withdrawal request submitted successfully',
      withdrawalRequest
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const createRechargeOrder = async (req, res) => {
  const requestId = Date.now();

  try {
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (!process.env.RAZORPAY_KEY_ID || !(process.env.RAZORPAY_SECRET || process.env.RAZORPAY_KEY_SECRET)) {
      return res.status(500).json({ message: 'Payment gateway is not configured' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET || process.env.RAZORPAY_KEY_SECRET,
    });

    // Generate a unique, short receipt (must be < 40 chars per Razorpay limit)
    const receiptStr = `WR${Date.now().toString().slice(-10)}_${Math.random().toString(36).substring(2,6)}`;

    // Strict validation before order creation
    if (receiptStr.length > 40) {
      throw new Error("Receipt exceeds Razorpay limit");
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay works in paise
      currency: 'INR',
      receipt: receiptStr
    };

    const order = await razorpay.orders.create(options);

    if (!order) return res.status(500).json({ message: 'Error creating Razorpay order' });

    res.status(200).json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error(`[${requestId}] Razorpay Error`, error);
    
    if (error.message === "Receipt exceeds Razorpay limit") {
      return res.status(400).json({
        success: false,
        message: "Invalid receipt length"
      });
    }

    res.status(500).json({ message: 'Error creating Razorpay order', error: error.error ? error.error.description : error.message });
  }
};

export const rechargeWallet = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (
      typeof razorpay_order_id !== 'string' ||
      typeof razorpay_payment_id !== 'string' ||
      typeof razorpay_signature !== 'string'
    ) {
      return res.status(400).json({ message: 'Missing payment details' });
    }

    const secret = process.env.RAZORPAY_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (!process.env.RAZORPAY_KEY_ID || !secret) {
      return res.status(500).json({ message: 'Payment gateway is not configured' });
    }

    // Verify signature (timing-safe comparison)
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const provided = Buffer.from(razorpay_signature, 'utf8');
    const expected = Buffer.from(generated_signature, 'utf8');
    if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Prevent the same payment from being credited twice
    const alreadyCredited = await WalletTransaction.findOne({
      description: `Customer Recharge (Razorpay: ${razorpay_payment_id})`
    });
    if (alreadyCredited) {
      return res.status(400).json({ message: 'This payment has already been credited' });
    }

    // Credit the amount Razorpay actually charged — never the amount the client claims
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: secret,
    });
    const order = await razorpay.orders.fetch(razorpay_order_id);
    if (!order || !order.amount) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }
    const creditAmount = order.amount / 100; // paise -> rupees

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.walletBalance = (user.walletBalance || 0) + creditAmount;
    await user.save();

    const transaction = await WalletTransaction.create({
      user: user._id,
      amount: creditAmount,
      type: 'credit',
      description: `Customer Recharge (Razorpay: ${razorpay_payment_id})`,
      balanceAfter: user.walletBalance
    });

    res.json({
      message: 'Wallet recharged successfully',
      walletBalance: user.walletBalance,
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    // Verify token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const { email, name } = payload;
    const normalisedEmail = email.toLowerCase().trim();

    // Check if user exists
    let user = await User.findOne({ email: normalisedEmail });

    if (!user) {
      // Create highly secure random password for Google signup
      const randomPassword = crypto.randomBytes(32).toString('hex');
      
      user = await User.create({
        name: name || 'Google User',
        email: normalisedEmail,
        password: randomPassword,
        role: 'user'
      });
    }

    res.json({
      ...publicUser(user),
      token: generateToken(user._id, user.role)
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Google authentication failed', error: error.message });
  }
};
