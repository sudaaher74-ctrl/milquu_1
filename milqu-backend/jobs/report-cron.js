let cron = null;

try {
    cron = require('node-cron');
} catch (err) {
    cron = null;
}

const { cleanupOldReports, createScheduledReport } = require('../services/report-service');

let schedulerStarted = false;

async function runScheduledTask(connectToDatabase, task, label) {
    try {
        if (typeof connectToDatabase === 'function') {
            await connectToDatabase();
        }
        await task();
        console.log(`[ReportCron] ${label} completed`);
    } catch (err) {
        console.error(`[ReportCron] ${label} failed:`, err.message);
    }
}

function initReportScheduler(options = {}) {
    if (schedulerStarted) {
        return;
    }

    if (process.env.VERCEL || process.env.DISABLE_NODE_CRON === 'true') {
        console.log('[ReportCron] Local cron scheduler skipped for serverless/disabled environment');
        return;
    }

    if (!cron) {
        console.warn('[ReportCron] node-cron is not installed. Scheduled report generation is disabled.');
        return;
    }

    const timezone = process.env.CRON_TIMEZONE || 'Asia/Kolkata';
    const connectToDatabase = options.connectToDatabase;

    cron.schedule('5 1 * * *', () => {
        runScheduledTask(connectToDatabase, () => createScheduledReport('daily', 'node-cron'), 'daily report');
    }, { timezone });

    cron.schedule('10 2 * * 0', () => {
        runScheduledTask(connectToDatabase, () => createScheduledReport('weekly', 'node-cron'), 'weekly report');
    }, { timezone });

    cron.schedule('15 3 1 * *', () => {
        runScheduledTask(connectToDatabase, () => createScheduledReport('monthly', 'node-cron'), 'monthly report');
    }, { timezone });

    cron.schedule('45 3 * * *', () => {
        runScheduledTask(connectToDatabase, () => cleanupOldReports(), 'report cleanup');
    }, { timezone });

    schedulerStarted = true;
    console.log(`[ReportCron] Scheduler started (${timezone})`);
}

module.exports = {
    initReportScheduler
};
