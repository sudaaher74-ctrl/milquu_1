// routes/notifications.js  —  Notification counts for admin dashboard
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const Message = require('../models/Message');

// ── GET /api/notifications/counts — unread/new counts for admin notification bell
router.get('/counts', async (req, res) => {
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
