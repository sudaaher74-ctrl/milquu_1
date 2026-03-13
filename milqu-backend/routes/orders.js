const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendWhatsAppNotification } = require('../utils/whatsapp');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const ORDER_ACCESS_ROLES = ['super_admin', 'manager', 'delivery_staff'];
const COD_HANDLING_FEE = 20;

function normalizeItems(items = []) {
    return items
        .map((item) => ({
            productId: item.productId || item._id || item.id || '',
            qty: Number(item.qty) || 0
        }))
        .filter((item) => item.productId && item.qty > 0);
}

router.post('/', async (req, res) => {
    try {
        const { customer, items, paymentMethod } = req.body;

        if (!customer || !Array.isArray(items) || items.length === 0 || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'Missing required order fields.' });
        }
        if (!customer.name || !customer.phone || !customer.address) {
            return res.status(400).json({ success: false, message: 'Customer name, phone, and address are required.' });
        }
        if (!/^[6-9]\d{9}$/.test(customer.phone)) {
            return res.status(400).json({ success: false, message: 'Enter a valid 10-digit Indian phone number.' });
        }

        const normalizedItems = normalizeItems(items);
        if (normalizedItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Order must contain valid product items.' });
        }

        const productIds = normalizedItems.map((item) => item.productId);
        const products = await Product.find({ _id: { $in: productIds }, status: 'active' });
        if (products.length !== normalizedItems.length) {
            return res.status(400).json({ success: false, message: 'One or more products are unavailable.' });
        }

        const productById = new Map(products.map((product) => [product._id.toString(), product]));
        const orderItems = [];
        let subtotal = 0;

        for (const item of normalizedItems) {
            const product = productById.get(item.productId);
            if (!product) {
                return res.status(400).json({ success: false, message: 'One or more products are unavailable.' });
            }
            if (product.stock < item.qty) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
            }

            orderItems.push({
                id: product.productCode || product._id.toString(),
                productId: product._id.toString(),
                name: product.name,
                price: product.price,
                qty: item.qty,
                e: product.emoji,
                unit: product.unit
            });
            subtotal += product.price * item.qty;
        }

        const total = paymentMethod === 'cod' ? subtotal + COD_HANDLING_FEE : subtotal;
        const orderId = 'MQ-' + Date.now().toString().slice(-6);

        const order = new Order({
            orderId,
            customer,
            items: orderItems,
            total,
            paymentMethod,
            status: 'confirmed',
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid'
        });

        await order.save();

        for (const item of normalizedItems) {
            const product = productById.get(item.productId);
            product.stock = Math.max(0, product.stock - item.qty);
            if (product.stock <= 0) {
                product.status = 'out_of_stock';
            }
            await product.save();
        }

        sendWhatsAppNotification(order).catch(() => { });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            orderId,
            totals: { subtotal, handlingFee: paymentMethod === 'cod' ? COD_HANDLING_FEE : 0, total },
            order
        });
    } catch (err) {
        console.error('Order error:', err);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

router.get('/', verifyToken, requireRole(...ORDER_ACCESS_ROLES), async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(500, Math.max(1, parseInt(limit, 10) || 20));
        const filter = status ? { status } : {};

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit);
        const total = await Order.countDocuments(filter);
        res.json({ success: true, total, page: safePage, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/stats/summary', verifyToken, requireRole(...ORDER_ACCESS_ROLES), async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
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

router.get('/stats/analytics', verifyToken, requireRole(...ORDER_ACCESS_ROLES), async (req, res) => {
    try {
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const dailyData = await Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const fourWeeksAgo = new Date(now);
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 27);
        fourWeeksAgo.setHours(0, 0, 0, 0);
        const weeklyData = await Order.aggregate([
            { $match: { createdAt: { $gte: fourWeeksAgo } } },
            { $group: { _id: { $isoWeek: '$createdAt' }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);
        const monthlyData = await Order.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        res.json({ success: true, daily: dailyData, weekly: weeklyData, monthly: monthlyData });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/stats/top-products', verifyToken, requireRole(...ORDER_ACCESS_ROLES), async (req, res) => {
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

router.get('/:orderId', verifyToken, requireRole(...ORDER_ACCESS_ROLES), async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/:orderId/status', verifyToken, requireRole(...ORDER_ACCESS_ROLES), async (req, res) => {
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
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        res.json({ success: true, message: 'Order status updated.', order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
