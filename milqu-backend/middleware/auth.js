// middleware/auth.js  —  JWT authentication & role-based access
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Verify JWT token from Authorization header.
 * Attaches `req.admin` with { id, name, email, role }.
 */
async function verifyToken(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'milqu_default_secret');

        const admin = await Admin.findById(decoded.id).select('-password');
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid token. Admin not found.' });
        }

        req.admin = admin;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
        }
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
}

/**
 * Require one of the specified roles.
 * Must be used AFTER verifyToken.
 * Usage: requireRole('super_admin', 'manager')
 */
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({ success: false, message: 'Not authenticated.' });
        }
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({ success: false, message: `Access denied. Required role: ${roles.join(' or ')}.` });
        }
        next();
    };
}

module.exports = { verifyToken, requireRole };
