const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { verifyToken, requireRole } = require('../middleware/auth');
const { getRequiredEnv } = require('../config');

const router = express.Router();
const JWT_SECRET = getRequiredEnv('JWT_SECRET');
const JWT_EXPIRES = '7d';

function generateToken(admin) {
    return jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );
}

router.get('/setup-status', async (req, res) => {
    try {
        const adminCount = await Admin.countDocuments();
        res.json({
            success: true,
            adminCount,
            hasAdmins: adminCount > 0,
            allowSelfRegister: adminCount === 0
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to check admin setup.' });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        const adminCount = await Admin.countDocuments();
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

        const existing = await Admin.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        const admin = new Admin({
            name,
            email: email.toLowerCase(),
            password,
            role: adminCount === 0 ? 'super_admin' : (role || 'manager')
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

router.get('/me', verifyToken, (req, res) => {
    res.json({
        success: true,
        admin: { id: req.admin._id, name: req.admin.name, email: req.admin.email, role: req.admin.role }
    });
});

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

        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect current password.' });
        }

        if (newEmail.toLowerCase() !== admin.email) {
            const existing = await Admin.findOne({ email: newEmail.toLowerCase() });
            if (existing && existing._id.toString() !== admin._id.toString()) {
                return res.status(400).json({ success: false, message: 'Email already in use by another account.' });
            }
            admin.email = newEmail.toLowerCase();
        }

        admin.password = newPassword;
        await admin.save();

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

router.get('/', verifyToken, requireRole('super_admin'), async (req, res) => {
    try {
        const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, admins });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
