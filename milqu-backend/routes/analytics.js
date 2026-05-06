const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Expense = require('../models/Expense');
const Subscription = require('../models/Subscription');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const ANALYTICS_ROLES = ['super_admin', 'manager'];
const GST_RATE = 0.05; // 5% GST for dairy products in India
const DEFAULT_PROFIT_MARGIN = 0.30; // 30% default if no cost price set

// ── Helper: Date ranges ──
function getDateRange(period) {
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);

    switch (period) {
        case 'today':
            return { start: todayStart, end: todayEnd };
        case 'yesterday': {
            const ys = new Date(todayStart); ys.setDate(ys.getDate() - 1);
            const ye = new Date(todayEnd); ye.setDate(ye.getDate() - 1);
            return { start: ys, end: ye };
        }
        case 'week': {
            const ws = new Date(todayStart); ws.setDate(ws.getDate() - 6);
            return { start: ws, end: todayEnd };
        }
        case 'month': {
            const ms = new Date(todayStart); ms.setDate(1);
            return { start: ms, end: todayEnd };
        }
        case 'year': {
            const yr = new Date(todayStart); yr.setMonth(0, 1);
            return { start: yr, end: todayEnd };
        }
        case '7d': {
            const s = new Date(todayStart); s.setDate(s.getDate() - 6);
            return { start: s, end: todayEnd };
        }
        case '30d': {
            const s = new Date(todayStart); s.setDate(s.getDate() - 29);
            return { start: s, end: todayEnd };
        }
        case '3m': {
            const s = new Date(todayStart); s.setMonth(s.getMonth() - 3);
            return { start: s, end: todayEnd };
        }
        case '12m': {
            const s = new Date(todayStart); s.setFullYear(s.getFullYear() - 1);
            return { start: s, end: todayEnd };
        }
        default:
            return { start: todayStart, end: todayEnd };
    }
}

function getPreviousPeriod(start, end) {
    const duration = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duration);
    return { start: prevStart, end: prevEnd };
}

