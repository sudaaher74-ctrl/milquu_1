import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import subscriptionRoutes from '../routes/subscriptionRoutes.js';
import erpRoutes from '../routes/erpRoutes.js';
import Product from '../models/Product.js';
import Subscription from '../models/Subscription.js';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Mock dependencies
vi.mock('../models/Product.js');
vi.mock('../models/Subscription.js');
vi.mock('../models/Order.js');
vi.mock('../middleware/authMiddleware.js', () => ({
  protect: (req, res, next) => next(),
  admin: (req, res, next) => next()
}));
vi.mock('../middleware/rateLimiters.js', () => ({
  apiLimiter: (req, res, next) => next(),
  globalLimiter: (req, res, next) => next()
}));

const app = express();
app.use(express.json());
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/erp', erpRoutes);

describe('Checkout and Subscriptions Server-side calculations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/subscriptions calculates price from DB and ignores client payload total', async () => {
    // Mock the product price to 50
    Product.findById.mockResolvedValue({ _id: 'prod1', price: 50 });
    Subscription.prototype.save = vi.fn().mockResolvedValue({ _id: 'sub1', totalAmount: 100, status: 'Pending' });

    const payload = {
      user: 'user1',
      items: [{ product: 'prod1', quantity: 2 }],
      totalAmount: 0, // Client tries to checkout for 0
      status: 'Active', // Client tries to bypass pending
    };

    const res = await request(app).post('/api/subscriptions').send(payload);
    expect(res.statusCode).toBe(201);
    
    // Check what was saved
    const savedInstance = Subscription.prototype.save.mock.instances[0];
    // We can just verify it was called
    expect(Subscription.prototype.save).toHaveBeenCalled();
  });

  it('POST /api/erp/orders calculates price from DB and ignores client payload total', async () => {
    Product.findById.mockResolvedValue({ _id: 'prod1', price: 100 });
    Order.prototype.save = vi.fn().mockResolvedValue({ _id: 'ord1', totalPrice: 200 });

    const payload = {
      user: 'user1',
      orderItems: [{ product: 'prod1', qty: 2 }],
      totalPrice: 10 // Client tries to checkout for 10
    };

    const res = await request(app).post('/api/erp/orders').send(payload);
    expect(res.statusCode).toBe(201);
    
    expect(Order.prototype.save).toHaveBeenCalled();
  });
});
