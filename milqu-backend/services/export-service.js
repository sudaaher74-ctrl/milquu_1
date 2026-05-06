const LoyaltyAccount = require('../models/LoyaltyAccount');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Subscription = require('../models/Subscription');
const {
    GST_RATE,
    getCustomerAnalytics,
    getExpenseAnalytics,
    getProductAnalytics,
    getRevenueAnalytics,
    getRevenueDetailedAnalytics
} = require('./analytics-service');

function buildDateFilter(from, to, field = 'createdAt') {
    const filter = {};
    if (from || to) {
        filter[field] = {};
        if (from) {
            filter[field].$gte = new Date(from);
        }
        if (to) {
            const end = new Date(to);
            end.setHours(23, 59, 59, 999);
            filter[field].$lte = end;
        }
    }
    return filter;
}

function formatGstAmount(total) {
    return Number((Number(total || 0) * GST_RATE / (1 + GST_RATE)).toFixed(2));
}

async function getOrdersExportData(query = {}) {
    const { from, to, status } = query;
    const filter = buildDateFilter(from, to);
    if (status) {
        filter.status = status;
    }

    const orders = await Order.find(filter)
        .populate('area_id', 'name')
        .populate('assigned_delivery_boy_id', 'name phone')
        .sort({ createdAt: -1 })
        .limit(5000)
        .lean();

    const rows = orders.map((order) => ({
        orderId: order.orderId,
        customerName: order.customer?.name || '',
        phone: order.customer?.phone || '',
        email: order.customer?.email || '',
        address: order.customer?.address || '',
        area: order.area_id?.name || '',
        deliveryPartner: order.assigned_delivery_boy_id?.name || '',
        items: (order.items || []).map((item) => `${item.name} x${item.qty}`).join(', '),
        itemCount: (order.items || []).length,
        subtotal: order.financials?.subtotal || order.total,
        total: order.total,
        gst: order.financials?.gstAmount || formatGstAmount(order.total),
        packagingCost: order.financials?.packagingCost || 0,
        deliveryCost: order.financials?.deliveryCost || 0,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
        deliveryWindow: order.deliveryWindow || '',
        createdAt: order.createdAt
    }));

    return {
        success: true,
        total: rows.length,
        summary: {
            totalOrders: rows.length,
            totalRevenue: rows.reduce((sum, row) => sum + Number(row.total || 0), 0),
            totalGST: rows.reduce((sum, row) => sum + Number(row.gst || 0), 0),
            deliveryCost: rows.reduce((sum, row) => sum + Number(row.deliveryCost || 0), 0),
            packagingCost: rows.reduce((sum, row) => sum + Number(row.packagingCost || 0), 0)
        },
        rows
    };
}

async function getRevenueExportData(query = {}) {
    const detail = await getRevenueDetailedAnalytics(query);
    const summary = await getRevenueAnalytics(query);

    return {
        success: true,
        summary: {
            totalRevenue: summary.revenue.total,
            grossRevenue: summary.revenue.gross,
            netRevenue: summary.revenue.net,
            growth: summary.revenue.growth,
            totalGST: summary.gst.amount,
            totalRefunds: summary.refunds.amount,
            netProfit: summary.profit.netProfit,
            profitMargin: summary.profit.margin,
            totalExpenses: summary.profit.totalExpenses
        },
        rows: detail.dailyRevenue.map((item) => ({
            date: item._id,
            revenue: item.revenue,
            orders: item.orders,
            gst: formatGstAmount(item.revenue),
            netRevenue: Number((item.revenue / (1 + GST_RATE)).toFixed(2))
        })),
        charts: detail
    };
}

async function getCustomersExportData(query = {}) {
    const analytics = await getCustomerAnalytics(query);
    const loyaltyDocs = await LoyaltyAccount.find({
        customerPhone: { $in: analytics.topCustomers.map((customer) => customer.phone) }
    }).lean();
    const loyaltyMap = new Map(loyaltyDocs.map((doc) => [doc.customerPhone, doc]));

    const rows = analytics.topCustomers.map((customer) => {
        const loyalty = loyaltyMap.get(customer.phone);
        return {
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            totalOrders: customer.totalOrders,
            totalSpent: customer.totalSpent,
            clv: customer.clv,
            avgOrderValue: customer.avgOrderValue,
            vipLevel: loyalty?.vipLevel || customer.vipLevel,
            rewardPoints: loyalty?.rewardPoints || 0,
            walletBalance: loyalty?.walletBalance || 0,
            cashbackBalance: loyalty?.cashbackBalance || 0,
            lastOrder: customer.lastOrder
        };
    });

    return {
        success: true,
        total: analytics.totalCustomers,
        summary: {
            totalCustomers: analytics.totalCustomers,
            repeatCustomers: analytics.repeatCustomers,
            repeatRate: analytics.repeatRate,
            averageCustomerValue: analytics.averageCustomerValue
        },
        rows
    };
}

async function getProductsExportData() {
    const products = await Product.find({}).sort({ category: 1, name: 1 }).lean();
    const rows = products.map((product) => ({
        productCode: product.productCode || '',
        name: product.name,
        category: product.category,
        price: product.price,
        costPrice: product.costPrice || 0,
        stock: product.stock,
        status: product.status,
        lowStockThreshold: product.lowStockThreshold || 10,
        expiryDays: product.expiryDays || '',
        inventoryValue: Number(product.price || 0) * Number(product.stock || 0)
    }));

    return {
        success: true,
        total: rows.length,
        summary: {
            totalProducts: rows.length,
            totalInventoryValue: rows.reduce((sum, row) => sum + Number(row.inventoryValue || 0), 0),
            lowStockCount: rows.filter((row) => row.stock > 0 && row.stock <= row.lowStockThreshold).length,
            outOfStockCount: rows.filter((row) => row.stock <= 0).length
        },
        rows
    };
}

