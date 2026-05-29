import express from 'express';
import Subscription from '../models/Subscription.js';

const router = express.Router();

// @route   POST /api/subscriptions
// @desc    Create a new subscription/order
// @access  Public (for now)
router.post('/', async (req, res) => {
  try {
    const { name, phone, items, totalAmount, deliveryAddress, frequency, status, monthlyTotal } = req.body;

    const subscription = new Subscription({
      name,
      phone,
      items: items || [],
      totalAmount: totalAmount || 0,
      deliveryAddress,
      frequency,
      status: status || 'Pending',
      monthlyTotal
    });

    const createdSubscription = await subscription.save();
    res.status(201).json(createdSubscription);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/subscriptions
// @desc    Get all subscriptions
// @access  Public
router.get('/', async (req, res) => {
  try {
    const subscriptions = await Subscription.find({}).sort({ createdAt: -1 });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
