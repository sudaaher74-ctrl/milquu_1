// routes/subscriptions.js
const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');

// POST /api/subscriptions
router.post('/', async (req, res) => {
  try {
    const { name, phone, address, milkType, qty, schedule, startDate, notes, monthlyTotal, paymentMethod } = req.body;

    if (!name || !phone || !address || !milkType || !qty || !schedule) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit phone number.' });
    }

    const subscriptionId = 'SUB-' + Date.now().toString().slice(-6);

    const sub = new Subscription({
      subscriptionId, name, phone, address,
      milkType, qty: parseFloat(qty), schedule,
      startDate, notes, monthlyTotal,
      paymentMethod: paymentMethod || 'upi',
      status: 'active'
    });

    await sub.save();

    res.status(201).json({
      success: true,
      message: `Subscription ${subscriptionId} confirmed!`,
      subscriptionId,
      subscription: sub
    });
  } catch (err) {
    console.error('Subscription error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/subscriptions (admin)
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 200 } = req.query;
    const filter = status ? { status } : {};
    const subs = await Subscription.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Subscription.countDocuments(filter);
    res.json({ success: true, total, subscriptions: subs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/subscriptions/:subscriptionId/status
router.patch('/:subscriptionId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['active', 'paused', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    const sub = await Subscription.findOneAndUpdate(
      { subscriptionId: req.params.subscriptionId },
      { status },
      { new: true }
    );
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found.' });
    res.json({ success: true, message: 'Subscription updated.', subscription: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;