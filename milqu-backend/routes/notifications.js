const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Subscription = require('../models/Subscription');
const Message = require('../models/Message');
const NotificationModel = require('../models/Notification');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Legacy counts endpoint (preserved)
router.get('/counts', verifyToken, requireRole('super_admin', 'manager', 'delivery_staff'), async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const isDeliveryStaff = req.admin && req.admin.role === 'delivery_staff';
        const orderFilter = isDeliveryStaff
            ? { assigned_delivery_boy_id: req.admin._id, createdAt: { $gte: twentyFourHoursAgo } }
            : { createdAt: { $gte: twentyFourHoursAgo } };

        const [newOrders, newSubscriptions, unreadMessages, unreadNotifications] = await Promise.all([
            Order.countDocuments(orderFilter),
            isDeliveryStaff ? Promise.resolve(0) : Subscription.countDocuments({ createdAt: { $gte: twentyFourHoursAgo } }),
            isDeliveryStaff ? Promise.resolve(0) : Message.countDocuments({ status: 'unread' }),
            NotificationModel.countDocuments({ isRead: false })
        ]);

        const total = newOrders + newSubscriptions + unreadMessages + unreadNotifications;
        res.json({ success: true, newOrders, newSubscriptions, unreadMessages, unreadNotifications, total });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Full notification list
router.get('/', verifyToken, requireRole('super_admin', 'manager'), async (req, res) => {
    try {
        const { type, isRead, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (type) filter.type = type;
        if (isRead !== undefined) filter.isRead = isRead === 'true';
        const safePage = Math.max(1, parseInt(page) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 50));
        const notifications = await NotificationModel.find(filter).sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit);
        const total = await NotificationModel.countDocuments(filter);
        const unreadCount = await NotificationModel.countDocuments({ isRead: false });
        res.json({ success: true, total, unreadCount, page: safePage, notifications });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Mark single as read
router.patch('/:id/read', verifyToken, requireRole('super_admin', 'manager'), async (req, res) => {
    try {
        const notif = await NotificationModel.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        if (!notif) return res.status(404).json({ success: false, message: 'Notification not found.' });
        res.json({ success: true, notification: notif });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Mark all as read
router.patch('/read-all', verifyToken, requireRole('super_admin', 'manager'), async (req, res) => {
    try {
        await NotificationModel.updateMany({ isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Check for new alerts (low stock, milestones, etc)
router.post('/check', verifyToken, requireRole('super_admin', 'manager'), async (req, res) => {
    try {
        const alerts = [];
        // Low stock check
        const products = await Product.find({});
        for (const p of products) {
            const threshold = p.lowStockThreshold || 10;
            if (p.stock <= 0) {
                const existing = await NotificationModel.findOne({ type: 'out_of_stock', 'data.productId': p._id.toString(), isRead: false });
                if (!existing) {
                    await NotificationModel.create({ type: 'out_of_stock', title: `${p.emoji} ${p.name} Out of Stock`, message: `${p.name} is completely out of stock. Restock immediately.`, data: { productId: p._id.toString(), productName: p.name }, priority: 'critical' });
                    alerts.push(`Out of stock: ${p.name}`);
                }
            } else if (p.stock <= threshold) {
                const existing = await NotificationModel.findOne({ type: 'low_stock', 'data.productId': p._id.toString(), isRead: false });
                if (!existing) {
                    await NotificationModel.create({ type: 'low_stock', title: `${p.emoji} ${p.name} Low Stock`, message: `${p.name} has only ${p.stock} units left (threshold: ${threshold}).`, data: { productId: p._id.toString(), productName: p.name, stock: p.stock, threshold }, priority: 'high' });
                    alerts.push(`Low stock: ${p.name} (${p.stock})`);
                }
            }
        }

        // Revenue milestone check
        const totalRevenueAgg = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]);
        const totalRevenue = (totalRevenueAgg[0] || {}).total || 0;
        const milestones = [10000, 50000, 100000, 500000, 1000000];
        for (const milestone of milestones) {
            if (totalRevenue >= milestone) {
                const existing = await NotificationModel.findOne({ type: 'revenue_milestone', 'data.milestone': milestone });
                if (!existing) {
                    await NotificationModel.create({ type: 'revenue_milestone', title: `🎉 Revenue Milestone: ₹${milestone.toLocaleString()}`, message: `Congratulations! Total revenue crossed ₹${milestone.toLocaleString()}.`, data: { milestone, totalRevenue }, priority: 'low' });
                    alerts.push(`Milestone: ₹${milestone.toLocaleString()}`);
                }
            }
        }

        res.json({ success: true, alertsCreated: alerts.length, alerts });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
