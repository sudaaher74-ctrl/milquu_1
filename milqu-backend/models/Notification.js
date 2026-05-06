const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: [
            'low_stock', 'out_of_stock', 'high_sales_day', 'new_customer',
            'revenue_milestone', 'report_ready', 'failed_payment',
            'expiry_warning', 'order_spike', 'restock_needed'
        ],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' }
}, { timestamps: true });

NotificationSchema.index({ isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
