const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');
const { createRateLimiter } = require('../middleware/rateLimit');
const { verifyToken, requireRole } = require('../middleware/auth');
const { getRequiredEnv } = require('../config');
const { logActivity } = require('../services/activity-log');

const router = express.Router();
const JWT_SECRET = getRequiredEnv('JWT_SECRET', 'dev-fallback-secret-123');
const JWT_EXPIRES = '7d';
const authLimiter = createRateLimiter({
    namespace: 'admin-auth',
    windowMs: 10 * 60 * 1000,
    max: 15,
    message: 'Too many admin authentication attempts. Please wait a few minutes and try again.'
});

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

router.post('/register', authLimiter, async (req, res) => {
    try {
        const { name, email, password, role, phone, assigned_area } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            // Require a one-time setup token for the first admin account
            const setupToken = process.env.INITIAL_ADMIN_TOKEN;
            if (setupToken && req.body.setupToken !== setupToken) {
                return res.status(403).json({ success: false, message: 'Setup token required to create the first admin account.' });
            }
        } else if (adminCount > 0) {
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
            role: adminCount === 0 ? 'super_admin' : (role || 'manager'),
            phone,
            assigned_area
        });

        await admin.save();
        await logActivity(req, {
            module: 'admin',
            action: 'register_admin',
            entityType: 'admin',
            entityId: String(admin._id),
            message: `Registered admin ${admin.email}`,
            metadata: { role: admin.role }
        });

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

router.post('/login', authLimiter, async (req, res) => {
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

        admin.lastLoginAt = new Date();
        admin.lastSeenAt = new Date();
        admin.loginCount = (admin.loginCount || 0) + 1;
        await admin.save();

        await logActivity(req, {
            module: 'admin',
            action: 'login',
            entityType: 'admin',
            entityId: String(admin._id),
            message: `Admin ${admin.email} logged in`,
            metadata: { role: admin.role }
        });

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
        admin.lastSeenAt = new Date();
        await admin.save();

        await logActivity(req, {
            module: 'admin',
            action: 'update_credentials',
            entityType: 'admin',
            entityId: String(admin._id),
            message: `Updated credentials for ${admin.email}`
        });

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

router.get('/activity-logs', verifyToken, requireRole('super_admin', 'manager'), async (req, res) => {
    try {
        const { module, action, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (module) filter.module = module;
        if (action) filter.action = action;

        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
        const [logs, total] = await Promise.all([
            ActivityLog.find(filter)
                .sort({ createdAt: -1 })
                .skip((safePage - 1) * safeLimit)
                .limit(safeLimit),
            ActivityLog.countDocuments(filter)
        ]);

        res.json({ success: true, total, page: safePage, logs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/login-history', verifyToken, requireRole('super_admin', 'manager'), async (req, res) => {
    try {
        const logs = await ActivityLog.find({
            module: 'admin',
            action: 'login'
        })
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({ success: true, total: logs.length, logs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/', verifyToken, requireRole('super_admin'), async (req, res) => {
    try {
        const { role } = req.query;
        const query = role ? { role } : {};
        const admins = await Admin.find(query).select('-password').populate('assigned_area').sort({ createdAt: -1 });
        res.json({ success: true, count: admins.length, admins });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/:id', verifyToken, requireRole('super_admin'), async (req, res) => {
    try {
        const { password, ...updateData } = req.body; // Don't allow password update here
        const admin = await Admin.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found.' });
        await logActivity(req, {
            module: 'admin',
            action: 'update_admin',
            entityType: 'admin',
            entityId: String(admin._id),
            message: `Updated admin ${admin.email}`
        });
        res.json({ success: true, admin });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', verifyToken, requireRole('super_admin'), async (req, res) => {
    try {
        if (req.params.id === req.admin._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
        }
        const admin = await Admin.findByIdAndDelete(req.params.id);
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found.' });
        await logActivity(req, {
            module: 'admin',
            action: 'delete_admin',
            entityType: 'admin',
            entityId: String(admin._id),
            message: `Deleted admin ${admin.email}`
        });
        res.json({ success: true, message: 'Admin deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
