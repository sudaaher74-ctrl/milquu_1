import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import erpRoutes from '../routes/erpRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Mock dependencies
const savedOrders = [];
vi.mock('../models/Order.js', () => {
  class MockOrder {
    constructor(doc) {
      Object.assign(this, doc);
    }
    save() {
      savedOrders.push(this);
      return Promise.resolve(this);
    }
  }
  MockOrder.find = vi.fn();
  MockOrder.findById = vi.fn();
  return { default: MockOrder };
});
vi.mock('../models/Product.js');
vi.mock('../models/User.js');
vi.mock('../models/Purchase.js');
vi.mock('../models/Expense.js');
vi.mock('../models/Procurement.js');
vi.mock('../models/Wastage.js');
vi.mock('../models/Subscription.js');
vi.mock('../models/DeliveryStaff.js');

vi.mock('../middleware/authMiddleware.js', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'admin1', role: 'admin' };
    next();
  },
  admin: (req, res, next) => next()
}));

vi.mock('../middleware/rateLimiters.js', () => ({
  apiLimiter: (req, res, next) => next(),
  globalLimiter: (req, res, next) => next()
}));

const app = express();
app.use(express.json());
app.use('/api/erp', erpRoutes);
app.use('/api/admin', adminRoutes);

describe('Shop POS Credit & Billing System (10, 15, 30 Days)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    savedOrders.length = 0;
  });

  it('POST /api/erp/orders creates a credit order with calculated due date and pending payment status', async () => {
    Product.findById.mockResolvedValue({ _id: 'prod1', price: 60 });
    User.findByIdAndUpdate.mockResolvedValue({});

    const res = await request(app).post('/api/erp/orders').send({
      user: 'user123',
      name: 'Ramesh Patil',
      phone: '9876543210',
      orderSource: 'POS',
      paymentMethod: 'Credit',
      billingCycle: '10 Days',
      orderItems: [{ product: 'prod1', qty: 2 }]
    });

    expect(res.statusCode).toBe(201);
    expect(savedOrders).toHaveLength(1);
    const savedDoc = savedOrders[0];
    expect(savedDoc.isPaid).toBe(false);
    expect(savedDoc.paymentStatus).toBe('PENDING');
    expect(savedDoc.billingCycle).toBe('10 Days');
    expect(savedDoc.creditDueDate).toBeDefined();

    // Verify creditDueDate is ~10 days in the future
    const now = Date.now();
    const dueTime = new Date(savedDoc.creditDueDate).getTime();
    const diffDays = Math.round((dueTime - now) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(10);
  });

  it('GET /api/erp/credit-customers aggregates unpaid POS credit orders into customer ledgers', async () => {
    const mockUnpaidOrders = [
      {
        _id: 'ord1',
        user: 'user123',
        name: 'Ramesh Patil',
        phone: '9876543210',
        totalPrice: 120,
        createdAt: new Date('2026-09-20'),
        creditDueDate: new Date('2026-09-30'),
        billingCycle: '10 Days',
        orderItems: [{ name: 'A2 Milk', qty: 2, price: 60 }]
      },
      {
        _id: 'ord2',
        user: 'user123',
        name: 'Ramesh Patil',
        phone: '9876543210',
        totalPrice: 180,
        createdAt: new Date('2026-09-22'),
        creditDueDate: new Date('2026-10-02'),
        billingCycle: '10 Days',
        orderItems: [{ name: 'Buffalo Milk', qty: 2, price: 90 }]
      }
    ];

    Order.find.mockReturnValue({
      populate: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue(mockUnpaidOrders)
        })
      })
    });

    User.find.mockReturnValue({
      lean: vi.fn().mockResolvedValue([
        {
          _id: 'user123',
          name: 'Ramesh Patil',
          phone: '9876543210',
          billingCycle: '10 Days',
          isCreditCustomer: true
        }
      ])
    });

    const res = await request(app).get('/api/erp/credit-customers');
    expect(res.statusCode).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(res.body.summary.totalCreditOutstanding).toBe(300);
    expect(res.body.customers).toHaveLength(1);

    const cust = res.body.customers[0];
    expect(cust.name).toBe('Ramesh Patil');
    expect(cust.totalDue).toBe(300);
    expect(cust.unpaidCount).toBe(2);
    expect(cust.billingCycle).toBe('10 Days');
  });

  it('POST /api/erp/credit-customers/:id/settle settles unpaid orders', async () => {
    const mockOrder = {
      _id: 'ord1',
      totalPrice: 100,
      isPaid: false,
      save: vi.fn().mockResolvedValue(true)
    };

    Order.find.mockReturnValue({
      sort: vi.fn().mockResolvedValue([mockOrder])
    });

    const res = await request(app)
      .post('/api/erp/credit-customers/user123/settle')
      .send({ amount: 100, paymentMethod: 'UPI' });

    expect(res.statusCode).toBe(200);
    expect(mockOrder.isPaid).toBe(true);
    expect(mockOrder.paymentStatus).toBe('PAID');
    expect(mockOrder.creditSettledMethod).toBe('UPI');
    expect(mockOrder.save).toHaveBeenCalled();
  });

  it('PUT /api/admin/customers/:id updates customer billing cycle (15 to 30 days)', async () => {
    const mockCustomer = {
      _id: 'cust1',
      name: 'Pooja Sharma',
      billingCycle: '15 Days',
      isCreditCustomer: true,
      save: vi.fn().mockResolvedValue(true)
    };

    User.findById.mockResolvedValue(mockCustomer);

    const res = await request(app)
      .put('/api/admin/customers/cust1')
      .send({ billingCycle: '30 Days', creditLimit: 5000 });

    expect(res.statusCode).toBe(200);
    expect(mockCustomer.billingCycle).toBe('30 Days');
    expect(mockCustomer.creditLimit).toBe(5000);
    expect(mockCustomer.save).toHaveBeenCalled();
  });
});
