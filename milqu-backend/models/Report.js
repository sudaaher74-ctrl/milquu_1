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
        gstCollected: { type: Number, default: 0 }
    },
    generatedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['completed', 'failed'], default: 'completed' }
}, { timestamps: true });

ReportSchema.index({ type: 1, generatedAt: -1 });
ReportSchema.index({ periodStart: 1, periodEnd: 1 });

module.exports = mongoose.model('Report', ReportSchema);