async function getInventoryExportData() {
    const products = await Product.find({}).sort({ category: 1, name: 1 }).lean();
    const rows = products.map((product) => ({
        name: product.name,
        category: product.category,
        stock: product.stock,
        price: product.price,
        costPrice: product.costPrice || 0,
        status: product.status,
        lowStockThreshold: product.lowStockThreshold || 10,
        inventoryValue: Number(product.price || 0) * Number(product.stock || 0),
        lastRestockedAt: product.lastRestockedAt
    }));

    return {
        success: true,
        total: rows.length,
        summary: {
            totalValue: rows.reduce((sum, row) => sum + Number(row.inventoryValue || 0), 0),
            totalProducts: rows.length,
            lowStockCount: rows.filter((row) => row.stock > 0 && row.stock <= row.lowStockThreshold).length,
            outOfStockCount: rows.filter((row) => row.stock <= 0).length
        },
        rows
    };
}

async function getGstExportData(query = {}) {
    const { from, to } = query;
    const filter = buildDateFilter(from, to);

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    const rows = orders.map((order) => {
        const gst = order.financials?.gstAmount || formatGstAmount(order.total);
        const taxableValue = Number((Number(order.total || 0) - Number(gst || 0)).toFixed(2));
        return {
            orderId: order.orderId,
            customerName: order.customer?.name || '',
            date: order.createdAt,
            grossAmount: order.total,
            taxableValue,
            gstRate: Number((GST_RATE * 100).toFixed(2)),
            gstAmount: gst,
            paymentStatus: order.paymentStatus,
            orderStatus: order.status
        };
    });

    return {
        success: true,
        summary: {
            totalInvoices: rows.length,
            totalTaxableValue: rows.reduce((sum, row) => sum + Number(row.taxableValue || 0), 0),
            totalGST: rows.reduce((sum, row) => sum + Number(row.gstAmount || 0), 0),
            totalGrossAmount: rows.reduce((sum, row) => sum + Number(row.grossAmount || 0), 0)
        },
        rows
    };
}

async function getSubscriptionsExportData(query = {}) {
    const { from, to, status } = query;
    const filter = buildDateFilter(from, to);
    if (status) {
        filter.status = status;
    }

    const subscriptions = await Subscription.find(filter)
        .populate('area_id', 'name')
        .populate('assigned_delivery_boy_id', 'name phone')
        .sort({ createdAt: -1 })
        .lean();

    const rows = subscriptions.map((subscription) => ({
        subscriptionId: subscription.subscriptionId,
        customerName: subscription.name,
        phone: subscription.phone,
        address: subscription.address,
        milkType: subscription.milkType,
        quantity: subscription.qty,
        schedule: subscription.schedule,
        monthlyTotal: subscription.monthlyTotal,
        paymentMethod: subscription.paymentMethod,
        status: subscription.status,
        area: subscription.area_id?.name || '',
        deliveryPartner: subscription.assigned_delivery_boy_id?.name || '',
        startDate: subscription.startDate,
        createdAt: subscription.createdAt
    }));

    return {
        success: true,
        total: rows.length,
        summary: {
            totalSubscriptions: rows.length,
            activeSubscriptions: rows.filter((row) => row.status === 'active').length,
            pausedSubscriptions: rows.filter((row) => row.status === 'paused').length,
            cancelledSubscriptions: rows.filter((row) => row.status === 'cancelled').length,
            monthlyRecurringValue: rows.reduce((sum, row) => sum + Number(row.monthlyTotal || 0), 0)
        },
        rows
    };
}

async function getAnalyticsExportData(query = {}) {
    const [revenue, products, customers, expenses] = await Promise.all([
        getRevenueAnalytics(query),
        getProductAnalytics(query),
        getCustomerAnalytics(query),
        getExpenseAnalytics(query)
    ]);

    return {
        success: true,
        summary: {
            totalRevenue: revenue.revenue.total,
            grossRevenue: revenue.revenue.gross,
            netRevenue: revenue.revenue.net,
            revenueGrowth: revenue.revenue.growth,
            totalCustomers: customers.totalCustomers,
            repeatCustomers: customers.repeatCustomers,
            totalExpenses: expenses.totalExpenses,
            netProfit: revenue.profit.netProfit,
            gstCollected: revenue.gst.amount
        },
        rows: [
            { metric: 'Total Revenue', value: revenue.revenue.total },
            { metric: 'Gross Revenue', value: revenue.revenue.gross },
            { metric: 'Net Revenue', value: revenue.revenue.net },
            { metric: 'Revenue Growth %', value: revenue.revenue.growth },
            { metric: 'Net Profit', value: revenue.profit.netProfit },
            { metric: 'Profit Margin %', value: revenue.profit.margin },
            { metric: 'Total Customers', value: customers.totalCustomers },
            { metric: 'Repeat Customers', value: customers.repeatCustomers },
            { metric: 'Total Expenses', value: expenses.totalExpenses }
        ],
        topProducts: products.bestSellers
    };
}

module.exports = {
    getAnalyticsExportData,
    getCustomersExportData,
    getGstExportData,
    getInventoryExportData,
    getOrdersExportData,
    getProductsExportData,
    getRevenueExportData,
    getSubscriptionsExportData
};
