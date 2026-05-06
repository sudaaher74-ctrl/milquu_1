const AnalyticsHistory = require('../models/AnalyticsHistory');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const { buildReportPayload } = require('./analytics-service');
const {
    getDateRange
} = require('./date-range');
const {
    removeStoredReport,
    saveReportJson
} = require('./report-storage');

function generateReportId(type) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `RPT-${type.toUpperCase().charAt(0)}-${dateStr}-${rand}`;
}

function resolveRange(type, from, to) {
    if (from && to) {
        return getDateRange({ from, to });
    }

    if (type === 'weekly') {
        return getDateRange({ period: 'week' });
    }

    if (type === 'monthly') {
        return getDateRange({ period: 'month' });
    }

    return getDateRange({ period: 'today' });
}

async function createReport(options = {}) {
    const {
        type = 'daily',
        from,
        to,
        generatedBy = null,
        source = 'manual'
    } = options;

    const range = resolveRange(type, from, to);
    const generatedAt = new Date();
    const reportId = generateReportId(type);
    const payload = await buildReportPayload(range, {
        reportId,
        type,
        generatedAt,
        source
    });

    const report = new Report({
        reportId,
        type,
        periodStart: range.start,
        periodEnd: range.end,
        data: {
            totalRevenue: payload.summary.totalRevenue,
            grossRevenue: payload.summary.grossRevenue,
            netRevenue: payload.summary.netRevenue,
            totalOrders: payload.summary.totalOrders,
            totalCustomers: payload.summary.totalCustomers,
            newCustomers: payload.customers?.filter((customer) => customer.totalOrders === 1).length || 0,
            deliveredOrders: payload.summary.deliveredOrders,
            cancelledOrders: payload.summary.cancelledOrders,
            avgOrderValue: payload.summary.avgOrderValue,
            topProducts: payload.topProducts,
            revenueByDay: payload.charts.dailyRevenue,
            ordersByStatus: [],
            totalExpenses: payload.summary.totalExpenses,
            netProfit: payload.summary.netProfit,
            gstCollected: payload.summary.gstCollected,
            profitMargin: payload.summary.profitMargin,
            refunds: payload.summary.refunds,
            deliveryCost: payload.summary.deliveryCost,
            packagingCost: payload.summary.packagingCost
        },
        generatedAt,
        generatedBy,
        generationSource: source,
        storage: {
            type: 'hybrid'
        },
        status: 'completed'
    });

    await report.save();

    const stored = saveReportJson(reportId, payload, generatedAt);
    report.storage.localPath = stored.filePath;
    report.storage.byteSize = stored.size;
    await report.save();

    await AnalyticsHistory.create({
        period: type,
        snapshotDate: generatedAt,
        source,
        metrics: {
            totalRevenue: payload.summary.totalRevenue,
            grossRevenue: payload.summary.grossRevenue,
            netRevenue: payload.summary.netRevenue,
            netProfit: payload.summary.netProfit,
            profitMargin: payload.summary.profitMargin,
            totalOrders: payload.summary.totalOrders,
            totalCustomers: payload.summary.totalCustomers,
            repeatCustomers: payload.summary.repeatCustomers || 0,
            inventoryValue: 0,
            growthPercent: 0
        },
        chartData: payload.charts,
        insights: payload.aiInsights || []
    });

    return report;
}

async function createScheduledReport(type, source = 'node-cron') {
    const report = await createReport({ type, source });

    await Notification.create({
        type: 'report_ready',
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report Ready`,
        message: `The ${type} report ${report.reportId} is available for review.`,
        data: { reportId: report.reportId, type },
        priority: 'low'
    });

    return report;
}

async function listReports(options = {}) {
    const {
        type,
        page = 1,
        limit = 20
    } = options;
    const filter = type ? { type } : {};
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [reports, total] = await Promise.all([
        Report.find(filter)
            .sort({ generatedAt: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit),
        Report.countDocuments(filter)
    ]);

    return { reports, total, page: safePage };
}

async function getReportById(reportId) {
    return Report.findOne({ reportId });
}

async function appendDownloadLog(reportId, format, adminId) {
    return Report.findOneAndUpdate(
        { reportId },
        {
            $push: {
                downloads: {
                    format,
                    downloadedAt: new Date(),
                    downloadedBy: adminId || null
                }
            }
        },
        { new: true }
    );
}

async function cleanupOldReports(retentionDays = Number(process.env.REPORT_RETENTION_DAYS) || 90) {
    const safeRetention = Math.max(7, retentionDays);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - safeRetention);

    const expiredReports = await Report.find({ generatedAt: { $lt: cutoff } });

    expiredReports.forEach((report) => {
        removeStoredReport(report.storage?.localPath);
    });

    const deletedCount = expiredReports.length;
    if (deletedCount > 0) {
        await Report.deleteMany({ _id: { $in: expiredReports.map((report) => report._id) } });
        await AnalyticsHistory.deleteMany({ snapshotDate: { $lt: cutoff } });
    }

    return {
        deletedCount,
        cutoff
    };
}

module.exports = {
    appendDownloadLog,
    cleanupOldReports,
    createReport,
    createScheduledReport,
    getReportById,
    listReports
};
