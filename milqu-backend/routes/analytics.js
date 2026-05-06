const express = require('express');
const {
    getAiInsights,
    getAreaAnalytics,
    getCustomerAnalytics,
    getDashboardSummary,
    getDeliveryAnalytics,
    getExpenseAnalytics,
    getOrderAnalytics,
    getProductAnalytics,
    getRevenueAnalytics,
    getRevenueDetailedAnalytics
} = require('../services/analytics-service');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const ANALYTICS_ROLES = ['super_admin', 'manager'];

router.get('/revenue', verifyToken, requireRole(...ANALYTICS_ROLES), async (req, res) => {
    try {
        const data = await getRevenueAnalytics(req.query);
        res.json({ success: true, ...data });
    } catch (err) {
        console.error('Revenue analytics error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/revenue/detailed', verifyToken, requireRole(...ANALYTICS_ROLES), async (req, res) => {
    try {
        const data = await getRevenueDetailedAnalytics(req.query);
        res.json(data);
    } catch (err) {
        console.error('Detailed revenue analytics error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/customers', verifyToken, requireRole(...ANALYTICS_ROLES), async (req, res) => {
    try {
        const data = await getCustomerAnalytics(req.query);
        res.json(data);
    } catch (err) {
        console.error('Customer analytics error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/products', verifyToken, requireRole(...ANALYTICS_ROLES), async (req, res) => {
    try {
        const data = await getProductAnalytics(req.query);
        res.json(data);
    } catch (err) {
        console.error('Product analytics error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/orders', verifyToken, requireRole(...ANALYTICS_ROLES), async (req, res) => {
    try {
        const data = await getOrderAnalytics(req.query);
        res.json(data);
    } catch (err) {
        console.error('Order analytics error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/dashboard-summary', verifyToken, requireRole(...ANALYTICS_ROLES), async (req, res) => {
    try {
        const data = await getDashboardSummary();
        res.json(data);
    } catch (err) {
        console.error('Dashboard summary error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/expenses', verifyToken, requireRole(...ANALYTICS_ROLES), async (req, res) => {
    try {
        const data = await getExpenseAnalytics(req.query);
        res.json(data);
    } catch (err) {
        console.error('Expense analytics error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/areas', verifyToken, requireRole(...ANALYTICS_ROLES), async (req, res) => {
    try {
        const data = await getAreaAnalytics(req.query);
        res.json(data);
    } catch (err) {
        console.error('Area analytics error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/delivery', verifyToken, requireRole(...ANALYTICS_ROLES), async (req, res) => {
    try {
        const data = await getDeliveryAnalytics(req.query);
        res.json(data);
    } catch (err) {
        console.error('Delivery analytics error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/ai-insights', verifyToken, requireRole(...ANALYTICS_ROLES), async (req, res) => {
    try {
        const data = await getAiInsights();
        res.json(data);
    } catch (err) {
        console.error('AI insights error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
