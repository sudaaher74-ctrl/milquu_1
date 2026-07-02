import jwt from 'jsonwebtoken';

const generateToken = (id, role = 'user') => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Refusing to issue tokens without a secret.');
  }
  const expiresIn = ['admin', 'manager', 'staff', 'superadmin'].includes(role) ? '1d' : '30d';
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

export default generateToken;
