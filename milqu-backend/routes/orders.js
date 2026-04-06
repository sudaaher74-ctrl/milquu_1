const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Admin = require('../models/Admin');
const { upload } = require('../utils/cloudinary');
const { createRateLimiter } = require('../middleware/rateLimit');
const { sendWhatsAppNotification } = require('../utils/whatsapp');
const { verifyToken, requireRole } = require('../middleware/auth');
const { generatePublicId } = require('../utils/public-id');

const router = express.Router();
const ORDER_ACCESS_ROLES = ['super_admin', 'manager', 'delivery_staff'];
const COD_HANDLING_FEE = 20;
const publicOrderLimiter = createRateLimiter({
    namespace: 'orders-post',
    windowMs: 60 * 1000,
    max: 20,
    message: 'Too many order attempts from this connection. Please wait a minute and try again.'
});

function normalizeItems(items = []) {
    const grouped = new Map();

    for (const item of items) {
        const productId = item.productId || item._id || item.id || '';
        const qty = Number(item.qty) || 0;
        if (!productId || qty <= 0) {
            continue;
        }
        grouped.set(productId, (grouped.get(productId) || 0) + qty);
    }

    return Array.from(grouped.entries()).map(([productId, qty]) => ({ productId, qty }));
}

async function rollbackStockAdjustments(adjustments) {
    for (const adjustment of [...adjustments].reverse()) {
        try {
            await Product.updateOne(
                { _id: adjustment.productId },
                [
                    {
                        $set: {
                            stock: { $add: ['$stock', adjustment.qty] }
                        }
                    },
                    {
                        $set: {
                            status: {
                                $cond: [{ $gt: ['$stock', 0] }, 'active', 'out_of_stock']
                            }
                        }
                    }
                ]
            );
        } catch (err) {
            console.error('Stock rollback error:', err);
        }
    }
}

router.post('/', publicOrderLimiter, async (req, res) => {
    try {
        const { customer, items, paymentMethod, area_id } = req.body;

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

        const requestedRefs = normalizedItems.map((item) => item.productId);
        const objectIds = requestedRefs.filter((ref) => mongoose.Types.ObjectId.isValid(ref));
        const productCodes = requestedRefs.filter((ref) => !mongoose.Types.ObjectId.isValid(ref));
        const filters = [];

        if (objectIds.length > 0) {
            filters.push({ _id: { $in: objectIds } });
        }
        if (productCodes.length > 0) {
            filters.push({ productCode: { $in: productCodes } });
        }

        const products = await Product.find({
            status: 'active',
            ...(filters.length > 0 ? { $or: filters } : {})
        });

        const productByRef = new Map();
        for (const product of products) {
            productByRef.set(product._id.toString(), product);
            if (product.productCode) {
                productByRef.set(product.productCode, product);
            }
        }

        const hasMissingProduct = normalizedItems.some((item) => !productByRef.get(item.productId));
        if (hasMissingProduct) {
            return res.status(400).json({ success: false, message: 'One or more products are unavailable.' });
        }

        const orderItems = [];
        let subtotal = 0;
        const stockAdjustments = [];

        for (const item of normalizedItems) {
            const product = productByRef.get(item.productId);
            if (!product) {
                return res.status(400).json({ success: false, message: 'One or more products are unavailable.' });
            }

            const reservedProduct = await Product.findOneAndUpdate(
                {
                    _id: product._id,
                    status: 'active',
                    stock: { $gte: item.qty }
                },
                [
                    {
                        $set: {
                            stock: { $subtract: ['$stock', item.qty] }
                        }
                    },
                    {
                        $set: {
                            status: {
                                $cond: [{ $gt: ['$stock', 0] }, 'active', 'out_of_stock']
                            }
                        }
                    }
                ],
                { new: true }
            );

            if (!reservedProduct) {
                await rollbackStockAdjustments(stockAdjustments);
                return res.status(409).json({ success: false, message: `Insufficient stock for ${product.name}.` });
            }

            stockAdjustments.push({
                productId: product._id.toString(),
                qty: item.qty
            });

            orderItems.push({
                id: product.productCode || product._id.toString(),
                productId: product._id.toString(),
                name: product.name,
                price: product.price,
                qty: item.qty,
                qty: item.qty,
                e: product.emoji,
                unit: product.unit
            });
            subtotal += product.price * item.qty;
        }

        let assigned_delivery_boy_id = null;
        if (area_id) {
            const deliveryBoy = await Admin.findOne({ role: 'delivery_staff', assigned_area: area_id });
            if (deliveryBoy) {
                assigned_delivery_boy_id = deliveryBoy._id;
            }
        }

        const total = paymentMethod === 'cod' ? subtotal + COD_HANDLING_FEE : subtotal;
        const orderId = generatePublicId('MQ');

        const order = new Order({
            orderId,
            customer,
            items: orderItems,
            total,
            paymentMethod,
            status: 'confirmed',
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
            area_id,
            assigned_delivery_boy_id
        });

        try {
            await order.save();
        } catch (err) {
            await rollbackStockAdjustments(stockAdjustments);
            throw err;
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
            .populate('area_id', 'name')
            .populate('assigned_delivery_boy_id', 'name phone')
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
        const order = await Order.findOne({ orderId: req.params.orderId })
            .populate('area_id', 'name')
            .populate('assigned_delivery_boy_id', 'name phone');
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

router.get('/public/delivery', async (req, res) => {
    try {
        const { status, area_id } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (area_id) filter.area_id = area_id;

        const orders = await Order.find(filter)
            .populate('area_id', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/delivery-boy/:id', verifyToken, requireRole(...ORDER_ACCESS_ROLES), async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { assigned_delivery_boy_id: req.params.id };
        if (status) filter.status = status;

        const orders = await Order.find(filter)
            .populate('area_id', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/:orderId/delivery-status', upload.single('photo_proof'), async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ['out_for_delivery', 'delivered', 'cancelled'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value.' });
        }

        const updateData = { status };
        if (req.file && req.file.path) {
            updateData.photo_proof_url = req.file.path;
        }

        if (status === 'delivered') {
            const existingOrder = await Order.findOne({ orderId: req.params.orderId });
            if (!existingOrder) {
                return res.status(404).json({ success: false, message: 'Order not found.' });
            }
            if (!updateData.photo_proof_url && !existingOrder.photo_proof_url) {
                return res.status(400).json({ success: false, message: 'Photo proof is mandatory for delivered status.' });
            }
        }

        const order = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            updateData,
            { new: true }
        ).populate('area_id assigned_delivery_boy_id');
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        res.json({ success: true, message: 'Delivery status updated.', order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
