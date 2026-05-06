const fs = require('fs');
const path = require('path');

const DEFAULT_REPORTS_DIR = path.join(__dirname, '..', 'storage', 'reports');

function getReportsStorageDir() {
    return process.env.REPORTS_STORAGE_DIR
        ? path.resolve(process.env.REPORTS_STORAGE_DIR)
        : DEFAULT_REPORTS_DIR;
}

function ensureReportsStorageDir() {
    const baseDir = getReportsStorageDir();
    fs.mkdirSync(baseDir, { recursive: true });
    return baseDir;
}

function buildReportFilePath(reportId, generatedAt = new Date()) {
    const baseDir = ensureReportsStorageDir();
    const year = String(generatedAt.getFullYear());
    const month = String(generatedAt.getMonth() + 1).padStart(2, '0');
    const dir = path.join(baseDir, year, month);
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, `${reportId}.json`);
}

function saveReportJson(reportId, payload, generatedAt = new Date()) {
    const filePath = buildReportFilePath(reportId, generatedAt);
    const content = JSON.stringify(payload, null, 2);
    fs.writeFileSync(filePath, content, 'utf8');
    const stats = fs.statSync(filePath);
    return { filePath, size: stats.size };
}

function removeStoredReport(filePath) {
    if (!filePath) return;
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

module.exports = {
    ensureReportsStorageDir,
    getReportsStorageDir,
    removeStoredReport,
    saveReportJson
};
