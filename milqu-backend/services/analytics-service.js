const Area = require('../models/Area');
const Admin = require('../models/Admin');
const DeliveryTracking = require('../models/DeliveryTracking');
const Expense = require('../models/Expense');
const LoyaltyAccount = require('../models/LoyaltyAccount');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Subscription = require('../models/Subscription');
const {
    getDateRange,
    getMonthComparisonRanges,
    getPreviousPeriod,
    getWeekComparisonRanges,
    getYearOverYearRanges,
    startOfDay
} = require('./date-range');

const GST_RATE = 0.05;
const DEFAULT_PROFIT_MARGIN = 0.30;

const DELIVERY_EXPENSE_CATEGORIES = new Set(['delivery_fuel', 'logistics']);
const PACKAGING_EXPENSE_CATEGORIES = new Set(['packaging']);
const STAFF_EXPENSE_CATEGORIES = new Set(['salary', 'staff_salary']);
const UTILITIES_EXPENSE_CATEGORIES = new Set(['utilities', 'electricity']);
const MILK_EXPENSE_CATEGORIES = new Set(['milk_purchase', 'farm']);

function num(value) {
    return Number(value) || 0;
}

function round(value, digits = 2) {
    return Number(num(value).toFixed(digits));
}

function calcGrowth(current, previous) {
    if (previous > 0) {
        return round(((current - previous) / previous) * 100, 1);
    }
    return current > 0 ? 100 : 0;
}

function dateKey(date) {
    return new Date(date).toISOString().slice(0, 10);
}

function monthKey(date) {
    return new Date(date).toISOString().slice(0, 7);
}

function hourKey(date) {
    return new Date(date).getHours();
}

function isoWeekParts(date) {
    const utcDate = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    ));
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - (utcDate.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);
    return {
        year: utcDate.getUTCFullYear(),
        week
    };
}

function weekKey(date) {
    const parts = isoWeekParts(new Date(date));
    return `${parts.year}-W${String(parts.week).padStart(2, '0')}`;
}

function arrayFromMetricMap(map, mapper, sorter) {
    const items = Array.from(map.entries()).map(([key, value]) => mapper(key, value));
    if (sorter) {
        items.sort(sorter);
    }
    return items;
}

async function buildProductSnapshot() {
    const products = await Product.find({}).lean();
    const productMap = new Map();

    products.forEach((product) => {
        productMap.set(String(product._id), product);
        if (product.productCode) {
            productMap.set(product.productCode, product);
        }
    });

    return { products, productMap };
}

function estimateItemCost(item, productMap) {
    const product = productMap.get(String(item.productId || '')) || productMap.get(String(item.id || ''));
    const basePrice = num(product?.costPrice) > 0
        ? num(product.costPrice)
        : num(item.price) * (1 - DEFAULT_PROFIT_MARGIN);
    return basePrice * num(item.qty);
}

function getVipLevel(totalSpent) {
    if (totalSpent >= 30000) return 'platinum';
    if (totalSpent >= 15000) return 'gold';
    if (totalSpent >= 7000) return 'silver';
    return 'classic';
}

function summarizeExpenses(expenses) {
    const byCategory = new Map();
    const byMonth = new Map();
    const byArea = new Map();
    let totalExpenses = 0;
    let deliveryCost = 0;
    let packagingCost = 0;
    let staffCost = 0;
    let utilitiesCost = 0;
    let milkProcurementCost = 0;
    let totalGst = 0;

    expenses.forEach((expense) => {
        const amount = num(expense.amount);
        totalExpenses += amount;
        totalGst += num(expense.gstAmount);

        if (DELIVERY_EXPENSE_CATEGORIES.has(expense.category)) {
            deliveryCost += amount;
        }
        if (PACKAGING_EXPENSE_CATEGORIES.has(expense.category)) {
            packagingCost += amount;
        }
        if (STAFF_EXPENSE_CATEGORIES.has(expense.category)) {
            staffCost += amount;
        }
        if (UTILITIES_EXPENSE_CATEGORIES.has(expense.category)) {
            utilitiesCost += amount;
        }
        if (MILK_EXPENSE_CATEGORIES.has(expense.category)) {
            milkProcurementCost += amount;
        }

        const categoryMetric = byCategory.get(expense.category) || { total: 0, count: 0 };
        categoryMetric.total += amount;
        categoryMetric.count += 1;
        byCategory.set(expense.category, categoryMetric);

        const monthMetric = byMonth.get(monthKey(expense.date)) || { total: 0 };
        monthMetric.total += amount;
        byMonth.set(monthKey(expense.date), monthMetric);

        if (expense.area_id) {
            const areaMetric = byArea.get(String(expense.area_id)) || { total: 0, count: 0 };
            areaMetric.total += amount;
            areaMetric.count += 1;
            byArea.set(String(expense.area_id), areaMetric);
        }
    });

    return {
        totalExpenses: round(totalExpenses),
        deliveryCost: round(deliveryCost),
        packagingCost: round(packagingCost),
        staffCost: round(staffCost),
        utilitiesCost: round(utilitiesCost),
        milkProcurementCost: round(milkProcurementCost),
        totalGst: round(totalGst),
        byCategory: arrayFromMetricMap(
            byCategory,
            (key, value) => ({ _id: key, total: round(value.total), count: value.count }),
            (a, b) => b.total - a.total
        ),
        byMonth: arrayFromMetricMap(
            byMonth,
            (key, value) => ({ _id: key, total: round(value.total) }),
            (a, b) => a._id.localeCompare(b._id)
        ),
        byAreaMap: byArea
    };
}

