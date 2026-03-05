// routes/admin.js  —  Admin authentication & management
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { verifyToken, requireRole } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'milqu_default_secret';
const JWT_EXPIRES = '7d';

function generateToken(admin) {
    return jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );
}

// ── POST /api/admin/register — create admin (first admin auto-creates, after that super_admin only)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        // Check if any admin exists
        const adminCount = await Admin.countDocuments();

        // If admins already exist, require authentication + super_admin role
        if (adminCount > 0) {
            const header = req.headers.authorization;
            if (!header || !header.startsWith('Bearer ')) {
                return res.status(401).json({ success: false, message: 'Only super_admin can register new admins.' });
            }
            try {
                const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
                const reqAdmin = await Admin.findById(decoded.id);
                if (!reqAdmin || reqAdmin.role !== 'super_admin') {
                    return res.status(403).json({ success: false, message: 'Only super_admin can register new admins.' });
                }
            } catch {
                return res.status(401).json({ success: false, message: 'Invalid token.' });
            }
        }

        // Check duplicate email
        const existing = await Admin.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        const admin = new Admin({
            name,
            email: email.toLowerCase(),
            password,
            role: adminCount === 0 ? 'super_admin' : (role || 'manager')  // First admin is always super_admin
        });

        await admin.save();

        const token = generateToken(admin);
        res.status(201).json({
            success: true,
            message: `Admin "${admin.name}" registered as ${admin.role}.`,
            token,
            admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
        });
    } catch (err) {
        console.error('Admin register error:', err);
        res.status(500).json({ success: false, message: err.message || 'Server error.' });
    }
});

// ── POST /api/admin/login — authenticate admin
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = generateToken(admin);
        res.json({
            success: true,
            message: `Welcome back, ${admin.name}!`,
            token,
            admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
        });
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ── GET /api/admin/me — get current admin profile
router.get('/me', verifyToken, (req, res) => {
    res.json({
        success: true,
        admin: { id: req.admin._id, name: req.admin.name, email: req.admin.email, role: req.admin.role }
    });
});

// ── PUT /api/admin/credentials — update current admin email and password
router.put('/credentials', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newEmail, newPassword } = req.body;

        if (!currentPassword || !newEmail || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current password, new email, and new password are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
        }

        const admin = await Admin.findById(req.admin._id);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found.' });
        }

        // Check current password
        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect current password.' });
        }

        // Check if new email is taken by a different admin
        if (newEmail.toLowerCase() !== admin.email) {
            const existing = await Admin.findOne({ email: newEmail.toLowerCase() });
            if (existing && existing._id.toString() !== admin._id.toString()) {
                return res.status(400).json({ success: false, message: 'Email already in use by another account.' });
            }
            admin.email = newEmail.toLowerCase();
        }

        // Update password (will be hashed by pre-save hook)
        admin.password = newPassword;
        await admin.save();

        // Generate new token reflecting new email
        const token = generateToken(admin);

        res.json({
            success: true,
            message: 'Credentials updated successfully.',
            token,
            admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
        });

    } catch (err) {
        console.error('Admin update credentials error:', err);
        res.status(500).json({ success: false, message: 'Server error while updating credentials.' });
    }
});

// ── GET /api/admin — list all admins (super_admin only)
router.get('/', verifyToken, requireRole('super_admin'), async (req, res) => {
    try {
        const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, admins });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
