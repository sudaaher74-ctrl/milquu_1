import express from 'express';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        token: generateToken(user._id),
        role: user.role,
        name: user.name,
        email: user.email
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/overview
// @desc    Get dashboard stats
// @access  Private (Protected route)
router.get('/overview', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Subscription.countDocuments();
    
    // Calculate total revenue
    const orders = await Subscription.find({});
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      recentOrders: orders.slice(-5) // Send last 5 for a quick view
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders/subscriptions
// @access  Private
router.get('/orders', protect, admin, async (req, res) => {
  try {
    // Populate user to get customer details
    const orders = await Subscription.find({}).populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/admin/customers
// @desc    Get all customers
// @access  Private
router.get('/customers', protect, admin, async (req, res) => {

  try {
    const customers = await User.find({}).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