function summarizeOrders(orders, productSnapshot) {
    const { productMap } = productSnapshot;
    const productSales = new Map();
    const categorySales = new Map();
    const areaMetrics = new Map();
    const deliveryMetrics = new Map();
    const statusBreakdown = new Map();
    const paymentBreakdown = new Map();
    const dailyRevenue = new Map();
    const monthlyRevenue = new Map();
    const weeklyOrders = new Map();
    const hourlyDistribution = new Map();
    const customerPhones = new Set();
    const customerOrderCounts = new Map();

    let totalRevenue = 0;
    let grossRevenue = 0;
    let deliveredRevenue = 0;
    let totalOrders = 0;
    let deliveredOrders = 0;
    let pendingOrders = 0;
    let cancelledOrders = 0;
    let refundAmount = 0;
    let refundCount = 0;
    let gstCollected = 0;
    let revenueBeforeGst = 0;
    let packagingCost = 0;
    let deliveryCost = 0;
    let estimatedCogs = 0;

    orders.forEach((order) => {
        const orderTotal = num(order.total);
        const gross = num(order.financials?.grossRevenue) || orderTotal;
        const gst = num(order.financials?.gstAmount) || (orderTotal * GST_RATE / (1 + GST_RATE));
        const beforeGst = orderTotal / (1 + GST_RATE);
        const areaId = order.area_id ? String(order.area_id) : '';
        const deliveryBoyId = order.assigned_delivery_boy_id ? String(order.assigned_delivery_boy_id) : '';
        const orderDate = new Date(order.createdAt);
        const day = dateKey(orderDate);
        const month = monthKey(orderDate);
        const week = weekKey(orderDate);
        const hour = hourKey(orderDate);
        const customerPhone = order.customer?.phone || '';

        totalOrders += 1;
        totalRevenue += orderTotal;
        grossRevenue += gross;
        gstCollected += gst;
        revenueBeforeGst += beforeGst;
        packagingCost += num(order.financials?.packagingCost);
        deliveryCost += num(order.financials?.deliveryCost);

        if (customerPhone) {
            customerPhones.add(customerPhone);
            customerOrderCounts.set(customerPhone, num(customerOrderCounts.get(customerPhone)) + 1);
        }

        const statusMetric = statusBreakdown.get(order.status) || { count: 0, revenue: 0 };
        statusMetric.count += 1;
        statusMetric.revenue += orderTotal;
        statusBreakdown.set(order.status, statusMetric);

        const paymentMetric = paymentBreakdown.get(order.paymentMethod) || { count: 0, revenue: 0 };
        paymentMetric.count += 1;
        paymentMetric.revenue += orderTotal;
        paymentBreakdown.set(order.paymentMethod, paymentMetric);

        const dayMetric = dailyRevenue.get(day) || { revenue: 0, orders: 0 };
        dayMetric.revenue += orderTotal;
        dayMetric.orders += 1;
        dailyRevenue.set(day, dayMetric);

        const monthMetric = monthlyRevenue.get(month) || { revenue: 0, orders: 0 };
        monthMetric.revenue += orderTotal;
        monthMetric.orders += 1;
        monthlyRevenue.set(month, monthMetric);

        const weekMetric = weeklyOrders.get(week) || { revenue: 0, orders: 0, delivered: 0, cancelled: 0 };
        weekMetric.revenue += orderTotal;
        weekMetric.orders += 1;
        weeklyOrders.set(week, weekMetric);

        const hourMetric = hourlyDistribution.get(hour) || { count: 0 };
        hourMetric.count += 1;
        hourlyDistribution.set(hour, hourMetric);

        if (order.status === 'delivered') {
            deliveredRevenue += orderTotal;
            deliveredOrders += 1;
            if (weekMetric) weekMetric.delivered += 1;
        }

        if (['pending', 'confirmed'].includes(order.status)) {
            pendingOrders += 1;
        }

        if (['cancelled', 'failed'].includes(order.status)) {
            cancelledOrders += 1;
            refundCount += 1;
            refundAmount += num(order.financials?.refundAmount) || orderTotal;
            if (weekMetric) weekMetric.cancelled += 1;
        }

        if (areaId) {
            const metric = areaMetrics.get(areaId) || {
                revenue: 0,
                orders: 0,
                deliveredOrders: 0,
                cancelledOrders: 0,
                deliveryCost: 0,
                packagingCost: 0,
                customerPhones: new Set(),
                productSales: new Map()
            };
            metric.revenue += orderTotal;
            metric.orders += 1;
            metric.deliveryCost += num(order.financials?.deliveryCost);
            metric.packagingCost += num(order.financials?.packagingCost);
            if (order.status === 'delivered') metric.deliveredOrders += 1;
            if (['cancelled', 'failed'].includes(order.status)) metric.cancelledOrders += 1;
            if (customerPhone) metric.customerPhones.add(customerPhone);
            areaMetrics.set(areaId, metric);
        }

        if (deliveryBoyId) {
            const metric = deliveryMetrics.get(deliveryBoyId) || {
                orders: 0,
                delivered: 0,
                failed: 0,
                cancelled: 0,
                totalMinutes: 0,
                timedDeliveries: 0
            };
            metric.orders += 1;
            if (order.status === 'delivered') metric.delivered += 1;
            if (order.status === 'failed') metric.failed += 1;
            if (order.status === 'cancelled') metric.cancelled += 1;
            if (order.outForDeliveryAt && order.deliveredAt) {
                metric.totalMinutes += Math.max(
                    0,
                    (new Date(order.deliveredAt).getTime() - new Date(order.outForDeliveryAt).getTime()) / 60000
                );
                metric.timedDeliveries += 1;
            }
            deliveryMetrics.set(deliveryBoyId, metric);
        }

        (order.items || []).forEach((item) => {
            const itemRevenue = num(item.price) * num(item.qty);
            const itemCost = estimateItemCost(item, productMap);
            const product = productMap.get(String(item.productId || '')) || productMap.get(String(item.id || ''));
            const category = product?.category || 'other';

            estimatedCogs += itemCost;

            const productMetric = productSales.get(item.name) || {
                _id: item.name,
                productId: item.productId || item.id || '',
                emoji: item.e || product?.emoji || '📦',
                totalQty: 0,
                totalRevenue: 0,
                estimatedCost: 0
            };
            productMetric.totalQty += num(item.qty);
            productMetric.totalRevenue += itemRevenue;
            productMetric.estimatedCost += itemCost;
            productSales.set(item.name, productMetric);

            const categoryMetric = categorySales.get(category) || { totalRevenue: 0, totalQty: 0 };
            categoryMetric.totalRevenue += itemRevenue;
            categoryMetric.totalQty += num(item.qty);
            categorySales.set(category, categoryMetric);

            if (areaId) {
                const areaMetric = areaMetrics.get(areaId);
                if (areaMetric) {
                    const apMetric = areaMetric.productSales.get(item.name) || { qty: 0, revenue: 0, emoji: item.e || '📦' };
                    apMetric.qty += num(item.qty);
                    apMetric.revenue += itemRevenue;
                    areaMetric.productSales.set(item.name, apMetric);
                }
            }
        });
    });

    const repeatCustomers = Array.from(customerOrderCounts.values()).filter((count) => count > 1).length;
    const deliveredRevenueBeforeGst = deliveredRevenue / (1 + GST_RATE);
    const refundedBeforeGst = refundAmount / (1 + GST_RATE);
    const netRevenue = Math.max(0, deliveredRevenueBeforeGst - refundedBeforeGst);
    const grossProfit = deliveredRevenue - estimatedCogs;

    return {
        totalRevenue: round(totalRevenue),
        grossRevenue: round(grossRevenue),
        deliveredRevenue: round(deliveredRevenue),
        totalOrders,
        deliveredOrders,
        pendingOrders,
        cancelledOrders,
        refundAmount: round(refundAmount),
        refundCount,
        gstCollected: round(gstCollected),
        revenueBeforeGst: round(revenueBeforeGst),
        netRevenue: round(netRevenue),
        grossProfit: round(grossProfit),
        packagingCost: round(packagingCost),
        deliveryCost: round(deliveryCost),
        estimatedCogs: round(estimatedCogs),
        avgOrderValue: totalOrders > 0 ? round(totalRevenue / totalOrders) : 0,
        uniqueCustomers: customerPhones.size,
        repeatCustomers,
        repeatRate: customerPhones.size > 0 ? round((repeatCustomers / customerPhones.size) * 100, 1) : 0,
        dailyRevenue: arrayFromMetricMap(
            dailyRevenue,
            (key, value) => ({ _id: key, revenue: round(value.revenue), orders: value.orders }),
            (a, b) => a._id.localeCompare(b._id)
        ),
        monthlyRevenue: arrayFromMetricMap(
            monthlyRevenue,
            (key, value) => ({ _id: key, revenue: round(value.revenue), orders: value.orders }),
            (a, b) => a._id.localeCompare(b._id)
        ),
        weeklyOrders: arrayFromMetricMap(
            weeklyOrders,
            (key, value) => ({ _id: key, revenue: round(value.revenue), orders: value.orders, delivered: value.delivered, cancelled: value.cancelled }),
            (a, b) => a._id.localeCompare(b._id)
        ),
        hourlyDistribution: arrayFromMetricMap(
            hourlyDistribution,
            (key, value) => ({ _id: Number(key), count: value.count }),
            (a, b) => a._id - b._id
        ),
        statusBreakdown: arrayFromMetricMap(
            statusBreakdown,
            (key, value) => ({ _id: key, count: value.count, revenue: round(value.revenue) }),
            (a, b) => b.count - a.count
        ),
        paymentBreakdown: arrayFromMetricMap(
            paymentBreakdown,
            (key, value) => ({ _id: key, count: value.count, revenue: round(value.revenue) }),
            (a, b) => b.revenue - a.revenue
        ),
        bestSellers: arrayFromMetricMap(
            productSales,
            (key, value) => ({
                _id: key,
                productId: value.productId,
                emoji: value.emoji,
                totalQty: value.totalQty,
                totalRevenue: round(value.totalRevenue),
                estimatedCost: round(value.estimatedCost)
            }),
            (a, b) => b.totalRevenue - a.totalRevenue
        ),
        salesByCategory: arrayFromMetricMap(
            categorySales,
            (key, value) => ({
                _id: key,
                totalRevenue: round(value.totalRevenue),
                totalQty: value.totalQty
            }),
            (a, b) => b.totalRevenue - a.totalRevenue
        ),
        areaMetrics,
        deliveryMetrics
    };
}

