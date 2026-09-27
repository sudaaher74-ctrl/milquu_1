import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import DeliveryStaff from '../models/DeliveryStaff.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'Server auth is not configured' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user or staff from the token
      if (decoded.role === 'delivery') {
        req.user = await DeliveryStaff.findById(decoded.id).select('-password');
        if (req.user) {
          req.user.role = 'delivery'; // explicitly set role since it might not be in the schema
        }
      } else {
        req.user = await User.findById(decoded.id).select('-password');
      }

      if (!req.user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
      }

      // A deactivated employee (or delivery person) is signed out at once,
      // without waiting for their token to expire.
      if (req.user.isActive === false || req.user.status === 'Inactive') {
        res.status(401).json({ message: 'This account has been deactivated' });
        return;
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin-panel roles. Each group includes the ones above it, so a route gated
// to STAFF_ROLES is open to managers and admins too.
//   admin / superadmin — everything, including money out, staff accounts and settings
//   manager            — day-to-day running: sales, stock, purchasing, finance reports
//   staff              — the counter and the round: POS, today's orders, deliveries
export const ADMIN_ROLES = ['superadmin', 'admin'];
export const MANAGER_ROLES = [...ADMIN_ROLES, 'manager'];
export const STAFF_ROLES = [...MANAGER_ROLES, 'staff'];

/** Allow only signed-in users whose role is in `roles`. Use after protect. */
export const allow = (roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'You do not have access to this' });
  }
};

// Admin (and superadmin) only. Used to accept 'admin' alone, which locked out
// the superadmin role the schema already allowed.
export const admin = allow(ADMIN_ROLES);
export const managerUp = allow(MANAGER_ROLES);
export const staffUp = allow(STAFF_ROLES);

/** Delivery staff only — the delivery app's endpoints. */
export const deliveryOnly = (req, res, next) => {
  if (req.user && req.user.role === 'delivery') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as delivery staff' });
  }
};

/**
 * Attach req.user when a valid token is present, and carry on without one.
 * For public endpoints (guest checkout) that behave differently for a
 * signed-in customer. A bad token is treated as no token, not an error.
 */
export const optionalProtect = async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ') || !process.env.JWT_SECRET) return next();
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    if (decoded.role !== 'delivery') {
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch {
    // ignore — the request proceeds as a guest
  }
  next();
};
