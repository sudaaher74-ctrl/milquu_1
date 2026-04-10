const express = require('express');
const router = express.Router();
const Area = require('../models/Area');
const { verifyToken, requireRole } = require('../middleware/auth');

const AREA_MANAGERS = ['super_admin', 'manager'];

// Get all areas
router.get('/', async (req, res) => {
    try {
        const areas = await Area.find({ isActive: true }).sort({ name: 1 });
        res.json({ success: true, count: areas.length, data: areas });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// Create new area
router.post('/', verifyToken, requireRole(...AREA_MANAGERS), async (req, res) => {
    try {
        const { name, pincodes } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
        
        const area = await Area.create({ name, pincodes });
        res.status(201).json({ success: true, data: area });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ success: false, message: 'Area already exists' });
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
});

// Update area
router.put('/:id', verifyToken, requireRole(...AREA_MANAGERS), async (req, res) => {
    try {
        const area = await Area.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!area) return res.status(404).json({ success: false, message: 'Area not found' });
        res.json({ success: true, data: area });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete area
router.delete('/:id', verifyToken, requireRole(...AREA_MANAGERS), async (req, res) => {
    try {
        const area = await Area.findById(req.params.id);
        if (!area) return res.status(404).json({ success: false, message: 'Area not found' });
        await area.deleteOne();
        res.json({ success: true, message: 'Area deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