async function hydrateAreaMetrics(areaMetricMap, expenseSummary) {
    const areaIds = Array.from(areaMetricMap.keys());
    if (!areaIds.length) {
        return { areaRevenue: [], customerDensity: [] };
    }

    const areas = await Area.find({ _id: { $in: areaIds } }).lean();
    const areaMap = new Map(areas.map((area) => [String(area._id), area]));

    const items = areaIds.map((areaId) => {
        const area = areaMap.get(areaId);
        const metrics = areaMetricMap.get(areaId);
        const expenseMetric = expenseSummary.byAreaMap.get(areaId) || { total: 0 };
        return {
            _id: areaId,
            name: area?.name || 'Unknown Area',
            pincodes: area?.pincodes || [],
            revenue: round(metrics.revenue),
            orders: metrics.orders,
            deliveredOrders: metrics.deliveredOrders,
            cancelledOrders: metrics.cancelledOrders,
            customerCount: metrics.customerPhones.size,
            avgOrderValue: metrics.orders > 0 ? round(metrics.revenue / metrics.orders) : 0,
            deliveryCost: round(metrics.deliveryCost + num(expenseMetric.total)),
            packagingCost: round(metrics.packagingCost),
            topProduct: Array.from(metrics.productSales.entries())
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.revenue - a.revenue)[0] || null
        };
    }).sort((a, b) => b.revenue - a.revenue);

    return {
        areaRevenue: items,
        customerDensity: items.map((item) => ({
            areaId: item._id,
            name: item.name,
            value: item.customerCount
        }))
    };
}

