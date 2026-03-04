// routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { sendWhatsAppNotification } = require('../utils/whatsapp');

// Try loading Product model for stock management (graceful if not available)
let Product;
try { Product = require('../models/Product'); } catch (e) { Product = null; }

// ── POST /api/orders  (called from frontend when customer places order)
router.post('/', async (req, res) => {
  try {
    const { customer, items, total, paymentMethod } = req.body;

    // Basic validation
    if (!customer || !items || !items.length || !total || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Missing required order fields.' });
    }
    if (!customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ success: false, message: 'Customer name, phone, and address are required.' });
    }
    if (!/^[6-9]\d{9}$/.test(customer.phone)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit Indian phone number.' });
    }

    // Generate order ID like the frontend does
    const orderId = 'MQ-' + Date.now().toString().slice(-6);

    const order = new Order({
      orderId,
      customer,
      items,
      total,
      paymentMethod,
      status: 'confirmed',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid'
    });

    await order.save();

    // Decrement stock for each product (fire-and-forget)
    if (Product) {
      for (const item of items) {
        try {
          const product = await Product.findOne({ name: item.name });
          if (product && product.stock > 0) {
            product.stock = Math.max(0, product.stock - (item.qty || 1));
            if (product.stock <= 0) product.status = 'out_of_stock';
            await product.save();
          }
        } catch (stockErr) {
          console.error(`Stock update failed for ${item.name}:`, stockErr.message);
        }
      }
    }

    // Fire-and-forget WhatsApp notification
    sendWhatsAppNotification(order).catch(() => { });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId,
      order
    });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ── GET /api/orders  (admin dashboard)
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Order.countDocuments(filter);
    res.json({ success: true, total, page: parseInt(page), orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/orders/stats/summary  (admin dashboard stats)
// IMPORTANT: Place specific routes BEFORE parameterized routes
router.get('/stats/summary', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]);
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: todayStart } });
    const pendingOrders = await Order.countDocuments({ status: { $in: ['pending', 'confirmed'] } });
    const byStatus = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

    res.json({
      success: true,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayOrders,
      pendingOrders,
      byStatus
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/orders/stats/analytics  (Chart.js data — daily/weekly/monthly)
router.get('/stats/analytics', async (req, res) => {
  try {
    const now = new Date();

    // Daily revenue — last 7 days
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyData = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Weekly revenue — last 4 weeks
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 27);
    fourWeeksAgo.setHours(0, 0, 0, 0);

    const weeklyData = await Order.aggregate([
      { $match: { createdAt: { $gte: fourWeeksAgo } } },
      {
        $group: {
          _id: { $isoWeek: '$createdAt' },
          revenue: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Monthly revenue — last 6 months
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyData = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, daily: dailyData, weekly: weeklyData, monthly: monthlyData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/orders/stats/top-products  (top 5 selling products by revenue)
router.get('/stats/top-products', async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          emoji: { $first: '$items.e' },
          totalQty: { $sum: '$items.qty' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    res.json({ success: true, topProducts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/orders/:orderId  (single order detail)
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/orders/:orderId/status  (admin updates order status)
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, message: 'Order status updated.', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;