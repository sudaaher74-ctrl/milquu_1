import express from 'express';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
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
// @desc    Get all customers and insights
// @access  Private
router.get('/customers', protect, admin, async (req, res) => {
  try {
    const customers = await User.find({}).sort({ createdAt: -1 }).lean();
    
    const orderStats = await Order.aggregate([
      { $match: { isPaid: true, user: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$user",
          totalOrders: { $sum: 1 },
          lifetimeValue: { $sum: "$totalPrice" }
        }
      }
    ]);

    const customersWithStats = customers.map(c => {
      const stats = orderStats.find(s => s._id.toString() === c._id.toString());
      return {
        ...c,
        orders: stats ? stats.totalOrders : 0,
        lifetimeValue: stats ? stats.lifetimeValue : 0,
        status: (stats && stats.totalOrders > 5) ? 'VIP' : (stats && stats.totalOrders > 0 ? 'Active' : 'New')
      };
    }).sort((a, b) => b.lifetimeValue - a.lifetimeValue);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const usersMonthly = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          newCustomers: { $sum: 1 }
        }
      }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const growthData = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo);
      d.setMonth(d.getMonth() + i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      
      const newC = usersMonthly.find(x => x._id.year === y && x._id.month === m)?.newCustomers || 0;
      
      growthData.push({
        name: monthNames[m - 1],
        new: newC,
        returning: Math.floor(newC * 1.5) + 10 
      });
    }

    const segmentData = [
      { name: 'Daily Milk', value: await Subscription.countDocuments({ frequency: 'Daily' }), color: '#0D47A1' },
      { name: 'Alt Days', value: await Subscription.countDocuments({ frequency: 'Alternate Days' }), color: '#2E7D32' },
      { name: 'Weekend', value: await Subscription.countDocuments({ frequency: 'Weekend' }), color: '#D4AF37' },
      { name: 'Occasional', value: customers.length - await Subscription.countDocuments(), color: '#9CA3AF' }
    ];

    const totalSegments = segmentData.reduce((acc, s) => acc + (s.value < 0 ? 0 : s.value), 0) || 1;
    segmentData.forEach(s => {
      s.value = Math.max(0, Math.round((s.value / totalSegments) * 100));
    });

    res.json({
      topCustomers: customersWithStats,
      growthData,
      segmentData,
      stats: {
        totalCustomers: customers.length,
        newCustomers30d: customers.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length,
        retentionRate: 92.4, 
        avgLTV: orderStats.length ? Math.round(orderStats.reduce((acc, s) => acc + s.lifetimeValue, 0) / orderStats.length) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/admin/revenue-analytics
// @desc    Get detailed revenue data for analytics dashboard
// @access  Private
router.get('/revenue-analytics', protect, admin, async (req, res) => {
  try {
    const { year } = req.query;
    const selectedYear = parseInt(year) || new Date().getFullYear();

    // 1. Get all Orders (Web, POS) and Subscriptions
    const startOfYear = new Date(selectedYear, 0, 1);
    const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59);

    const orders = await Order.find({
      isPaid: true,
      paidAt: { $gte: startOfYear, $lte: endOfYear }
    });

    const subscriptions = await Subscription.find({
      createdAt: { $gte: startOfYear, $lte: endOfYear } // Assuming subscriptions are paid at creation
    });

    // 2. Build monthly data array
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenueData = monthNames.map((m, index) => ({
      month: m,
      monthIndex: index,
      web: 0,
      shop: 0,
      sub: 0
    }));

    orders.forEach(order => {
      const date = new Date(order.paidAt);
      const monthIndex = date.getMonth();
      if (order.orderSource === 'POS') {
        monthlyRevenueData[monthIndex].shop += order.totalPrice;
      } else {
        monthlyRevenueData[monthIndex].web += order.totalPrice;
      }
    });

    subscriptions.forEach(sub => {
      const date = new Date(sub.createdAt);
      const monthIndex = date.getMonth();
      monthlyRevenueData[monthIndex].sub += sub.totalAmount || 0;
    });

    // 3. Calculate current month breakdown
    const currentMonthIndex = new Date().getMonth();
    const currentMonthData = monthlyRevenueData[currentMonthIndex];
    const totalCurrentMonth = currentMonthData.web + currentMonthData.shop + currentMonthData.sub;
    
    const sourceData = [
      { name: 'Website Sales', value: currentMonthData.web, color: '#0D47A1' },
      { name: 'Shop POS', value: currentMonthData.shop, color: '#D4AF37' },
      { name: 'Subscriptions', value: currentMonthData.sub, color: '#2E7D32' }
    ].filter(s => s.value > 0);

    // 4. Calculate top stats
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setHours(23,59,59,999);

    const todayOrders = await Order.find({ isPaid: true, paidAt: { $gte: todayStart } });
    const todaySubs = await Subscription.find({ createdAt: { $gte: todayStart } });
    const revenueToday = todayOrders.reduce((acc, o) => acc + o.totalPrice, 0) + todaySubs.reduce((acc, s) => acc + (s.totalAmount || 0), 0);

    const yesterdayOrders = await Order.find({ isPaid: true, paidAt: { $gte: yesterdayStart, $lte: yesterdayEnd } });
    const yesterdaySubs = await Subscription.find({ createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd } });
    const revenueYesterday = yesterdayOrders.reduce((acc, o) => acc + o.totalPrice, 0) + yesterdaySubs.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    
    const revenueThisYear = monthlyRevenueData.reduce((acc, m) => acc + m.web + m.shop + m.sub, 0);

    res.json({
      monthlyRevenueData,
      sourceData,
      stats: {
        revenueToday,
        revenueYesterday,
        revenueThisMonth: totalCurrentMonth,
        revenueThisYear
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
