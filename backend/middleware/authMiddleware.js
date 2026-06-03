import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import DeliveryStaff from '../models/DeliveryStaff.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log(`[AUTH DEBUG] Received token for path ${req.originalUrl}:`, token);

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

      // Get user or staff from the token
      if (decoded.role === 'delivery') {
        req.user = await DeliveryStaff.findById(decoded.id).select('-password');
        req.user.role = 'delivery'; // explicitly set role since it might not be in the schema
      } else {
        req.user = await User.findById(decoded.id).select('-password');
      }

      if (!req.user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
