const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    reportId: { type: String, required: true, unique: true },
    type: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    data: {
        totalRevenue: { type: Number, default: 0 },
        totalOrders: { type: Number, default: 0 },
        totalCustomers: { type: Number, default: 0 },
        newCustomers: { type: Number, default: 0 },
        deliveredOrders: { type: Number, default: 0 },
        cancelledOrders: { type: Number, default: 0 },
        avgOrderValue: { type: Number, default: 0 },
        topProducts: { type: [mongoose.Schema.Types.Mixed], default: [] },
        revenueByDay: { type: [mongoose.Schema.Types.Mixed], default: [] },
        ordersByStatus: { type: [mongoose.Schema.Types.Mixed], default: [] },
        totalExpenses: { type: Number, default: 0 },
        netProfit: { type: Number, default: 0 },
        gstCollected: { type: Number, default: 0 },
        grossRevenue: { type: Number, default: 0 },
        netRevenue: { type: Number, default: 0 },
        profitMargin: { type: Number, default: 0 },
        refunds: { type: Number, default: 0 },
        deliveryCost: { type: Number, default: 0 },
        packagingCost: { type: Number, default: 0 }
    },
    storage: {
        type: { type: String, enum: ['mongo', 'local', 'hybrid'], default: 'hybrid' },
        localPath: { type: String, default: '' },
        byteSize: { type: Number, default: 0 }
    },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    generationSource: { type: String, enum: ['manual', 'node-cron', 'vercel-cron'], default: 'manual' },
    downloads: {
        type: [{
            format: { type: String, enum: ['json', 'pdf', 'xlsx', 'csv'], required: true },
            downloadedAt: { type: Date, default: Date.now },
            downloadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null }
        }],
        default: []
    },
    generatedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['completed', 'failed'], default: 'completed' }
}, { timestamps: true });

ReportSchema.index({ type: 1, generatedAt: -1 });
ReportSchema.index({ periodStart: 1, periodEnd: 1 });

module.exports = mongoose.model('Report', ReportSchema);