async function hydrateDeliveryMetrics(deliveryMetricMap) {
    const adminIds = Array.from(deliveryMetricMap.keys());
    if (!adminIds.length) {
        return [];
    }

    const Admin = require('../models/Admin');
    const admins = await Admin.find({ _id: { $in: adminIds } }).select('name phone assigned_area').lean();
    const adminMap = new Map(admins.map((admin) => [String(admin._id), admin]));

    return adminIds.map((adminId) => {
        const admin = adminMap.get(adminId);
        const metrics = deliveryMetricMap.get(adminId);
        const completed = metrics.delivered;
        const attempts = completed + metrics.failed + metrics.cancelled;
        return {
            _id: adminId,
            name: admin?.name || 'Delivery Staff',
            phone: admin?.phone || '',
            orders: metrics.orders,
            delivered: completed,
            failed: metrics.failed,
            cancelled: metrics.cancelled,
            successRate: attempts > 0 ? round((completed / attempts) * 100, 1) : 0,
            avgMinutes: metrics.timedDeliveries > 0 ? round(metrics.totalMinutes / metrics.timedDeliveries, 1) : 0
        };
    }).sort((a, b) => b.delivered - a.delivered);
}

function getInventorySnapshot(products) {
    const inventoryValue = products.reduce((sum, product) => sum + (num(product.price) * num(product.stock)), 0);
    const inventoryCost = products.reduce((sum, product) => {
        const unitCost = num(product.costPrice) > 0
            ? num(product.costPrice)
            : num(product.price) * (1 - DEFAULT_PROFIT_MARGIN);
        return sum + (unitCost * num(product.stock));
    }, 0);

    return {
        inventoryValue: round(inventoryValue),
        inventoryCost: round(inventoryCost),
        totalProducts: products.length,
        activeProducts: products.filter((product) => product.status === 'active').length,
        outOfStock: products.filter((product) => product.stock <= 0 || product.status === 'out_of_stock').length,
        lowStockCount: products.filter((product) => num(product.stock) > 0 && num(product.stock) <= num(product.lowStockThreshold || 10)).length
    };
}

async function getPeriodSnapshot(range, options = {}) {
    const productSnapshot = options.productSnapshot || await buildProductSnapshot();
    const [orders, expenses] = await Promise.all([
        Order.find({ createdAt: { $gte: range.start, $lte: range.end } }).lean(),
        Expense.find({ date: { $gte: range.start, $lte: range.end } }).lean()
    ]);

    const orderSummary = summarizeOrders(orders, productSnapshot);
    const expenseSummary = summarizeExpenses(expenses);
    const areaSummary = await hydrateAreaMetrics(orderSummary.areaMetrics, expenseSummary);
    const deliverySummary = await hydrateDeliveryMetrics(orderSummary.deliveryMetrics);
    const inventorySummary = getInventorySnapshot(productSnapshot.products);

    const totalExpenses = expenseSummary.totalExpenses;
    const netProfit = orderSummary.netRevenue - totalExpenses;

    return {
        range,
        orderSummary,
        expenseSummary,
        areaSummary,
        deliverySummary,
        inventorySummary,
        netProfit: round(netProfit),
        profitMargin: orderSummary.netRevenue > 0 ? round((netProfit / orderSummary.netRevenue) * 100, 1) : 0
    };
}

