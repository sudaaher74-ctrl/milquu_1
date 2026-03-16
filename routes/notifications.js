const express = require('express');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const Message = require('../models/Message');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/counts', verifyToken, requireRole('super_admin', 'manager', 'delivery_staff'), async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const [newOrders, newSubscriptions, unreadMessages] = await Promise.all([
            Order.countDocuments({ createdAt: { $gte: twentyFourHoursAgo } }),
            Subscription.countDocuments({ createdAt: { $gte: twentyFourHoursAgo } }),
            Message.countDocuments({ status: 'unread' })
        ]);

        const total = newOrders + newSubscriptions + unreadMessages;
        res.json({
            success: true,
            newOrders,
            newSubscriptions,
            unreadMessages,
            total
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
