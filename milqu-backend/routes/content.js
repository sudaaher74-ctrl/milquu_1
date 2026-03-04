// routes/content.js  —  CMS content management
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Content = require('../models/Content');

// ── Multer for CMS images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `cms_${Date.now()}${ext}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ── POST /api/content — create CMS content
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { key, type, title, value, isActive, order } = req.body;

        if (!key || !type) {
            return res.status(400).json({ success: false, message: 'Key and type are required.' });
        }

        const existing = await Content.findOne({ key });
        if (existing) {
            return res.status(400).json({ success: false, message: `Content key "${key}" already exists.` });
        }

        const content = new Content({
            key,
            type,
            title: title || '',
            value: value || '',
            image: req.file ? req.file.filename : '',
            isActive: isActive !== 'false',
            order: parseInt(order) || 0
        });

        await content.save();
        res.status(201).json({ success: true, message: 'Content created!', content });
    } catch (err) {
        console.error('Content create error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/content — list all content
router.get('/', async (req, res) => {
    try {
        const { type, active } = req.query;
        const filter = {};
        if (type) filter.type = type;
        if (active !== undefined) filter.isActive = active === 'true';

        const content = await Content.find(filter).sort({ order: 1, updatedAt: -1 });
        res.json({ success: true, total: content.length, content });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/content/:key — single content by key
router.get('/:key', async (req, res) => {
    try {
        const content = await Content.findOne({ key: req.params.key });
        if (!content) return res.status(404).json({ success: false, message: 'Content not found.' });
        res.json({ success: true, content });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── PUT /api/content/:key — update content
router.put('/:key', upload.single('image'), async (req, res) => {
    try {
        const { title, value, isActive, order, type } = req.body;
        const update = {};

        if (title !== undefined) update.title = title;
        if (value !== undefined) update.value = value;
        if (type !== undefined) update.type = type;
        if (isActive !== undefined) update.isActive = isActive !== 'false';
        if (order !== undefined) update.order = parseInt(order);
        if (req.file) update.image = req.file.filename;
        update.updatedAt = new Date();

        const content = await Content.findOneAndUpdate({ key: req.params.key }, update, { new: true });
        if (!content) return res.status(404).json({ success: false, message: 'Content not found.' });

        res.json({ success: true, message: 'Content updated!', content });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── DELETE /api/content/:key — delete content
router.delete('/:key', async (req, res) => {
    try {
        const content = await Content.findOneAndDelete({ key: req.params.key });
        if (!content) return res.status(404).json({ success: false, message: 'Content not found.' });

        if (content.image) {
            const imgPath = path.join(__dirname, '..', 'uploads', content.image);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }

        res.json({ success: true, message: 'Content deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
