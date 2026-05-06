const mongoose = require('mongoose');

const AnalyticsHistorySchema = new mongoose.Schema({
    period: { type: String, required: true, trim: true },
    snapshotDate: { type: Date, required: true },
    source: { type: String, enum: ['manual', 'node-cron', 'vercel-cron', 'system'], default: 'system' },
    metrics: {
        totalRevenue: { type: Number, default: 0 },
        grossRevenue: { type: Number, default: 0 },
        netRevenue: { type: Number, default: 0 },
        netProfit: { type: Number, default: 0 },
        profitMargin: { type: Number, default: 0 },
        totalOrders: { type: Number, default: 0 },
        totalCustomers: { type: Number, default: 0 },
        repeatCustomers: { type: Number, default: 0 },
        inventoryValue: { type: Number, default: 0 },
        growthPercent: { type: Number, default: 0 }
    },
    chartData: { type: mongoose.Schema.Types.Mixed, default: {} },
    insights: { type: [String], default: [] }
}, { timestamps: true });

AnalyticsHistorySchema.index({ period: 1, snapshotDate: -1 });
AnalyticsHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('AnalyticsHistory', AnalyticsHistorySchema);