// ══════════════════════════════════════════
//  REVENUE ANALYTICS
// ══════════════════════════════════════════
router.get('/revenue', verifyToken, requireRole(...ANALYTICS_ROLES), async (req, res) => {
    try {
        const { period = 'today', from, to } = req.query;
        let range;
        if (from && to) {
            range = { start: new Date(from), end: new Date(to) };
            range.end.setHours(23, 59, 59, 999);
        } else {
            range = getDateRange(period);
        }

        const prevRange = getPreviousPeriod(range.start, range.end);
        const matchCurrent = { createdAt: { $gte: range.start, $lte: range.end } };
        const matchPrevious = { createdAt: { $gte: prevRange.start, $lte: prevRange.end } };

        const [currentAgg, previousAgg, refundAgg] = await Promise.all([
            Order.aggregate([
                { $match: matchCurrent },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$total' },
                        totalOrders: { $sum: 1 },
                        deliveredRevenue: {
                            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$total', 0] }
                        },
                        deliveredOrders: {
                            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
                        }
                    }
                }
            ]),
            Order.aggregate([
                { $match: matchPrevious },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$total' },
                        totalOrders: { $sum: 1 }
                    }
                }
            ]),
            Order.aggregate([
                { $match: { ...matchCurrent, status: 'cancelled' } },
                {
                    $group: {
                        _id: null,
                        refundAmount: { $sum: '$total' },
                        refundCount: { $sum: 1 }
                    }
                }
            ])
        ]);

        const current = currentAgg[0] || { totalRevenue: 0, totalOrders: 0, deliveredRevenue: 0, deliveredOrders: 0 };
        const previous = previousAgg[0] || { totalRevenue: 0, totalOrders: 0 };
        const refunds = refundAgg[0] || { refundAmount: 0, refundCount: 0 };

        const growthPercent = previous.totalRevenue > 0
            ? (((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100).toFixed(1)
            : current.totalRevenue > 0 ? 100 : 0;

        const avgOrderValue = current.totalOrders > 0
            ? (current.totalRevenue / current.totalOrders).toFixed(2)
            : 0;

        const gstAmount = (current.deliveredRevenue * GST_RATE / (1 + GST_RATE)).toFixed(2);
        const revenueBeforeGST = (current.deliveredRevenue / (1 + GST_RATE)).toFixed(2);

        // Expenses for the period
        const expenseAgg = await Expense.aggregate([
            { $match: { date: { $gte: range.start, $lte: range.end } } },
            { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
        ]);
        const totalExpenses = (expenseAgg[0] || {}).totalExpenses || 0;
        const netProfit = current.deliveredRevenue - totalExpenses;
        const profitMargin = current.deliveredRevenue > 0
            ? ((netProfit / current.deliveredRevenue) * 100).toFixed(1)
            : 0;

        res.json({
            success: true,
            period,
            dateRange: { from: range.start, to: range.end },
            revenue: {
                total: current.totalRevenue,
                delivered: current.deliveredRevenue,
                previous: previous.totalRevenue,
                growth: parseFloat(growthPercent),
                avgOrderValue: parseFloat(avgOrderValue)
            },
            orders: {
                total: current.totalOrders,
                delivered: current.deliveredOrders,
                previous: previous.totalOrders
            },
            gst: {
                rate: GST_RATE * 100,
                amount: parseFloat(gstAmount),
                revenueBeforeGST: parseFloat(revenueBeforeGST)
            },
            refunds: {
                amount: refunds.refundAmount,
                count: refunds.refundCount
            },
            profit: {
                netProfit,
                totalExpenses,
                margin: parseFloat(profitMargin)
            }
        });
    } catch (err) {
        console.error('Revenue analytics error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ══════════════════════════════════════════
//  REVENUE DETAILED (for charts)
// ══════════════════════════════════════════
router.get('/revenue/detailed', verifyToken, requireRole(...ANALYTICS_ROLES), async (req, res) => {
    try {
        const { period = '30d', from, to } = req.query;
        let range;
        if (from && to) {
            range = { start: new Date(from), end: new Date(to) };
            range.end.setHours(23, 59, 59, 999);
        } else {
            range = getDateRange(period);
        }

        const match = { createdAt: { $gte: range.start, $lte: range.end } };

        const [dailyRevenue, monthlyRevenue, weeklyOrders, hourlyDistribution] = await Promise.all([
            Order.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        revenue: { $sum: '$total' },
                        orders: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Order.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                        revenue: { $sum: '$total' },
                        orders: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Order.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: { $isoWeek: '$createdAt' },
                        year: { $first: { $isoWeekYear: '$createdAt' } },
                        orders: { $sum: 1 },
                        revenue: { $sum: '$total' },
                        delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
                        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
                    }
                },
                { $sort: { year: 1, _id: 1 } }
            ]),
            Order.aggregate([
                { $match: match },
                { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ])
        ]);

        // Expense data for revenue vs expense chart
        const expenseByMonth = await Expense.aggregate([
            { $match: { date: { $gte: range.start, $lte: range.end } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            dailyRevenue,
            monthlyRevenue,
            weeklyOrders,
            hourlyDistribution,
            expenseByMonth
        });
    } catch (err) {
        console.error('Detailed revenue error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ══════════════════════════════════════════
//  CUSTOMER ANALYTICS
// ══════════════════════════════════════════
router.get('/customers', verifyToken, requireRole(...ANALYTICS_ROLES), async (req, res) => {
    try {
        const { period = '30d', from, to } = req.query;
        let range;
        if (from && to) {
            range = { start: new Date(from), end: new Date(to) };
            range.end.setHours(23, 59, 59, 999);
        } else {
            range = getDateRange(period);
        }
        const prevRange = getPreviousPeriod(range.start, range.end);

        // All customers with their order history
        const customerData = await Order.aggregate([
            {
                $group: {
                    _id: '$customer.phone',
                    name: { $first: '$customer.name' },
                    phone: { $first: '$customer.phone' },
                    email: { $first: '$customer.email' },
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$total' },
                    firstOrder: { $min: '$createdAt' },
                    lastOrder: { $max: '$createdAt' },
                    avgOrderValue: { $avg: '$total' }
                }
            },
            { $sort: { totalSpent: -1 } }
        ]);

        const totalCustomers = customerData.length;
        const repeatCustomers = customerData.filter(c => c.totalOrders > 1).length;
        const repeatRate = totalCustomers > 0 ? ((repeatCustomers / totalCustomers) * 100).toFixed(1) : 0;

        // Segment customers
        const segments = { new: 0, returning: 0, loyal: 0, dormant: 0 };
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const ninetyDaysAgo = new Date(); ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        customerData.forEach(c => {
            if (c.totalOrders === 1) segments.new++;
            else if (c.totalOrders >= 5 || c.totalSpent >= 5000) segments.loyal++;
            else if (new Date(c.lastOrder) < ninetyDaysAgo) segments.dormant++;
            else segments.returning++;
        });

        // Customer growth over time
        const customerGrowth = await Order.aggregate([
            { $match: { createdAt: { $gte: range.start, $lte: range.end } } },
            { $group: { _id: '$customer.phone', firstOrder: { $min: '$createdAt' } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$firstOrder' } },
                    newCustomers: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Current period new customers
        const currentNewCustomers = await Order.aggregate([
            { $match: { createdAt: { $gte: range.start, $lte: range.end } } },
            { $group: { _id: '$customer.phone' } },
            { $count: 'total' }
        ]);

        const prevNewCustomers = await Order.aggregate([
            { $match: { createdAt: { $gte: prevRange.start, $lte: prevRange.end } } },
            { $group: { _id: '$customer.phone' } },
            { $count: 'total' }
        ]);

        const currentCount = (currentNewCustomers[0] || {}).total || 0;
        const prevCount = (prevNewCustomers[0] || {}).total || 0;
        const customerGrowthPercent = prevCount > 0
            ? (((currentCount - prevCount) / prevCount) * 100).toFixed(1)
            : currentCount > 0 ? 100 : 0;

        // Top 10 customers by CLV
        const topCustomers = customerData.slice(0, 10).map(c => ({
            ...c,
            clv: c.totalSpent,
            avgOrderValue: parseFloat(c.avgOrderValue?.toFixed(2) || 0)
        }));

        res.json({
            success: true,
            totalCustomers,
            repeatCustomers,
            repeatRate: parseFloat(repeatRate),
            segments,
            customerGrowth,
            customerGrowthPercent: parseFloat(customerGrowthPercent),
            topCustomers
        });
    } catch (err) {
        console.error('Customer analytics error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ══════════════════════════════════════════
//  PRODUCT ANALYTICS
// ══════════════════════════════════════════
router.get('/products', verifyToken, requireRole(...ANALYTICS_ROLES), async (req, res) => {
    try {
        const { period = '30d', from, to } = req.query;
        let range;
        if (from && to) {
            range = { start: new Date(from), end: new Date(to) };
            range.end.setHours(23, 59, 59, 999);
        } else {
            range = getDateRange(period);
        }

        const match = { createdAt: { $gte: range.start, $lte: range.end } };

        // Best sellers
        const bestSellers = await Order.aggregate([
            { $match: match },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.name',
                    productId: { $first: '$items.productId' },
                    emoji: { $first: '$items.e' },
                    totalQty: { $sum: '$items.qty' },
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 10 }
        ]);

        // Sales by category
        const salesByCategory = await Order.aggregate([
            { $match: match },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    let: { pid: { $toObjectId: '$items.productId' } },
                    pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pid'] } } }],
                    as: 'productInfo'
                }
            },
            { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $ifNull: ['$productInfo.category', 'other'] },
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
                    totalQty: { $sum: '$items.qty' }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        // Inventory value
        const products = await Product.find({});
        const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
        const inventoryCost = products.reduce((sum, p) => sum + ((p.costPrice || p.price * (1 - DEFAULT_PROFIT_MARGIN)) * p.stock), 0);

        res.json({
            success: true,
            bestSellers,
            salesByCategory,
            inventoryValue,
            inventoryCost,
            totalProducts: products.length,
            activeProducts: products.filter(p => p.status === 'active').length,
            outOfStock: products.filter(p => p.status === 'out_of_stock').length
        });
    } catch (err) {
        console.error('Product analytics error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ══════════════════════════════════════════
//  ORDER ANALYTICS
// ══════════════════════════════════════════
router.get('/orders', verifyToken, requireRole(...ANALYTICS_ROLES), async (req, res) => {
    try {
        const { period = '30d', from, to } = req.query;
        let range;
        if (from && to) {
            range = { start: new Date(from), end: new Date(to) };
            range.end.setHours(23, 59, 59, 999);
        } else {
            range = getDateRange(period);
        }

        const match = { createdAt: { $gte: range.start, $lte: range.end } };

        const [statusBreakdown, paymentBreakdown, dailyTrend] = await Promise.all([
            Order.aggregate([
                { $match: match },
                { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
                { $sort: { count: -1 } }
            ]),
            Order.aggregate([
                { $match: match },
                { $group: { _id: '$paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
                { $sort: { revenue: -1 } }
            ]),
            Order.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        orders: { $sum: 1 },
                        revenue: { $sum: '$total' }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        const totalOrders = statusBreakdown.reduce((s, x) => s + x.count, 0);
        const totalRevenue = statusBreakdown.reduce((s, x) => s + x.revenue, 0);

        res.json({
            success: true,
            totalOrders,
            totalRevenue,
            statusBreakdown,
            paymentBreakdown,
            dailyTrend
        });
    } catch (err) {
        console.error('Order analytics error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ══════════════════════════════════════════
//  DASHBOARD SUMMARY (all cards)
// ══════════════════════════════════════════
router.get('/dashboard-summary', verifyToken, requireRole(...ANALYTICS_ROLES), async (req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
        const monthStart = new Date(now); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
        const prevMonthStart = new Date(monthStart); prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
        const prevMonthEnd = new Date(monthStart); prevMonthEnd.setMilliseconds(-1);

        const [
            totalRevenueAgg, todayRevenueAgg, monthRevenueAgg, prevMonthRevenueAgg,
            totalOrders, pendingOrders, deliveredOrders, cancelledOrders,
            totalCustomersAgg, repeatCustomersAgg,
            topProductAgg
        ] = await Promise.all([
            Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
            Order.aggregate([
                { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
                { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: monthStart } } },
                { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),
            Order.countDocuments({}),
            Order.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
            Order.countDocuments({ status: 'delivered' }),
            Order.countDocuments({ status: 'cancelled' }),
            Order.aggregate([{ $group: { _id: '$customer.phone' } }, { $count: 'total' }]),
            Order.aggregate([
                { $group: { _id: '$customer.phone', cnt: { $sum: 1 } } },
                { $match: { cnt: { $gt: 1 } } },
                { $count: 'total' }
            ]),
            Order.aggregate([
                { $unwind: '$items' },
                { $group: { _id: '$items.name', emoji: { $first: '$items.e' }, qty: { $sum: '$items.qty' }, rev: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
                { $sort: { rev: -1 } },
                { $limit: 1 }
            ])
        ]);

        const totalRevenue = (totalRevenueAgg[0] || {}).total || 0;
        const todayRevenue = (todayRevenueAgg[0] || {}).total || 0;
        const monthRevenue = (monthRevenueAgg[0] || {}).total || 0;
        const prevMonthRevenue = (prevMonthRevenueAgg[0] || {}).total || 0;
        const monthGrowth = prevMonthRevenue > 0
            ? (((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100).toFixed(1)
            : monthRevenue > 0 ? 100 : 0;

        const totalCust = (totalCustomersAgg[0] || {}).total || 0;
        const repeatCust = (repeatCustomersAgg[0] || {}).total || 0;
        const bestProduct = topProductAgg[0] || null;

        // Expenses for profit
        const expenseAgg = await Expense.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalExpenses = (expenseAgg[0] || {}).total || 0;
        const netProfit = totalRevenue - totalExpenses;

        // Inventory value
        const products = await Product.find({});
        const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

        res.json({
            success: true,
            totalRevenue,
            todayRevenue,
            monthRevenue,
            netProfit,
            totalExpenses,
            monthGrowth: parseFloat(monthGrowth),
            totalOrders,
            pendingOrders,
            deliveredOrders,
            cancelledOrders,
            todayOrders: (todayRevenueAgg[0] || {}).count || 0,
            totalCustomers: totalCust,
            repeatCustomers: repeatCust,
            bestProduct: bestProduct ? { name: bestProduct._id, emoji: bestProduct.emoji, qty: bestProduct.qty, revenue: bestProduct.rev } : null,
            inventoryValue
        });
    } catch (err) {
        console.error('Dashboard summary error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ══════════════════════════════════════════
//  EXPENSE ANALYTICS
// ══════════════════════════════════════════
router.get('/expenses', verifyToken, requireRole(...ANALYTICS_ROLES), async (req, res) => {
    try {
        const { period = '30d', from, to } = req.query;
        let range;
        if (from && to) {
            range = { start: new Date(from), end: new Date(to) };
            range.end.setHours(23, 59, 59, 999);
        } else {
            range = getDateRange(period);
        }

        const match = { date: { $gte: range.start, $lte: range.end } };

        const [byCategory, byMonth, total] = await Promise.all([
            Expense.aggregate([
                { $match: match },
                { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
                { $sort: { total: -1 } }
            ]),
            Expense.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
                        total: { $sum: '$amount' }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Expense.aggregate([
                { $match: match },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        res.json({
            success: true,
            totalExpenses: (total[0] || {}).total || 0,
            byCategory,
            byMonth
        });
    } catch (err) {
        console.error('Expense analytics error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
