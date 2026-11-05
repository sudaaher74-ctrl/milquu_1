import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import erpRoutes from '../routes/erpRoutes.js';
import Financier from '../models/Financier.js';
import FinancierTransaction from '../models/FinancierTransaction.js';
import Order from '../models/Order.js';
import Purchase from '../models/Purchase.js';
import VendorPayment from '../models/VendorPayment.js';

// In-memory mock storage
let savedFinanciers = [];
let savedTransactions = [];

vi.mock('../models/Financier.js', () => {
  class MockFinancier {
    constructor(doc) {
      this._id = doc._id || `fin_${Date.now()}_${Math.random()}`;
      Object.assign(this, doc);
    }
    save() {
      const idx = savedFinanciers.findIndex(f => f._id.toString() === this._id.toString());
      if (idx >= 0) {
        savedFinanciers[idx] = this;
      } else {
        savedFinanciers.push(this);
      }
      return Promise.resolve(this);
    }
  }
  MockFinancier.find = vi.fn().mockImplementation(() => ({
    sort: () => ({
      lean: () => Promise.resolve(savedFinanciers)
    })
  }));
  MockFinancier.findById = vi.fn().mockImplementation((id) => {
    const f = savedFinanciers.find(item => item._id.toString() === id.toString());
    return Promise.resolve(f || null);
  });
  MockFinancier.findOne = vi.fn().mockImplementation(({ name }) => {
    const f = savedFinanciers.find(item => item.name.toLowerCase() === (name?.source || name || '').toLowerCase());
    return Promise.resolve(f || null);
  });
  MockFinancier.findByIdAndDelete = vi.fn().mockImplementation((id) => {
    savedFinanciers = savedFinanciers.filter(f => f._id.toString() !== id.toString());
    return Promise.resolve({ _id: id });
  });
  return { default: MockFinancier };
});

vi.mock('../models/FinancierTransaction.js', () => {
  class MockTransaction {
    constructor(doc) {
      this._id = doc._id || `txn_${Date.now()}_${Math.random()}`;
      Object.assign(this, doc);
    }
    save() {
      savedTransactions.push(this);
      return Promise.resolve(this);
    }
  }
  MockTransaction.find = vi.fn().mockImplementation(() => ({
    sort: () => ({
      limit: () => ({
        lean: () => Promise.resolve(savedTransactions.slice(-5))
      }),
      lean: () => Promise.resolve(savedTransactions)
    })
  }));
  MockTransaction.findById = vi.fn().mockImplementation((id) => {
    const t = savedTransactions.find(item => item._id.toString() === id.toString());
    return Promise.resolve(t || null);
  });
  MockTransaction.countDocuments = vi.fn().mockImplementation(({ financier }) => {
    return Promise.resolve(savedTransactions.filter(t => t.financier.toString() === financier.toString()).length);
  });
  MockTransaction.findByIdAndDelete = vi.fn().mockImplementation((id) => {
    savedTransactions = savedTransactions.filter(t => t._id.toString() !== id.toString());
    return Promise.resolve({ _id: id });
  });
  return { default: MockTransaction };
});

vi.mock('../models/Order.js', () => ({
  default: {
    aggregate: vi.fn().mockResolvedValue([{ totalDue: 45000 }])
  }
}));

vi.mock('../models/Purchase.js', () => ({
  default: {
    find: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null)
  }
}));

vi.mock('../models/VendorPayment.js', () => ({
  default: {
    findByIdAndDelete: vi.fn().mockResolvedValue({})
  }
}));

vi.mock('../utils/audit.js', () => ({
  recordAudit: vi.fn().mockResolvedValue({})
}));

vi.mock('../middleware/authMiddleware.js', async (importOriginal) => ({
  ...(await importOriginal()),
  protect: (req, res, next) => {
    req.user = { _id: 'admin_test', name: 'Admin Test', role: 'admin' };
    next();
  },
  managerUp: (req, res, next) => next(),
  staffUp: (req, res, next) => next()
}));

const app = express();
app.use(express.json());
app.use('/api/erp', erpRoutes);

