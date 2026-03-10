const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { verifyToken, optionalVerifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const PRODUCT_MANAGERS = ['super_admin', 'manager'];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `product_${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) {
            return cb(null, true);
        }
        cb(new Error('Only image files (jpg, png, gif, webp) are allowed.'));
    }
});

router.post('/', verifyToken, requireRole(...PRODUCT_MANAGERS), upload.single('image'), async (req, res) => {
    try {
        const { name, price, category, description, stock, emoji, unit, badge } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({ success: false, message: 'Name, price, and category are required.' });
        }

        const product = new Product({
            name,
            price: parseFloat(price),
            category,
            description: description || '',
            image: req.file ? req.file.filename : '',
            imageUrl: '',
            stock: parseInt(stock, 10) || 0,
            emoji: emoji || '📦',
            unit: unit || '/unit',
            badge: badge || '',
            status: (parseInt(stock, 10) || 0) > 0 ? 'active' : 'out_of_stock'
        });

        await product.save();
        res.status(201).json({ success: true, message: 'Product created!', product });
    } catch (err) {
        console.error('Product create error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server error.' });
    }
});

router.get('/', optionalVerifyToken, async (req, res) => {
    try {
        const { category, status, search, scope } = req.query;
        const filter = {};
        if (category) filter.category = category;
        if (search) filter.name = { $regex: search, $options: 'i' };

        const isAdminScope = scope === 'admin';
        if (isAdminScope) {
            if (!req.admin) {
                return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
            }
            if (!PRODUCT_MANAGERS.includes(req.admin.role) && req.admin.role !== 'delivery_staff') {
                return res.status(403).json({ success: false, message: 'Access denied.' });
            }
            if (status) {
                filter.status = status;
            }
        } else {
            filter.status = 'active';
        }

        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, total: products.length, products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/:id', optionalVerifyToken, async (req, res) => {
    try {
        const filter = { _id: req.params.id };
        if (!req.admin) {
            filter.status = 'active';
        }

        const product = await Product.findOne(filter);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }
        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id', verifyToken, requireRole(...PRODUCT_MANAGERS), upload.single('image'), async (req, res) => {
    try {
        const { name, price, category, description, stock, emoji, unit, badge, status } = req.body;
        const update = {};

        if (name !== undefined) update.name = name;
        if (price !== undefined) update.price = parseFloat(price);
        if (category !== undefined) update.category = category;
        if (description !== undefined) update.description = description;
        if (emoji !== undefined) update.emoji = emoji;
        if (unit !== undefined) update.unit = unit;
        if (badge !== undefined) update.badge = badge;
        if (stock !== undefined) {
            update.stock = parseInt(stock, 10);
            update.status = parseInt(stock, 10) > 0 ? (status || 'active') : 'out_of_stock';
        }
        if (status !== undefined && stock === undefined) update.status = status;
        if (req.file) {
            update.image = req.file.filename;
            update.imageUrl = '';
        }

        const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        res.json({ success: true, message: 'Product updated!', product });
    } catch (err) {
        console.error('Product update error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', verifyToken, requireRole(...PRODUCT_MANAGERS), async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        if (product.image) {
            const imgPath = path.join(__dirname, '..', 'uploads', product.image);
            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
            }
        }

        res.json({ success: true, message: 'Product deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/:id/stock', verifyToken, requireRole(...PRODUCT_MANAGERS), async (req, res) => {
    try {
        const { stock } = req.body;
        if (stock === undefined || stock === null) {
            return res.status(400).json({ success: false, message: 'Stock value is required.' });
        }

        const stockVal = parseInt(stock, 10);
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { stock: stockVal, status: stockVal > 0 ? 'active' : 'out_of_stock' },
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        res.json({ success: true, message: `Stock updated to ${stockVal}.`, product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
