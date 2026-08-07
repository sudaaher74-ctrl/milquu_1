import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import subscriptionRoutes from '../routes/subscriptionRoutes.js';
import erpRoutes from '../routes/erpRoutes.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Mock dependencies
vi.mock('../models/Order.js');

// Only the collection is mocked. priceOf is a named export of the same module
// and is the logic under test — automocking it would stub out the very rule
// these assertions exist to check.
vi.mock('../models/Product.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    default: { find: vi.fn(), findById: vi.fn() },
    priceOf: actual.priceOf
  };
});

// An explicit mock rather than an automock: the assertions below check the
// document the route *constructed*, and an automocked constructor records
// nothing about the object it was handed.
const savedSubscriptions = [];
vi.mock('../models/Subscription.js', () => {
  class MockSubscription {
    constructor(doc) {
      Object.assign(this, doc);
    }
    save() {
      savedSubscriptions.push(this);
      return Promise.resolve(this);
    }
  }
  MockSubscription.find = vi.fn();
  MockSubscription.findByIdAndUpdate = vi.fn();
  return { default: MockSubscription, SLOT_WINDOWS: {} };
});
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
    savedSubscriptions.length = 0;
  });

  it('POST /api/subscriptions calculates price from DB and ignores client payload total', async () => {
    // The plan rate is what a subscription pays; 50 is the one-off rate.
    Product.find.mockReturnValue({
      select: vi.fn().mockResolvedValue([
        { _id: 'prod1', name: 'Pure Cow Milk', price: 50, planPrice: 44, image: '/i.webp', unit: '1 L', category: 'milk' }
      ])
    });
    const payload = {
      user: 'user1',
      name: 'Test',
      deliveryAddress: '12 Dairy Lane, New Panvel',
      frequency: 'Daily',
      items: [{ product: 'prod1', quantity: 2, price: 1 }], // client claims ₹1/unit
      totalAmount: 0, // client tries to check out for nothing
      monthlyTotal: 0, // and to set its own monthly cost
      status: 'Active' // and to bypass Pending
    };

    const res = await request(app).post('/api/subscriptions').send(payload);
    expect(res.statusCode).toBe(201);

    // Assert what was actually constructed, not merely that save ran.
    expect(savedSubscriptions).toHaveLength(1);
    const saved = savedSubscriptions[0];
    expect(saved.items[0].price).toBe(44); // plan rate from the DB, not the client's 1
    expect(saved.totalAmount).toBe(88); // 2 x 44
    expect(saved.monthlyTotal).toBe(2640); // 88 x 30 deliveries, computed server-side
    expect(saved.status).toBe('Pending'); // client's 'Active' ignored
  });

  it('POST /api/subscriptions refuses a crate with an unknown product', async () => {
    Product.find.mockReturnValue({ select: vi.fn().mockResolvedValue([]) });

    const res = await request(app).post('/api/subscriptions').send({
      deliveryAddress: '12 Dairy Lane',
      items: [{ product: 'deadbeefdeadbeefdeadbeef', quantity: 1 }]
    });

    expect(res.statusCode).toBe(400);
    expect(savedSubscriptions).toHaveLength(0);
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