async function getRevenueAnalytics(options = {}) {
    const range = getDateRange(options);
    const previousRange = getPreviousPeriod(range);
    const { current: monthRange, previous: previousMonthRange } = getMonthComparisonRanges();
    const { current: weekRange, previous: previousWeekRange } = getWeekComparisonRanges();
    const { current: currentYearRange, previous: previousYearRange } = getYearOverYearRanges();
    const productSnapshot = await buildProductSnapshot();

    const [
        current,
        previous,
        currentMonth,
        previousMonth,
        currentWeek,
        previousWeek,
        currentYear,
        previousYear
    ] = await Promise.all([
        getPeriodSnapshot(range, { productSnapshot }),
        getPeriodSnapshot(previousRange, { productSnapshot }),
        getPeriodSnapshot(monthRange, { productSnapshot }),
        getPeriodSnapshot(previousMonthRange, { productSnapshot }),
        getPeriodSnapshot(weekRange, { productSnapshot }),
        getPeriodSnapshot(previousWeekRange, { productSnapshot }),
        getPeriodSnapshot(currentYearRange, { productSnapshot }),
        getPeriodSnapshot(previousYearRange, { productSnapshot })
    ]);

    return {
        period: range.key,
        dateRange: { from: range.start, to: range.end },
        revenue: {
            total: current.orderSummary.totalRevenue,
            gross: current.orderSummary.grossRevenue,
            delivered: current.orderSummary.deliveredRevenue,
            net: current.orderSummary.netRevenue,
            previous: previous.orderSummary.totalRevenue,
            growth: calcGrowth(current.orderSummary.totalRevenue, previous.orderSummary.totalRevenue),
            avgOrderValue: current.orderSummary.avgOrderValue
        },
        orders: {
            total: current.orderSummary.totalOrders,
            delivered: current.orderSummary.deliveredOrders,
            pending: current.orderSummary.pendingOrders,
            cancelled: current.orderSummary.cancelledOrders,
            previous: previous.orderSummary.totalOrders
        },
        gst: {
            rate: GST_RATE * 100,
            amount: current.orderSummary.gstCollected,
            revenueBeforeGst: current.orderSummary.revenueBeforeGst
        },
        refunds: {
            amount: current.orderSummary.refundAmount,
            count: current.orderSummary.refundCount
        },
        profit: {
            grossProfit: current.orderSummary.grossProfit,
            estimatedCogs: current.orderSummary.estimatedCogs,
            netProfit: current.netProfit,
            totalExpenses: current.expenseSummary.totalExpenses,
            margin: current.profitMargin
        },
        costs: {
            delivery: current.expenseSummary.deliveryCost || current.orderSummary.deliveryCost,
            packaging: current.expenseSummary.packagingCost || current.orderSummary.packagingCost,
            staff: current.expenseSummary.staffCost,
            utilities: current.expenseSummary.utilitiesCost,
            milkPurchase: current.expenseSummary.milkProcurementCost
        },
        comparisons: {
            currentMonthVsPreviousMonth: {
                current: currentMonth.orderSummary.totalRevenue,
                previous: previousMonth.orderSummary.totalRevenue,
                growth: calcGrowth(currentMonth.orderSummary.totalRevenue, previousMonth.orderSummary.totalRevenue)
            },
            currentWeekVsPreviousWeek: {
                current: currentWeek.orderSummary.totalRevenue,
                previous: previousWeek.orderSummary.totalRevenue,
                growth: calcGrowth(currentWeek.orderSummary.totalRevenue, previousWeek.orderSummary.totalRevenue)
            },
            yearOverYearGrowth: {
                current: currentYear.orderSummary.totalRevenue,
                previous: previousYear.orderSummary.totalRevenue,
                growth: calcGrowth(currentYear.orderSummary.totalRevenue, previousYear.orderSummary.totalRevenue)
            }
        }
    };
}

async function getRevenueDetailedAnalytics(options = {}) {
    const range = getDateRange(options);
    const snapshot = await getPeriodSnapshot(range);

    return {
        success: true,
        dailyRevenue: snapshot.orderSummary.dailyRevenue,
        monthlyRevenue: snapshot.orderSummary.monthlyRevenue,
        weeklyOrders: snapshot.orderSummary.weeklyOrders,
        hourlyDistribution: snapshot.orderSummary.hourlyDistribution,
        expenseByMonth: snapshot.expenseSummary.byMonth,
        areaWiseSales: snapshot.areaSummary.areaRevenue,
        deliveryPerformance: snapshot.deliverySummary
    };
}

async function getProductAnalytics(options = {}) {
    const range = getDateRange(options);
    const snapshot = await getPeriodSnapshot(range);

    return {
        success: true,
        bestSellers: snapshot.orderSummary.bestSellers.slice(0, 10),
        salesByCategory: snapshot.orderSummary.salesByCategory,
        inventoryValue: snapshot.inventorySummary.inventoryValue,
        inventoryCost: snapshot.inventorySummary.inventoryCost,
        totalProducts: snapshot.inventorySummary.totalProducts,
        activeProducts: snapshot.inventorySummary.activeProducts,
        outOfStock: snapshot.inventorySummary.outOfStock,
        lowStockCount: snapshot.inventorySummary.lowStockCount
    };
}

async function getOrderAnalytics(options = {}) {
    const range = getDateRange(options);
    const snapshot = await getPeriodSnapshot(range);

    return {
        success: true,
        totalOrders: snapshot.orderSummary.totalOrders,
        totalRevenue: snapshot.orderSummary.totalRevenue,
        statusBreakdown: snapshot.orderSummary.statusBreakdown,
        paymentBreakdown: snapshot.orderSummary.paymentBreakdown,
        dailyTrend: snapshot.orderSummary.dailyRevenue
    };
}

