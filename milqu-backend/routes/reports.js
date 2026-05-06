const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const { logActivity } = require('../services/activity-log');
const {
    appendDownloadLog,
    cleanupOldReports,
    createReport,
    createScheduledReport,
    getReportById,
    listReports
} = require('../services/report-service');

const router = express.Router();
const REPORT_ROLES = ['super_admin', 'manager'];

router.post('/generate', verifyToken, requireRole(...REPORT_ROLES), async (req, res) => {
    try {
        const report = await createReport({
            type: req.body.type || 'daily',
            from: req.body.from,
            to: req.body.to,
            generatedBy: req.admin?._id || null,
            source: 'manual'
        });

        await logActivity(req, {
            module: 'reports',
            action: 'generate_report',
            entityType: 'report',
            entityId: report.reportId,
            message: `Generated ${report.type} report ${report.reportId}`,
            metadata: { type: report.type }
        });

        res.status(201).json({
            success: true,
            message: `${report.type} report generated.`,
            report
        });
    } catch (err) {
        console.error('Report generation error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/', verifyToken, requireRole(...REPORT_ROLES), async (req, res) => {
    try {
        const result = await listReports(req.query);
        res.json({ success: true, total: result.total, page: result.page, reports: result.reports });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', verifyToken, requireRole(...REPORT_ROLES), async (req, res) => {
    try {
        const report = await getReportById(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found.' });
        }
        res.json({ success: true, report });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/latest/:type', verifyToken, requireRole(...REPORT_ROLES), async (req, res) => {
    try {
        const result = await listReports({ type: req.params.type, page: 1, limit: 1 });
        const report = result.reports[0];
        if (!report) {
            return res.status(404).json({ success: false, message: 'No report found.' });
        }
        res.json({ success: true, report });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/:id/download-log', verifyToken, requireRole(...REPORT_ROLES), async (req, res) => {
    try {
        const { format = 'json' } = req.body;
        const report = await appendDownloadLog(req.params.id, format, req.admin?._id || null);
        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found.' });
        }

        await logActivity(req, {
            module: 'reports',
            action: 'download_report',
            entityType: 'report',
            entityId: req.params.id,
            message: `Logged ${format} download for report ${req.params.id}`,
            metadata: { format }
        });

        res.json({ success: true, report });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/cleanup', verifyToken, requireRole('super_admin'), async (req, res) => {
    try {
        const result = await cleanupOldReports(req.body.retentionDays);
        await logActivity(req, {
            module: 'reports',
            action: 'cleanup_reports',
            entityType: 'report',
            entityId: 'cleanup',
            message: `Cleaned up ${result.deletedCount} old reports`,
            metadata: result
        });
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

async function cronResponder(type, source, res) {
    try {
        const report = await createScheduledReport(type, source);
        res.json({ success: true, message: `${type} cron report generated.`, reportId: report.reportId });
    } catch (err) {
        console.error(`Cron ${type} report error:`, err);
        res.status(500).json({ success: false, message: err.message });
    }
}

router.post('/cron/daily', async (req, res) => cronResponder('daily', 'vercel-cron', res));
router.post('/cron/weekly', async (req, res) => cronResponder('weekly', 'vercel-cron', res));
router.post('/cron/monthly', async (req, res) => cronResponder('monthly', 'vercel-cron', res));

module.exports = router;
