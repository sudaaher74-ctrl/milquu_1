const express = require('express');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const NotificationModel = require('../models/Notification');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const INVENTORY_ROLES = ['super_admin', 'manager'];
const SHELF_LIFE = { milk: 2, dairy: 7, vegetables: 3, fruits: 5, other: 30 };

router.get('/alerts', verifyToken, requireRole(...INVENTORY_ROLES), async (req, res) => {
    try {
        const products = await Product.find({});
        const lowStock = products.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 10));
        const outOfStock = products.filter(p => p.stock <= 0 || p.status === 'out_of_stock');
        res.json({
            success: true,
            lowStock: lowStock.map(p => ({ _id: p._id, name: p.name, emoji: p.emoji, stock: p.stock, threshold: p.lowStockThreshold || 10, category: p.category })),
            outOfStock: outOfStock.map(p => ({ _id: p._id, name: p.name, emoji: p.emoji, category: p.category })),
            totalAlerts: lowStock.length + outOfStock.length
        });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/logs', verifyToken, requireRole(...INVENTORY_ROLES), async (req, res) => {
    try {
        const { productId, action, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (productId) filter.productId = productId;
        if (action) filter.action = action;
        const safePage = Math.max(1, parseInt(page) || 1);
        const safeLimit = Math.min(200, Math.max(1, parseInt(limit) || 50));
        const logs = await InventoryLog.find(filter).populate('productId', 'name emoji').populate('performedBy', 'name').sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit);
        const total = await InventoryLog.countDocuments(filter);
        res.json({ success: true, total, page: safePage, logs });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/expiry', verifyToken, requireRole(...INVENTORY_ROLES), async (req, res) => {
    try {
        const products = await Product.find({ stock: { $gt: 0 } });
        const now = new Date();
        const expiringProducts = [];
        products.forEach(p => {
            const shelfLife = p.expiryDays || SHELF_LIFE[p.category] || 30;
            const restockDate = p.lastRestockedAt || p.createdAt;
            const expiryDate = new Date(restockDate);
            expiryDate.setDate(expiryDate.getDate() + shelfLife);
            const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 3) {
                expiringProducts.push({ _id: p._id, name: p.name, emoji: p.emoji, category: p.category, stock: p.stock, shelfLife, expiryDate, daysLeft: Math.max(0, daysLeft), status: daysLeft <= 0 ? 'expired' : 'expiring_soon' });
            }
        });
        expiringProducts.sort((a, b) => a.daysLeft - b.daysLeft);
        res.json({ success: true, expiringProducts, totalAlerts: expiringProducts.length });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/recommendations', verifyToken, requireRole(...INVENTORY_ROLES), async (req, res) => {
    try {
        const products = await Product.find({});
        const Order = require('../models/Order');
        const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const salesData = await Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $unwind: '$items' },
            { $group: { _id: '$items.productId', totalSold: { $sum: '$items.qty' }, orderCount: { $sum: 1 } } }
        ]);
        const salesMap = new Map();
        salesData.forEach(s => salesMap.set(s._id, s));
        const recommendations = products.map(p => {
            const sales = salesMap.get(p._id.toString()) || { totalSold: 0 };
            const avgDailySales = sales.totalSold / 7;
            const daysOfStockLeft = avgDailySales > 0 ? Math.floor(p.stock / avgDailySales) : 999;
            const suggestedRestock = Math.ceil(avgDailySales * 7);
            return { _id: p._id, name: p.name, emoji: p.emoji, category: p.category, currentStock: p.stock, avgDailySales: parseFloat(avgDailySales.toFixed(1)), daysOfStockLeft, suggestedRestock, urgency: daysOfStockLeft <= 1 ? 'critical' : daysOfStockLeft <= 3 ? 'high' : daysOfStockLeft <= 7 ? 'medium' : 'low' };
        }).filter(r => r.urgency !== 'low').sort((a, b) => a.daysOfStockLeft - b.daysOfStockLeft);
        res.json({ success: true, recommendations });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/restock/:productId', verifyToken, requireRole(...INVENTORY_ROLES), async (req, res) => {
    try {
        const { quantity } = req.body;
        if (!quantity || quantity <= 0) return res.status(400).json({ success: false, message: 'Valid quantity required.' });
        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
        const previousStock = product.stock;
        product.stock += parseInt(quantity);
        product.status = 'active';
        product.lastRestockedAt = new Date();
        await product.save();
        await InventoryLog.create({ productId: product._id, action: 'restock', quantity: parseInt(quantity), previousStock, newStock: product.stock, reason: `Manual restock of ${quantity} units`, performedBy: req.admin?._id });
        res.json({ success: true, message: `Restocked ${product.name} with ${quantity} units.`, product });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