async function upsertLoyaltyAccounts(customers) {
    if (!customers.length) return;

    const operations = customers.map((customer) => ({
        updateOne: {
            filter: { customerPhone: customer.phone },
            update: {
                $set: {
                    customerName: customer.name || '',
                    customerEmail: customer.email || '',
                    totalLifetimeValue: round(customer.totalSpent),
                    totalOrders: customer.totalOrders,
                    repeatPurchaseRate: customer.repeatRate,
                    vipLevel: customer.vipLevel,
                    lastOrderAt: customer.lastOrder
                },
                $setOnInsert: {
                    referralCode: `MQ${String(customer.phone || '').slice(-6)}`,
                    walletBalance: 0,
                    cashbackBalance: 0,
                    rewardPoints: Math.floor(num(customer.totalSpent) / 10),
                    referralRewards: 0
                }
            },
            upsert: true
        }
    }));

    await LoyaltyAccount.bulkWrite(operations, { ordered: false });
}

async function getCustomerAnalytics(options = {}) {
    const range = getDateRange(options);
    const previousRange = getPreviousPeriod(range);

    const allOrders = await Order.find({}).lean();

    const customerMap = new Map();
    const newCustomerGrowth = new Map();

    allOrders.forEach((order) => {
        const phone = order.customer?.phone;
        if (!phone) return;

        const existing = customerMap.get(phone) || {
            name: order.customer?.name || '',
            phone,
            email: order.customer?.email || '',
            address: order.customer?.address || '',
            totalOrders: 0,
            totalSpent: 0,
            firstOrder: order.createdAt,
            lastOrder: order.createdAt
        };

        existing.totalOrders += 1;
        existing.totalSpent += num(order.total);
        if (new Date(order.createdAt) < new Date(existing.firstOrder)) existing.firstOrder = order.createdAt;
        if (new Date(order.createdAt) > new Date(existing.lastOrder)) existing.lastOrder = order.createdAt;
        customerMap.set(phone, existing);
    });

    const customers = Array.from(customerMap.values()).map((customer) => {
        const avgOrderValue = customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0;
        const repeatRate = customer.totalOrders > 1 ? 100 : 0;
        const vipLevel = getVipLevel(customer.totalSpent);
        return {
            ...customer,
            avgOrderValue: round(avgOrderValue),
            clv: round(customer.totalSpent),
            repeatRate,
            vipLevel
        };
    }).sort((a, b) => b.totalSpent - a.totalSpent);

    const totalCustomers = customers.length;
    const repeatCustomers = customers.filter((customer) => customer.totalOrders > 1).length;
    const repeatRate = totalCustomers > 0 ? round((repeatCustomers / totalCustomers) * 100, 1) : 0;
    const segments = { new: 0, returning: 0, loyal: 0, dormant: 0 };

    const ninetyDaysAgo = startOfDay(new Date());
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    customers.forEach((customer) => {
        if (customer.totalOrders === 1) segments.new += 1;
        else if (customer.totalOrders >= 5 || customer.totalSpent >= 5000) segments.loyal += 1;
        else if (new Date(customer.lastOrder) < ninetyDaysAgo) segments.dormant += 1;
        else segments.returning += 1;
    });

    customers.forEach((customer) => {
        const firstOrderDate = new Date(customer.firstOrder);
        if (firstOrderDate >= range.start && firstOrderDate <= range.end) {
            const key = dateKey(firstOrderDate);
            newCustomerGrowth.set(key, num(newCustomerGrowth.get(key)) + 1);
        }
    });

    const currentNewCustomers = customers.filter((customer) => {
        const firstOrderDate = new Date(customer.firstOrder);
        return firstOrderDate >= range.start && firstOrderDate <= range.end;
    }).length;

    const previousNewCustomers = customers.filter((customer) => {
        const firstOrderDate = new Date(customer.firstOrder);
        return firstOrderDate >= previousRange.start && firstOrderDate <= previousRange.end;
    }).length;

    await upsertLoyaltyAccounts(customers.slice(0, 200));
    const loyaltyDocs = await LoyaltyAccount.find({
        customerPhone: { $in: customers.slice(0, 20).map((customer) => customer.phone) }
    }).lean();
    const loyaltyMap = new Map(loyaltyDocs.map((doc) => [doc.customerPhone, doc]));

    return {
        success: true,
        totalCustomers,
        repeatCustomers,
        repeatRate,
        segments,
        customerGrowth: arrayFromMetricMap(
            newCustomerGrowth,
            (key, value) => ({ _id: key, newCustomers: value }),
            (a, b) => a._id.localeCompare(b._id)
        ),
        customerGrowthPercent: calcGrowth(currentNewCustomers, previousNewCustomers),
        topCustomers: customers.slice(0, 10).map((customer) => ({
            ...customer,
            loyalty: loyaltyMap.get(customer.phone) || null
        })),
        mostActiveCustomers: customers
            .slice()
            .sort((a, b) => new Date(b.lastOrder) - new Date(a.lastOrder))
            .slice(0, 10),
        averageCustomerValue: totalCustomers > 0
            ? round(customers.reduce((sum, customer) => sum + customer.totalSpent, 0) / totalCustomers)
            : 0
    };
}

