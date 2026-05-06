const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    adminName: { type: String, default: '' },
    module: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    entityType: { type: String, default: '', trim: true },
    entityId: { type: String, default: '', trim: true },
    status: { type: String, enum: ['success', 'failure'], default: 'success' },
    message: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' }
}, { timestamps: true });

ActivityLogSchema.index({ module: 1, createdAt: -1 });
ActivityLogSchema.index({ adminId: 1, createdAt: -1 });
ActivityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
