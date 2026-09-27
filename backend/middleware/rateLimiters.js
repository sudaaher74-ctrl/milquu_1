import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

// Roles whose signed-in requests are not counted against the per-IP limit.
// The shop counter, managers and delivery staff often share one network (and
// so one IP), and the admin panel makes several calls per page — 300 a window
// locked the whole shop out within minutes. Their logins are still limited.
const TRUSTED_ROLES = ['superadmin', 'admin', 'manager', 'staff', 'delivery'];

/** True for a request carrying a valid token for a trusted role. */
export const isTrustedStaffRequest = (req) => {
  const header = req.headers?.authorization || '';
  if (!header.startsWith('Bearer ') || !process.env.JWT_SECRET) return false;
  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    return TRUSTED_ROLES.includes(decoded.role);
  } catch {
    return false;
  }
};

// Generous global limit — protects against scraping and basic flooding.
// CORS preflights (OPTIONS) are not counted: the browser sends one before
// every cross-origin API call, which silently halved the real allowance.
// 1000 a window allows for many customers sharing one mobile-carrier IP.
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  skip: (req) => req.method === 'OPTIONS' || isTrustedStaffRequest(req),
  message: { message: 'Too many requests from this IP, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// For sensitive public endpoints (guest checkout, free samples)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for login/register — slows credential brute-forcing
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
