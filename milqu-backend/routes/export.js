const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Expense = require('../models/Expense');
const InventoryLog = require('../models/InventoryLog');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const EXPORT_ROLES = ['super_admin', 'manager'];
const GST_RATE = 0.05;

router.get('/orders', verifyToken, requireRole(...EXPORT_ROLES), async (req, res) => {
    try {
        const { from, to, status } = req.query;
        const filter = {};
        if (from || to) { filter.createdAt = {}; if (from) filter.createdAt.$gte = new Date(from); if (to) { const e = new Date(to); e.setHours(23,59,59,999); filter.createdAt.$lte = e; } }
        if (status) filter.status = status;
        const orders = await Order.find(filter).populate('area_id', 'name').populate('assigned_delivery_boy_id', 'name phone').sort({ createdAt: -1 }).limit(5000);
        const rows = orders.map(o => ({
            orderId: o.orderId, customerName: o.customer?.name, phone: o.customer?.phone, email: o.customer?.email, address: o.customer?.address,
            items: (o.items||[]).map(i => `${i.name}×${i.qty}`).join(', '), itemCount: (o.items||[]).length,
            total: o.total, gst: parseFloat((o.total * GST_RATE / (1+GST_RATE)).toFixed(2)), totalBeforeGST: parseFloat((o.total / (1+GST_RATE)).toFixed(2)),
            paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus, status: o.status,
            area: o.area_id?.name || '', deliveryBoy: o.assigned_delivery_boy_id?.name || '',
            date: o.createdAt
        }));
        const totalRevenue = rows.reduce((s,r) => s + r.total, 0);
        const totalGST = rows.reduce((s,r) => s + r.gst, 0);
        res.json({ success: true, total: rows.length, summary: { totalRevenue, totalGST, totalOrders: rows.length }, rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/revenue', verifyToken, requireRole(...EXPORT_ROLES), async (req, res) => {
    try {
        const { from, to } = req.query;
        const match = {};
        if (from || to) { match.createdAt = {}; if (from) match.createdAt.$gte = new Date(from); if (to) { const e = new Date(to); e.setHours(23,59,59,999); match.createdAt.$lte = e; } }
        const daily = await Order.aggregate([{ $match: match }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 }, delivered: { $sum: { $cond: [{ $eq: ['$status','delivered'] }, '$total', 0] } }, cancelled: { $sum: { $cond: [{ $eq: ['$status','cancelled'] }, '$total', 0] } } } }, { $sort: { _id: 1 } }]);
        const rows = daily.map(d => ({ date: d._id, revenue: d.revenue, orders: d.orders, deliveredRevenue: d.delivered, cancelledAmount: d.cancelled, gst: parseFloat((d.revenue * GST_RATE / (1+GST_RATE)).toFixed(2)), netRevenue: parseFloat((d.revenue / (1+GST_RATE)).toFixed(2)) }));
        const totalRevenue = rows.reduce((s,r) => s + r.revenue, 0);
        const totalGST = rows.reduce((s,r) => s + r.gst, 0);
        res.json({ success: true, summary: { totalRevenue, totalGST, totalDays: rows.length, avgDailyRevenue: rows.length ? parseFloat((totalRevenue/rows.length).toFixed(2)) : 0 }, rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/customers', verifyToken, requireRole(...EXPORT_ROLES), async (req, res) => {
    try {
        const customers = await Order.aggregate([
            { $group: { _id: '$customer.phone', name: { $first: '$customer.name' }, phone: { $first: '$customer.phone' }, email: { $first: '$customer.email' }, address: { $first: '$customer.address' }, totalOrders: { $sum: 1 }, totalSpent: { $sum: '$total' }, firstOrder: { $min: '$createdAt' }, lastOrder: { $max: '$createdAt' }, avgOrderValue: { $avg: '$total' } } },
            { $sort: { totalSpent: -1 } }
        ]);
        const rows = customers.map(c => ({ ...c, avgOrderValue: parseFloat((c.avgOrderValue||0).toFixed(2)), segment: c.totalOrders >= 5 ? 'Loyal' : c.totalOrders > 1 ? 'Returning' : 'New' }));
        res.json({ success: true, total: rows.length, summary: { totalCustomers: rows.length, totalRevenue: rows.reduce((s,r) => s + r.totalSpent, 0), repeatCustomers: rows.filter(r => r.totalOrders > 1).length }, rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/inventory', verifyToken, requireRole(...EXPORT_ROLES), async (req, res) => {
    try {
        const products = await Product.find({}).sort({ category: 1, name: 1 });
        const rows = products.map(p => ({ name: p.name, category: p.category, price: p.price, costPrice: p.costPrice || 0, stock: p.stock, status: p.status, value: p.price * p.stock, lowStockThreshold: p.lowStockThreshold || 10, isLowStock: p.stock > 0 && p.stock <= (p.lowStockThreshold || 10), lastRestocked: p.lastRestockedAt }));
        const totalValue = rows.reduce((s,r) => s + r.value, 0);
        res.json({ success: true, total: rows.length, summary: { totalProducts: rows.length, totalValue, lowStockCount: rows.filter(r => r.isLowStock).length, outOfStockCount: rows.filter(r => r.stock <= 0).length }, rows });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/analytics', verifyToken, requireRole(...EXPORT_ROLES), async (req, res) => {
    try {
        const [revAgg, ordAgg, custAgg, prodAgg] = await Promise.all([
            Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
            Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } }]),
            Order.aggregate([{ $group: { _id: '$customer.phone' } }, { $count: 'total' }]),
            Order.aggregate([{ $unwind: '$items' }, { $group: { _id: '$items.name', qty: { $sum: '$items.qty' }, rev: { $sum: { $multiply: ['$items.price','$items.qty'] } } } }, { $sort: { rev: -1 } }, { $limit: 10 }])
        ]);
        const expAgg = await Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
        const rev = revAgg[0] || { total: 0, count: 0 };
        const expenses = (expAgg[0]||{}).total || 0;
        res.json({
            success: true,
            summary: { totalRevenue: rev.total, totalOrders: rev.count, totalCustomers: (custAgg[0]||{}).total||0, totalExpenses: expenses, netProfit: rev.total - expenses, gstCollected: parseFloat((rev.total * GST_RATE / (1+GST_RATE)).toFixed(2)) },
            ordersByStatus: ordAgg, topProducts: prodAgg
        });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
