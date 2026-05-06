const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Expense = require('../models/Expense');
const Report = require('../models/Report');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const REPORT_ROLES = ['super_admin', 'manager'];
const GST_RATE = 0.05;

function generateReportId(type) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `RPT-${type.toUpperCase().charAt(0)}-${dateStr}-${rand}`;
}

async function buildReportData(periodStart, periodEnd) {
    const match = { createdAt: { $gte: periodStart, $lte: periodEnd } };

    const [revenueAgg, statusAgg, customerAgg, topProducts, expenseAgg] = await Promise.all([
        Order.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$total' },
                    totalOrders: { $sum: 1 },
                    delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
                    cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
                }
            }
        ]),
        Order.aggregate([
            { $match: match },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Order.aggregate([
            { $match: match },
            { $group: { _id: '$customer.phone' } },
            { $count: 'total' }
        ]),
        Order.aggregate([
            { $match: match },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.name',
                    emoji: { $first: '$items.e' },
                    qty: { $sum: '$items.qty' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 }
        ]),
        Expense.aggregate([
            { $match: { date: { $gte: periodStart, $lte: periodEnd } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
    ]);

    // Revenue by day
    const revenueByDay = await Order.aggregate([
        { $match: match },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                revenue: { $sum: '$total' },
                orders: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // New customers in this period
    const allCustomersBefore = await Order.aggregate([
        { $match: { createdAt: { $lt: periodStart } } },
        { $group: { _id: '$customer.phone' } }
    ]);
    const knownPhones = new Set(allCustomersBefore.map(c => c._id));
    const periodCustomers = await Order.aggregate([
        { $match: match },
        { $group: { _id: '$customer.phone' } }
    ]);
    const newCustomers = periodCustomers.filter(c => !knownPhones.has(c._id)).length;

    const rev = revenueAgg[0] || { totalRevenue: 0, totalOrders: 0, delivered: 0, cancelled: 0 };
    const totalExpenses = (expenseAgg[0] || {}).total || 0;
    const gstCollected = parseFloat((rev.totalRevenue * GST_RATE / (1 + GST_RATE)).toFixed(2));

    return {
        totalRevenue: rev.totalRevenue,
        totalOrders: rev.totalOrders,
        totalCustomers: (customerAgg[0] || {}).total || 0,
        newCustomers,
        deliveredOrders: rev.delivered,
        cancelledOrders: rev.cancelled,
        avgOrderValue: rev.totalOrders > 0 ? parseFloat((rev.totalRevenue / rev.totalOrders).toFixed(2)) : 0,
        topProducts,
        revenueByDay,
        ordersByStatus: statusAgg,
        totalExpenses,
        netProfit: rev.totalRevenue - totalExpenses,
        gstCollected
    };
}

// Generate report on demand
router.post('/generate', verifyToken, requireRole(...REPORT_ROLES), async (req, res) => {
    try {
        const { type = 'daily', from, to } = req.body;
        const now = new Date();
        let periodStart, periodEnd;

        if (from && to) {
            periodStart = new Date(from); periodStart.setHours(0, 0, 0, 0);
            periodEnd = new Date(to); periodEnd.setHours(23, 59, 59, 999);
        } else if (type === 'daily') {
            periodStart = new Date(now); periodStart.setHours(0, 0, 0, 0);
            periodEnd = new Date(now); periodEnd.setHours(23, 59, 59, 999);
        } else if (type === 'weekly') {
            periodEnd = new Date(now); periodEnd.setHours(23, 59, 59, 999);
            periodStart = new Date(now); periodStart.setDate(periodStart.getDate() - 6); periodStart.setHours(0, 0, 0, 0);
        } else {
            periodStart = new Date(now); periodStart.setDate(1); periodStart.setHours(0, 0, 0, 0);
            periodEnd = new Date(now); periodEnd.setHours(23, 59, 59, 999);
        }

        const data = await buildReportData(periodStart, periodEnd);
        const report = new Report({
            reportId: generateReportId(type),
            type,
            periodStart,
            periodEnd,
            data,
            generatedAt: now,
            status: 'completed'
        });
        await report.save();

        res.status(201).json({ success: true, message: `${type} report generated.`, report });
    } catch (err) {
        console.error('Report generation error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// List reports
router.get('/', verifyToken, requireRole(...REPORT_ROLES), async (req, res) => {
    try {
        const { type, page = 1, limit = 20 } = req.query;
        const filter = type ? { type } : {};
        const safePage = Math.max(1, parseInt(page) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));

        const reports = await Report.find(filter)
            .sort({ generatedAt: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit);
        const total = await Report.countDocuments(filter);

        res.json({ success: true, total, page: safePage, reports });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get specific report
router.get('/:id', verifyToken, requireRole(...REPORT_ROLES), async (req, res) => {
    try {
        const report = await Report.findOne({ reportId: req.params.id });
        if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
        res.json({ success: true, report });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get latest report by type
router.get('/latest/:type', verifyToken, requireRole(...REPORT_ROLES), async (req, res) => {
    try {
        const report = await Report.findOne({ type: req.params.type }).sort({ generatedAt: -1 });
        if (!report) return res.status(404).json({ success: false, message: 'No report found.' });
        res.json({ success: true, report });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Vercel Cron Endpoints ──
async function cronHandler(type, res) {
    try {
        const now = new Date();
        let periodStart, periodEnd;

        if (type === 'daily') {
            periodStart = new Date(now); periodStart.setDate(periodStart.getDate() - 1); periodStart.setHours(0, 0, 0, 0);
            periodEnd = new Date(now); periodEnd.setDate(periodEnd.getDate() - 1); periodEnd.setHours(23, 59, 59, 999);
        } else if (type === 'weekly') {
            periodEnd = new Date(now); periodEnd.setDate(periodEnd.getDate() - 1); periodEnd.setHours(23, 59, 59, 999);
            periodStart = new Date(periodEnd); periodStart.setDate(periodStart.getDate() - 6); periodStart.setHours(0, 0, 0, 0);
        } else {
            periodEnd = new Date(now); periodEnd.setDate(0); periodEnd.setHours(23, 59, 59, 999);
            periodStart = new Date(periodEnd); periodStart.setDate(1); periodStart.setHours(0, 0, 0, 0);
        }

        const data = await buildReportData(periodStart, periodEnd);
        const report = new Report({
            reportId: generateReportId(type),
            type,
            periodStart,
            periodEnd,
            data,
            generatedAt: now,
            status: 'completed'
        });
        await report.save();

        // Create notification for report ready
        const NotificationModel = require('../models/Notification');
        await NotificationModel.create({
            type: 'report_ready',
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report Ready`,
            message: `Your ${type} report for ${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()} has been generated.`,
            data: { reportId: report.reportId, type },
            priority: 'low'
        });

        res.json({ success: true, message: `${type} cron report generated.`, reportId: report.reportId });
    } catch (err) {
        console.error(`Cron ${type} report error:`, err);
        res.status(500).json({ success: false, message: err.message });
    }
}

router.post('/cron/daily', async (req, res) => cronHandler('daily', res));
router.post('/cron/weekly', async (req, res) => cronHandler('weekly', res));
router.post('/cron/monthly', async (req, res) => cronHandler('monthly', res));

module.exports = router;
