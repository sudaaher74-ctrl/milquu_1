import express from 'express';
import Subscription from '../models/Subscription.js';

const router = express.Router();

// @route   POST /api/subscriptions
// @desc    Create a new subscription/order
// @access  Public (for now)
router.post('/', async (req, res) => {
  try {
    const { user, items, totalAmount, deliveryAddress, frequency } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }

    const subscription = new Subscription({
      user, // Should be an ObjectId referencing a User
      items,
      totalAmount,
      deliveryAddress,
      frequency
    });

    const createdSubscription = await subscription.save();
    res.status(201).json(createdSubscription);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
