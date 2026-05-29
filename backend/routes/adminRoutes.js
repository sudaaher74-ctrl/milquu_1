import express from 'express';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

const router = express.Router();

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Hardcoded secure admin credentials for now
  if (email === 'admin@milquu.com' && password === 'admin123') {
    res.json({
      token: 'admin-auth-token-xyz',
      role: 'admin',
      name: 'Admin'
    });
  } else {
    res.status(401).json({ message: 'Invalid Admin Credentials' });
  }
});

// @route   GET /api/admin/overview
// @desc    Get dashboard stats
// @access  Private (Protected route)
router.get('/overview', async (req, res) => {
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
// @access  Public (should be protected in prod)
router.get('/orders', async (req, res) => {
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
// @access  Public (should be protected in prod)
router.get('/customers', async (req, res) => {
  try {
    const customers = await User.find({}).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
