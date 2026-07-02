// Strips MongoDB operator keys ($gt, $ne, ...) and dotted keys from
// user-supplied objects so they can't be used for NoSQL query injection.
// Replaces express-mongo-sanitize, which is incompatible with Express 5.
const cleanObject = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    obj.forEach(cleanObject);
    return obj;
  }
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else {
      cleanObject(obj[key]);
    }
  }
  return obj;
};

export const sanitizeInput = (req, res, next) => {
  if (req.body) cleanObject(req.body);
  if (req.params) cleanObject(req.params);
  next();
};