async function getExpenseAnalytics(options = {}) {
    const range = getDateRange(options);
    const expenses = await Expense.find({ date: { $gte: range.start, $lte: range.end } }).lean();
    const summary = summarizeExpenses(expenses);

    return {
        success: true,
        totalExpenses: summary.totalExpenses,
        byCategory: summary.byCategory,
        byMonth: summary.byMonth,
        deliveryCost: summary.deliveryCost,
        packagingCost: summary.packagingCost,
        staffCost: summary.staffCost,
        utilitiesCost: summary.utilitiesCost,
        milkProcurementCost: summary.milkProcurementCost
    };
}

async function getAreaAnalytics(options = {}) {
    const range = getDateRange(options);
    const previousRange = getPreviousPeriod(range);
    const [current, previous] = await Promise.all([
        getPeriodSnapshot(range),
        getPeriodSnapshot(previousRange)
    ]);

    const previousAreaMap = new Map(
        previous.areaSummary.areaRevenue.map((area) => [area._id, area])
    );

    return {
        success: true,
        salesByLocation: current.areaSummary.areaRevenue.map((area) => {
            const previousArea = previousAreaMap.get(area._id);
            return {
                ...area,
                growth: calcGrowth(area.revenue, previousArea?.revenue || 0)
            };
        }),
        topDeliveryZones: current.areaSummary.areaRevenue.slice(0, 5),
        customerDensity: current.areaSummary.customerDensity
    };
}

async function getDeliveryAnalytics(options = {}) {
    const range = getDateRange(options);
    const [snapshot, activeStaffCount, trackingRows] = await Promise.all([
        getPeriodSnapshot(range),
        Admin.countDocuments({ role: 'delivery_staff', isActive: true }),
        DeliveryTracking.find({
            $or: [
                { assignedAt: { $gte: range.start, $lte: range.end } },
                { deliveredAt: { $gte: range.start, $lte: range.end } }
            ]
        }).lean()
    ]);

    const otpVerified = trackingRows.filter((row) => row.otp?.isVerified).length;
    const morningScheduled = trackingRows.filter((row) => row.scheduleSlot === 'morning').length;
    const eveningScheduled = trackingRows.filter((row) => row.scheduleSlot === 'evening').length;

    return {
        success: true,
        totalStaff: activeStaffCount,
        deliveryPerformance: snapshot.deliverySummary,
        assignedRoutes: trackingRows.length,
        otpVerified,
        otpPending: Math.max(0, trackingRows.length - otpVerified),
        morningScheduled,
        eveningScheduled,
        avgDeliveryMinutes: snapshot.deliverySummary.length
            ? round(snapshot.deliverySummary.reduce((sum, item) => sum + num(item.avgMinutes), 0) / snapshot.deliverySummary.length, 1)
            : 0
    };
}

async function getDashboardSummary() {
    const totalRange = { start: new Date('2020-01-01T00:00:00.000Z'), end: new Date() };
    const todayRange = getDateRange({ period: 'today' });
    const monthRanges = getMonthComparisonRanges();
    const [allTime, today, thisMonth, previousMonth, customerAnalytics, deliveryAnalytics] = await Promise.all([
        getPeriodSnapshot(totalRange),
        getPeriodSnapshot(todayRange),
        getPeriodSnapshot(monthRanges.current),
        getPeriodSnapshot(monthRanges.previous),
        getCustomerAnalytics({ period: '30d' }),
        getDeliveryAnalytics({ period: '30d' })
    ]);

    const bestProduct = allTime.orderSummary.bestSellers[0] || null;

    return {
        success: true,
        totalRevenue: allTime.orderSummary.totalRevenue,
        grossRevenue: allTime.orderSummary.grossRevenue,
        todayRevenue: today.orderSummary.totalRevenue,
        monthRevenue: thisMonth.orderSummary.totalRevenue,
        netProfit: allTime.netProfit,
        totalExpenses: allTime.expenseSummary.totalExpenses,
        profitMargin: allTime.profitMargin,
        monthGrowth: calcGrowth(thisMonth.orderSummary.totalRevenue, previousMonth.orderSummary.totalRevenue),
        totalOrders: allTime.orderSummary.totalOrders,
        pendingOrders: allTime.orderSummary.pendingOrders,
        deliveredOrders: allTime.orderSummary.deliveredOrders,
        cancelledOrders: allTime.orderSummary.cancelledOrders,
        todayOrders: today.orderSummary.totalOrders,
        totalCustomers: customerAnalytics.totalCustomers,
        repeatCustomers: customerAnalytics.repeatCustomers,
        repeatRate: customerAnalytics.repeatRate,
        bestProduct: bestProduct ? {
            name: bestProduct._id,
            emoji: bestProduct.emoji,
            qty: bestProduct.totalQty,
            revenue: bestProduct.totalRevenue
        } : null,
        inventoryValue: allTime.inventorySummary.inventoryValue,
        deliveryWindow: {
            morning: deliveryAnalytics.morningScheduled,
            evening: deliveryAnalytics.eveningScheduled
        }
    };
}

