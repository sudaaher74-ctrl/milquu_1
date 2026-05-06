const ActivityLog = require('../models/ActivityLog');

function getRequestIp(req) {
    return req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
}

async function logActivity(req, entry = {}) {
    try {
        const admin = req?.admin;
        await ActivityLog.create({
            adminId: admin?._id || null,
            adminName: admin?.name || '',
            module: entry.module || 'system',
            action: entry.action || 'unknown',
            entityType: entry.entityType || '',
            entityId: entry.entityId || '',
            status: entry.status || 'success',
            message: entry.message || '',
            metadata: entry.metadata || {},
            ipAddress: entry.ipAddress || getRequestIp(req),
            userAgent: entry.userAgent || req?.headers['user-agent'] || ''
        });
    } catch (err) {
        console.warn('[ActivityLog] Failed to persist log:', err.message);
    }
}

module.exports = {
    logActivity
};
