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
const { sanitizeMultilineText, sanitizeText } = require('../utils/sanitize');

const router = express.Router();
const ORDER_ACCESS_ROLES = ['super_admin', 'manager', 'delivery_staff'];
const COD_HANDLING_FEE = 1;
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

function isDeliveryStaff(admin) {
    return admin && admin.role === 'delivery_staff';
}

function buildOrderAccessFilter(req, filter = {}) {
    if (!isDeliveryStaff(req.admin)) {
        return filter;
    }

    return {
        ...filter,
        assigned_delivery_boy_id: req.admin._id
    };
}

function canAccessOrder(req, order) {
    if (!isDeliveryStaff(req.admin)) {
        return true;
    }

    return order &&
        order.assigned_delivery_boy_id &&
        String(order.assigned_delivery_boy_id) === String(req.admin._id);
}

function denyOrderAccess(res) {
    return res.status(403).json({ success: false, message: 'You can only access orders assigned to you.' });
}

async function restoreOrderStock(order) {
    for (const item of order.items || []) {
        if (!item.productId || !item.qty) {
            continue;
        }

        await Product.updateOne(
            { _id: item.productId },
            [
                {
                    $set: {
                        stock: { $add: ['$stock', item.qty] }
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
    }
}

router.post('/', publicOrderLimiter, async (req, res) => {
    try {
        const { customer, items, paymentMethod, area_id } = req.body;
        const cleanCustomer = {
            name: sanitizeText(customer && customer.name),
            phone: sanitizeText(customer && customer.phone),
            email: sanitizeText(customer && customer.email).toLowerCase(),
            address: sanitizeText(customer && customer.address),
            notes: sanitizeMultilineText(customer && customer.notes)
        };
        const cleanPaymentMethod = sanitizeText(paymentMethod).toLowerCase();

        if (!customer || !Array.isArray(items) || items.length === 0 || !cleanPaymentMethod) {
            return res.status(400).json({ success: false, message: 'Missing required order fields.' });
        }
        if (!cleanCustomer.name || !cleanCustomer.phone || !cleanCustomer.address) {
            return res.status(400).json({ success: false, message: 'Customer name, phone, and address are required.' });
        }
        if (cleanCustomer.name.length > 100) {
            return res.status(400).json({ success: false, message: 'Name must be 100 characters or fewer.' });
        }
        if (cleanCustomer.address.length > 500) {
            return res.status(400).json({ success: false, message: 'Address must be 500 characters or fewer.' });
        }
        if (cleanCustomer.notes && cleanCustomer.notes.length > 1000) {
            return res.status(400).json({ success: false, message: 'Notes must be 1000 characters or fewer.' });
        }
        if (cleanCustomer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanCustomer.email)) {
            return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
        }
        if (!/^[6-9]\d{9}$/.test(cleanCustomer.phone)) {
            return res.status(400).json({ success: false, message: 'Enter a valid 10-digit Indian phone number.' });
        }
        if (!['upi', 'card', 'netbanking', 'cod'].includes(cleanPaymentMethod)) {
            return res.status(400).json({ success: false, message: 'Invalid payment method.' });
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

        const total = cleanPaymentMethod === 'cod' ? subtotal + COD_HANDLING_FEE : subtotal;
        const orderId = generatePublicId('MQ');

        const order = new Order({
            orderId,
            customer: cleanCustomer,
            items: orderItems,
            total,
            paymentMethod: cleanPaymentMethod,
            status: 'confirmed',
            paymentStatus: cleanPaymentMethod === 'cod' ? 'pending' : 'paid',
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
            totals: { subtotal, handlingFee: cleanPaymentMethod === 'cod' ? COD_HANDLING_FEE : 0, total },
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
        const filter = buildOrderAccessFilter(req, status ? { status } : {});

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
        const match = buildOrderAccessFilter(req);
        const totalOrders = await Order.countDocuments(match);
        const totalRevenue = await Order.aggregate([
            { $match: match },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayOrders = await Order.countDocuments({ ...match, createdAt: { $gte: todayStart } });
        const pendingOrders = await Order.countDocuments({ ...match, status: { $in: ['pending', 'confirmed'] } });
        const byStatus = await Order.aggregate([
            { $match: match },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

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
        const match = buildOrderAccessFilter(req);
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const dailyData = await Order.aggregate([
            { $match: { ...match, createdAt: { $gte: sevenDaysAgo } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const fourWeeksAgo = new Date(now);
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 27);
        fourWeeksAgo.setHours(0, 0, 0, 0);
        const weeklyData = await Order.aggregate([
            { $match: { ...match, createdAt: { $gte: fourWeeksAgo } } },
            { $group: { _id: { $isoWeek: '$createdAt' }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);
        const monthlyData = await Order.aggregate([
            { $match: { ...match, createdAt: { $gte: sixMonthsAgo } } },
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
            { $match: buildOrderAccessFilter(req) },
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
        if (!canAccessOrder(req, order)) {
            return denyOrderAccess(res);
        }
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/:orderId/status', verifyToken, requireRole(...ORDER_ACCESS_ROLES), async (req, res) => {
    try {
        const { status } = req.body;
        const nextStatus = sanitizeText(status).toLowerCase();
        const allowed = isDeliveryStaff(req.admin)
            ? ['out_for_delivery', 'delivered', 'failed', 'cancelled']
            : ['pending', 'confirmed', 'assigned', 'out_for_delivery', 'delivered', 'failed', 'cancelled'];
        if (!allowed.includes(nextStatus)) {
            return res.status(400).json({ success: false, message: 'Invalid status value.' });
        }

        const existingOrder = await Order.findOne({ orderId: req.params.orderId });
        if (!existingOrder) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        if (!canAccessOrder(req, existingOrder)) {
            return denyOrderAccess(res);
        }
        if (existingOrder.status === 'cancelled' && nextStatus !== 'cancelled') {
            return res.status(400).json({ success: false, message: 'Cancelled orders cannot be reopened.' });
        }

        const updateData = { status: nextStatus };
        if (nextStatus === 'cancelled' && existingOrder.status !== 'cancelled') {
            await restoreOrderStock(existingOrder);
            updateData.stockRestoredAt = new Date();
            if (existingOrder.paymentMethod === 'cod') {
                updateData.paymentStatus = 'failed';
            }
        }
        if (nextStatus === 'delivered' && existingOrder.paymentMethod === 'cod') {
            updateData.paymentStatus = 'paid';
        }

        const order = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            updateData,
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

router.get('/public/delivery', verifyToken, requireRole(...ORDER_ACCESS_ROLES), async (req, res) => {
    try {
        const { status, area_id } = req.query;
        const filter = buildOrderAccessFilter(req);
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
        if (isDeliveryStaff(req.admin) && String(req.params.id) !== String(req.admin._id)) {
            return denyOrderAccess(res);
        }

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

router.patch('/:orderId/delivery-status', verifyToken, requireRole(...ORDER_ACCESS_ROLES), upload.single('photo_proof'), async (req, res) => {
    try {
        const nextStatus = sanitizeText(req.body.status).toLowerCase();
        const allowed = ['out_for_delivery', 'delivered', 'failed', 'cancelled'];
        if (!allowed.includes(nextStatus)) {
            return res.status(400).json({ success: false, message: 'Invalid status value.' });
        }

        const existingOrder = await Order.findOne({ orderId: req.params.orderId });
        if (!existingOrder) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }
        if (!canAccessOrder(req, existingOrder)) {
            return denyOrderAccess(res);
        }
        if (existingOrder.status === 'cancelled' && nextStatus !== 'cancelled') {
            return res.status(400).json({ success: false, message: 'Cancelled orders cannot be reopened.' });
        }

        const updateData = { status: nextStatus };
        if (req.file && req.file.path) {
            updateData.photo_proof_url = req.file.path;
        }

        if (nextStatus === 'delivered') {
            if (!updateData.photo_proof_url && !existingOrder.photo_proof_url) {
                return res.status(400).json({ success: false, message: 'Photo proof is mandatory for delivered status.' });
            }
        }
        if (nextStatus === 'cancelled' && existingOrder.status !== 'cancelled') {
            await restoreOrderStock(existingOrder);
            updateData.stockRestoredAt = new Date();
            if (existingOrder.paymentMethod === 'cod') {
                updateData.paymentStatus = 'failed';
            }
        }
        if (nextStatus === 'delivered' && existingOrder.paymentMethod === 'cod') {
            updateData.paymentStatus = 'paid';
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

// ── Delivery Stats Summary
router.get('/stats/delivery', verifyToken, requireRole(...ORDER_ACCESS_ROLES), async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayFilter = { createdAt: { $gte: todayStart } };

        const deliveredToday = await Order.countDocuments({ ...todayFilter, status: 'delivered' });
        const inProgress = await Order.countDocuments({ status: { $in: ['assigned', 'out_for_delivery'] } });
        const failed = await Order.countDocuments({ ...todayFilter, status: 'failed' });
        const pending = await Order.countDocuments({ status: { $in: ['pending', 'confirmed'] } });

        // Orders by area
        const byArea = await Order.aggregate([
            { $match: { ...todayFilter } },
            { $group: { _id: '$area_id', count: { $sum: 1 } } }
        ]);

        // COD stats
        const codOrders = await Order.countDocuments({ ...todayFilter, paymentMethod: 'cod' });
        const codCollected = await Order.aggregate([
            { $match: { ...todayFilter, paymentMethod: 'cod', status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const codPending = await Order.aggregate([
            { $match: { ...todayFilter, paymentMethod: 'cod', status: { $ne: 'delivered' } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        res.json({
            success: true,
            deliveredToday,
            inProgress,
            failed,
            pending,
            byArea,
            cod: {
                orders: codOrders,
                collected: codCollected[0]?.total || 0,
                pending: codPending[0]?.total || 0
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Assign delivery boy to order
router.patch('/:orderId/assign', verifyToken, requireRole('super_admin', 'manager'), async (req, res) => {
    try {
        const { delivery_boy_id } = req.body;
        if (!delivery_boy_id) {
            return res.status(400).json({ success: false, message: 'delivery_boy_id is required.' });
        }

        const deliveryBoy = await Admin.findOne({ _id: delivery_boy_id, role: 'delivery_staff' });
        if (!deliveryBoy) {
            return res.status(404).json({ success: false, message: 'Delivery boy not found.' });
        }

        const order = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            { assigned_delivery_boy_id: delivery_boy_id, status: 'assigned' },
            { new: true }
        ).populate('area_id assigned_delivery_boy_id');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        res.json({ success: true, message: `Order assigned to ${deliveryBoy.name}.`, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Bulk assign orders by area
router.post('/bulk-assign', verifyToken, requireRole('super_admin', 'manager'), async (req, res) => {
    try {
        const unassigned = await Order.find({
            status: { $in: ['pending', 'confirmed'] },
            assigned_delivery_boy_id: null
        }).populate('area_id');

        if (unassigned.length === 0) {
            return res.json({ success: true, assigned: 0, message: 'No unassigned orders found.' });
        }

        let assigned = 0;
        for (const order of unassigned) {
            let deliveryBoy = null;
            if (order.area_id) {
                deliveryBoy = await Admin.findOne({ role: 'delivery_staff', assigned_area: order.area_id._id || order.area_id });
            }
            if (!deliveryBoy) {
                deliveryBoy = await Admin.findOne({ role: 'delivery_staff' });
            }
            if (deliveryBoy) {
                order.assigned_delivery_boy_id = deliveryBoy._id;
                order.status = 'assigned';
                await order.save();
                assigned++;
            }
        }

        res.json({ success: true, assigned, total: unassigned.length, message: `Assigned ${assigned} orders.` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
