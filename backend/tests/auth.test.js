import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import adminRoutes from '../routes/adminRoutes.js';
import User from '../models/User.js';

vi.mock('../models/User.js');
vi.mock('../models/WalletTransaction.js');
vi.mock('../middleware/authMiddleware.js', () => ({
  protect: (req, res, next) => next(),
  admin: (req, res, next) => next()
}));
vi.mock('../utils/generateToken.js', () => ({
  default: () => 'mocked_token'
}));

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

describe('Admin Auth and Wallets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/admin/login rejects non-admin users', async () => {
    User.findOne.mockResolvedValue({
      _id: 'user1',
      role: 'user',
      matchPassword: vi.fn().mockResolvedValue(true)
    });

    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: 'test@test.com', password: 'password123' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('POST /api/admin/login accepts staff users', async () => {
    User.findOne.mockResolvedValue({
      _id: 'user1',
      role: 'admin',
      name: 'Admin',
      email: 'admin@test.com',
      matchPassword: vi.fn().mockResolvedValue(true)
    });

    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: 'admin@test.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe('mocked_token');
  });
});
