const express = require('express');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', verifyToken, requireRole('super_admin', 'manager'), async (req, res) => {
    try {
        const customers = await Order.aggregate([
            {
                $group: {
                    _id: '$customer.phone',
                    name: { $first: '$customer.name' },
                    phone: { $first: '$customer.phone' },
                    email: { $first: '$customer.email' },
                    address: { $first: '$customer.address' },
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$total' },
                    lastOrder: { $max: '$createdAt' }
                }
            },
            { $sort: { totalSpent: -1 } }
        ]);

        res.json({ success: true, total: customers.length, customers });
    } catch (err) {
        console.error('Customer aggregation error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:phone', verifyToken, requireRole('super_admin', 'manager'), async (req, res) => {
    try {
        const phone = req.params.phone;
        const orders = await Order.find({ 'customer.phone': phone }).sort({ createdAt: -1 });
        const subscriptions = await Subscription.find({ phone }).sort({ createdAt: -1 });

        if (orders.length === 0 && subscriptions.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }

        const customer = {
            name: orders[0]?.customer?.name || subscriptions[0]?.name || '-',
            phone,
            email: orders[0]?.customer?.email || '',
            address: orders[0]?.customer?.address || subscriptions[0]?.address || '',
            totalOrders: orders.length,
            totalSpent: orders.reduce((sum, order) => sum + (order.total || 0), 0),
            orders,
            subscriptions
        };

        res.json({ success: true, customer });
    } catch (err) {
        console.error('Customer detail error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
