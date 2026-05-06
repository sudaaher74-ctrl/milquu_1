const express = require('express');
const {
    getAnalyticsExportData,
    getCustomersExportData,
    getGstExportData,
    getInventoryExportData,
    getOrdersExportData,
    getProductsExportData,
    getRevenueExportData,
    getSubscriptionsExportData
} = require('../services/export-service');
const { verifyToken, requireRole } = require('../middleware/auth');
const { logActivity } = require('../services/activity-log');

const router = express.Router();
const EXPORT_ROLES = ['super_admin', 'manager'];

async function respondWithExport(req, res, fetcher, moduleName) {
    const data = await fetcher(req.query);
    await logActivity(req, {
        module: 'export',
        action: `view_${moduleName}_dataset`,
        entityType: 'export',
        entityId: moduleName,
        message: `Viewed ${moduleName} export dataset`,
        metadata: { query: req.query }
    });
    res.json(data);
}

router.get('/orders', verifyToken, requireRole(...EXPORT_ROLES), async (req, res) => {
    try {
        await respondWithExport(req, res, getOrdersExportData, 'orders');
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/revenue', verifyToken, requireRole(...EXPORT_ROLES), async (req, res) => {
    try {
        await respondWithExport(req, res, getRevenueExportData, 'revenue');
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/customers', verifyToken, requireRole(...EXPORT_ROLES), async (req, res) => {
    try {
        await respondWithExport(req, res, getCustomersExportData, 'customers');
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/products', verifyToken, requireRole(...EXPORT_ROLES), async (req, res) => {
    try {
        const data = await getProductsExportData();
        await logActivity(req, {
            module: 'export',
            action: 'view_products_dataset',
            entityType: 'export',
            entityId: 'products',
            message: 'Viewed products export dataset'
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/inventory', verifyToken, requireRole(...EXPORT_ROLES), async (req, res) => {
    try {
        const data = await getInventoryExportData();
        await logActivity(req, {
            module: 'export',
            action: 'view_inventory_dataset',
            entityType: 'export',
            entityId: 'inventory',
            message: 'Viewed inventory export dataset'
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/gst', verifyToken, requireRole(...EXPORT_ROLES), async (req, res) => {
    try {
        await respondWithExport(req, res, getGstExportData, 'gst');
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/subscriptions', verifyToken, requireRole(...EXPORT_ROLES), async (req, res) => {
    try {
        await respondWithExport(req, res, getSubscriptionsExportData, 'subscriptions');
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/analytics', verifyToken, requireRole(...EXPORT_ROLES), async (req, res) => {
    try {
        await respondWithExport(req, res, getAnalyticsExportData, 'analytics');
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