describe('Financier Khata & Repayment System', () => {
  beforeEach(() => {
    savedFinanciers = [];
    savedTransactions = [];
    vi.clearAllMocks();
  });

  it('creates a new financier profile', async () => {
    const res = await request(app)
      .post('/api/erp/financiers')
      .send({
        name: 'Rajesh Patel',
        phone: '9876543210',
        email: 'rajesh@example.com',
        notes: 'Milk procurement financing'
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Rajesh Patel');
    expect(res.body.phone).toBe('9876543210');
    expect(savedFinanciers.length).toBe(1);
    expect(savedFinanciers[0].totalFinanced).toBe(0);
    expect(savedFinanciers[0].currentOutstanding).toBe(0);
  });

  it('rejects creating a financier without a name', async () => {
    const res = await request(app)
      .post('/api/erp/financiers')
      .send({ phone: '9876543210' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Financier name is required');
  });

  it('records milk bill financed by financier (+), updating totalFinanced & currentOutstanding', async () => {
    const fin = new Financier({
      _id: 'fin_1',
      name: 'Rajesh Patel',
      phone: '9876543210',
      totalFinanced: 0,
      totalRepaid: 0,
      currentOutstanding: 0
    });
    savedFinanciers.push(fin);

    const res = await request(app)
      .post('/api/erp/financiers/transaction')
      .send({
        financierId: 'fin_1',
        type: 'FINANCED',
        amount: 25000,
        paymentMode: 'Bank Transfer',
        reference: 'UTR123456',
        linkedVendor: 'Sangamner Milk Chilling',
        notes: 'Morning cow milk bill paid'
      });

    expect(res.status).toBe(201);
    expect(res.body.transaction.amount).toBe(25000);
    expect(res.body.transaction.type).toBe('FINANCED');
    expect(res.body.financier.totalFinanced).toBe(25000);
    expect(res.body.financier.currentOutstanding).toBe(25000);
    expect(savedTransactions.length).toBe(1);
  });

  it('records lump-sum repayment to financier (-), reducing currentOutstanding', async () => {
    const fin = new Financier({
      _id: 'fin_1',
      name: 'Rajesh Patel',
      phone: '9876543210',
      totalFinanced: 50000,
      totalRepaid: 10000,
      currentOutstanding: 40000
    });
    savedFinanciers.push(fin);

    const res = await request(app)
      .post('/api/erp/financiers/transaction')
      .send({
        financierId: 'fin_1',
        type: 'REPAYMENT',
        amount: 15000,
        paymentMode: 'UPI',
        reference: 'UPI987654',
        notes: 'Lump-sum return from customer collections'
      });

    expect(res.status).toBe(201);
    expect(res.body.transaction.amount).toBe(15000);
    expect(res.body.transaction.type).toBe('REPAYMENT');
    expect(res.body.financier.totalRepaid).toBe(25000);
    expect(res.body.financier.currentOutstanding).toBe(25000); // 50,000 - 25,000
  });

  it('fetches summary with metrics and customer credit comparison', async () => {
    savedFinanciers.push(
      new Financier({
        _id: 'fin_1',
        name: 'Rajesh Patel',
        totalFinanced: 60000,
        totalRepaid: 20000,
        currentOutstanding: 40000
      })
    );

    const res = await request(app).get('/api/erp/financiers');

    expect(res.status).toBe(200);
    expect(res.body.financiers.length).toBe(1);
    expect(res.body.metrics.totalFinancedAll).toBe(60000);
    expect(res.body.metrics.totalRepaidAll).toBe(20000);
    expect(res.body.metrics.totalOutstandingAll).toBe(40000);
    expect(res.body.metrics.totalCustomerCredit).toBe(45000);
    expect(res.body.metrics.workingCapitalGap).toBe(5000); // 45,000 - 40,000 = +5,000 surplus
  });

  it('deletes/voids a transaction and reverts financier balances', async () => {
    const fin = new Financier({
      _id: 'fin_1',
      name: 'Rajesh Patel',
      totalFinanced: 30000,
      totalRepaid: 10000,
      currentOutstanding: 20000
    });
    savedFinanciers.push(fin);

    const txn = new FinancierTransaction({
      _id: 'txn_1',
      transactionId: 'FTX-999999',
      financier: 'fin_1',
      financierName: 'Rajesh Patel',
      type: 'FINANCED',
      amount: 10000
    });
    savedTransactions.push(txn);

    const res = await request(app).delete('/api/erp/financiers/transaction/txn_1');

    expect(res.status).toBe(200);
    expect(res.body.financier.totalFinanced).toBe(20000); // 30,000 - 10,000
    expect(res.body.financier.currentOutstanding).toBe(10000); // 20,000 - 10,000
    expect(savedTransactions.length).toBe(0);
  });
});

