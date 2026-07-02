import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import Order from '../models/Order.js';
import WalletTransaction from '../models/WalletTransaction.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import generateToken from '../utils/generateToken.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role: 'user'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        token: generateToken(user._id, 'user')
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        token: generateToken(user._id, user.role)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
