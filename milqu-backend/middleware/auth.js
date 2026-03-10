const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { getRequiredEnv } = require('../config');

async function verifyToken(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, getRequiredEnv('JWT_SECRET'));
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

async function optionalVerifyToken(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        return next();
    }

    if (!header.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Invalid authorization header.' });
    }

    try {
        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, getRequiredEnv('JWT_SECRET'));
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

module.exports = { verifyToken, optionalVerifyToken, requireRole };