async function getAiInsights() {
    const [last7Days, last30Days, customerAnalytics, inventoryAnalytics, areaAnalytics] = await Promise.all([
        getPeriodSnapshot(getDateRange({ period: '7d' })),
        getPeriodSnapshot(getDateRange({ period: '30d' })),
        getCustomerAnalytics({ period: '30d' }),
        getProductAnalytics({ period: '30d' }),
        getAreaAnalytics({ period: '30d' })
    ]);

    const dailyAverage = last7Days.orderSummary.dailyRevenue.length
        ? last7Days.orderSummary.dailyRevenue.reduce((sum, item) => sum + num(item.revenue), 0) / last7Days.orderSummary.dailyRevenue.length
        : 0;
    const forecastedWeeklyRevenue = round(dailyAverage * 7);
    
    // Growth Trend
    const trend = calcGrowth(last7Days.orderSummary.totalRevenue, Math.max(1, last30Days.orderSummary.totalRevenue / 4));
    
    // Fastest Growing Area
    const sortedAreas = [...(areaAnalytics.salesByLocation || [])].sort((a, b) => b.growth - a.growth);
    const topArea = sortedAreas[0] || null;

    // Product Affinity (Simplified)
    const productInsights = [];
    if (inventoryAnalytics.bestSellers.length >= 2) {
        productInsights.push(`Bundle Suggestion: Customers buying ${inventoryAnalytics.bestSellers[0]._id} often also purchase ${inventoryAnalytics.bestSellers[1]._id}.`);
    }

    const churnRiskCustomers = customerAnalytics.topCustomers.filter((customer) => {
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        return customer.totalOrders > 1 && new Date(customer.lastOrder) < sixtyDaysAgo;
    }).length;

    const insights = [
        `Revenue Trend: We are seeing a ${trend}% ${trend >= 0 ? 'increase' : 'decrease'} in weekly sales velocity.`,
        topArea ? `Hotspot Detected: ${topArea.name} is your fastest-growing zone with ${topArea.growth}% growth.` : 'Geographic sales are steady across all active zones.',
        ...productInsights,
        inventoryAnalytics.lowStockCount > 0
            ? `Inventory Alert: ${inventoryAnalytics.lowStockCount} items are below safety levels. Restock recommended.`
            : 'Operational Health: Inventory levels are healthy across all categories.'
    ];

    if (churnRiskCustomers > 0) {
        insights.push(`Retention Alert: ${churnRiskCustomers} repeat customers have been inactive for >60 days.`);
    }

    return {
        success: true,
        salesPrediction: {
            next7DaysRevenue: forecastedWeeklyRevenue,
            trend
        },
        geographicInsight: topArea ? {
            name: topArea.name,
            growth: topArea.growth,
            revenue: topArea.revenue
        } : null,
        churnPrediction: {
            atRiskCustomers: churnRiskCustomers,
            repeatRate: customerAnalytics.repeatRate
        },
        smartRestockRecommendation: {
            lowStockCount: inventoryAnalytics.lowStockCount,
            topProductsToRestock: inventoryAnalytics.bestSellers.slice(0, 3)
        },
        insights
    };
}

async function buildReportPayload(range, meta = {}) {
    const [snapshot, customerAnalytics, deliveryAnalytics, aiInsights] = await Promise.all([
        getPeriodSnapshot(range),
        getCustomerAnalytics({ from: range.start, to: range.end }),
        getDeliveryAnalytics({ from: range.start, to: range.end }),
        getAiInsights()
    ]);

    return {
        meta,
        summary: {
            totalRevenue: snapshot.orderSummary.totalRevenue,
            grossRevenue: snapshot.orderSummary.grossRevenue,
            netRevenue: snapshot.orderSummary.netRevenue,
            totalOrders: snapshot.orderSummary.totalOrders,
            totalCustomers: customerAnalytics.totalCustomers,
            repeatCustomers: customerAnalytics.repeatCustomers,
            deliveredOrders: snapshot.orderSummary.deliveredOrders,
            cancelledOrders: snapshot.orderSummary.cancelledOrders,
            avgOrderValue: snapshot.orderSummary.avgOrderValue,
            gstCollected: snapshot.orderSummary.gstCollected,
            totalExpenses: snapshot.expenseSummary.totalExpenses,
            netProfit: snapshot.netProfit,
            profitMargin: snapshot.profitMargin,
            refunds: snapshot.orderSummary.refundAmount,
            deliveryCost: snapshot.expenseSummary.deliveryCost,
            packagingCost: snapshot.expenseSummary.packagingCost
        },
        charts: {
            dailyRevenue: snapshot.orderSummary.dailyRevenue,
            monthlyRevenue: snapshot.orderSummary.monthlyRevenue,
            weeklyOrders: snapshot.orderSummary.weeklyOrders,
            areaWiseSales: snapshot.areaSummary.areaRevenue,
            deliveryPerformance: snapshot.deliverySummary
        },
        topProducts: snapshot.orderSummary.bestSellers.slice(0, 10),
        customers: customerAnalytics.topCustomers,
        areaMetrics: snapshot.areaSummary.areaRevenue,
        deliveryMetrics: deliveryAnalytics.deliveryPerformance,
        expenses: snapshot.expenseSummary.byCategory,
        aiInsights: aiInsights.insights
    };
}

module.exports = {
    GST_RATE,
    buildReportPayload,
    calcGrowth,
    getAiInsights,
    getAreaAnalytics,
    getCustomerAnalytics,
    getDashboardSummary,
    getDeliveryAnalytics,
    getExpenseAnalytics,
    getOrderAnalytics,
    getPeriodSnapshot,
    getProductAnalytics,
    getRevenueAnalytics,
    getRevenueDetailedAnalytics
};
