const express = require('express');
const LoyaltyAccount = require('../models/LoyaltyAccount');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

function round(value, digits = 2) {
    return Number((Number(value || 0)).toFixed(digits));
}

function getVipLevel(totalSpent) {
    if (totalSpent >= 30000) return 'platinum';
    if (totalSpent >= 15000) return 'gold';
    if (totalSpent >= 7000) return 'silver';
    return 'classic';
}

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

        const loyaltyDocs = await LoyaltyAccount.find({
            customerPhone: { $in: customers.map((customer) => customer._id) }
        }).lean();
        const loyaltyMap = new Map(loyaltyDocs.map((doc) => [doc.customerPhone, doc]));

        const enriched = customers.map((customer) => {
            const avgOrderValue = customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0;
            const loyalty = loyaltyMap.get(customer._id);
            return {
                ...customer,
                avgOrderValue: round(avgOrderValue),
                clv: round(customer.totalSpent),
                repeatPurchaseRate: customer.totalOrders > 1 ? 100 : 0,
                vipLevel: loyalty?.vipLevel || getVipLevel(customer.totalSpent),
                walletBalance: loyalty?.walletBalance || 0,
                rewardPoints: loyalty?.rewardPoints || Math.floor(Number(customer.totalSpent || 0) / 10),
                cashbackBalance: loyalty?.cashbackBalance || 0
            };
        });

        res.json({ success: true, total: enriched.length, customers: enriched });
    } catch (err) {
        console.error('Customer aggregation error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:phone', verifyToken, requireRole('super_admin', 'manager'), async (req, res) => {
    try {
        const phone = req.params.phone;
        const [orders, subscriptions, loyalty] = await Promise.all([
            Order.find({ 'customer.phone': phone }).sort({ createdAt: -1 }).lean(),
            Subscription.find({ phone }).sort({ createdAt: -1 }).lean(),
            LoyaltyAccount.findOne({ customerPhone: phone }).lean()
        ]);

        if (orders.length === 0 && subscriptions.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }

        const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
        const customer = {
            name: orders[0]?.customer?.name || subscriptions[0]?.name || '-',
            phone,
            email: orders[0]?.customer?.email || loyalty?.customerEmail || '',
            address: orders[0]?.customer?.address || subscriptions[0]?.address || '',
            totalOrders: orders.length,
            totalSpent,
            avgOrderValue: orders.length ? round(totalSpent / orders.length) : 0,
            repeatPurchaseRate: orders.length > 1 ? 100 : 0,
            purchaseHistory: orders.map((order) => ({
                orderId: order.orderId,
                total: order.total,
                status: order.status,
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt,
                items: order.items || []
            })),
            subscriptions,
            loyalty: loyalty || {
                walletBalance: 0,
                rewardPoints: Math.floor(totalSpent / 10),
                cashbackBalance: 0,
                vipLevel: getVipLevel(totalSpent),
                referralRewards: 0
            }
        };

        res.json({ success: true, customer });
    } catch (err) {
        console.error('Customer detail error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
