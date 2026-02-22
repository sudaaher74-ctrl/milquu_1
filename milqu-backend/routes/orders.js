// routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

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

// ── GET /api/orders/stats/summary  (admin dashboard stats)
router.get('/stats/summary', async (req, res) => {
  try {
    const totalOrders   = await Order.countDocuments();
    const totalRevenue  = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]);
    const todayStart    = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayOrders   = await Order.countDocuments({ createdAt: { $gte: todayStart } });
    const pendingOrders = await Order.countDocuments({ status: { $in: ['pending', 'confirmed'] } });
    const byStatus      = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

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

module.exports = router;