// Regression tests for the handover audit: money moves exactly once, the
// website checkout records what was paid for, and delivery endpoints are
// closed to anyone but the assigned delivery person. Real routes, real JWTs,
// real database — only the Razorpay network call is stubbed.

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import crypto from 'crypto';
import request from 'supertest';
import express from 'express';
import { connectTestDb, clearTestDb, closeTestDb } from './helpers/db.js';
import { makeUser, makeProduct } from './helpers/factories.js';
import generateToken from '../utils/generateToken.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import DeliveryStaff from '../models/DeliveryStaff.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import WalletTransaction from '../models/WalletTransaction.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-'.padEnd(64, 'x');
process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';

const razorpayFetch = vi.fn();
vi.mock('../utils/razorpay.js', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, razorpayClient: () => ({ orders: { fetch: razorpayFetch } }) };
});

const { default: userRoutes } = await import('../routes/userRoutes.js');
const { default: deliveryRoutes } = await import('../routes/deliveryRoutes.js');
const { default: checkoutRoutes } = await import('../routes/checkoutRoutes.js');
const { default: adminRoutes } = await import('../routes/adminRoutes.js');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/orders', checkoutRoutes);
app.use('/api/admin', adminRoutes);

const bearer = (id, role) => `Bearer ${generateToken(id, role)}`;
const sign = (orderId, paymentId) =>
  crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');

beforeAll(async () => { await connectTestDb(); }, 120000);
afterAll(async () => { await closeTestDb(); });
beforeEach(async () => {
  await clearTestDb();
  razorpayFetch.mockReset();
});

const cartBody = (product, extra = {}) => ({
  name: 'Guest Buyer',
  phone: '98200 11111',
  items: [
    { product: `${product._id}-1L`, quantity: 2, unit: '1 Litre' },
    { product: `${product._id}-500ml`, quantity: 1, unit: '500 ml' }
  ],
  shippingAddress: { address: '4 Palm Beach Road', city: 'Kharghar', postalCode: '410210' },
  deliverySlot: 'Evening',
  ...extra
});

describe('website checkout', () => {
  it('prices a cash-on-delivery cart on the server', async () => {
    const product = await makeProduct({ price: 68 });

    const res = await request(app).post('/api/orders/checkout').send(cartBody(product, { paymentMethod: 'COD' }));

    expect(res.statusCode).toBe(201);
    // 2 × ₹68 + 1 × ceil(68 / 2)
    expect(res.body.totalPrice).toBe(170);
    expect(res.body.isPaid).toBe(false);
    expect(res.body.paymentStatus).toBe('PENDING');
  });

  it('refuses an online order whose payment signature is wrong', async () => {
    const product = await makeProduct();
    const res = await request(app).post('/api/orders/checkout').send(cartBody(product, {
      paymentMethod: 'ONLINE',
      razorpay_order_id: 'order_1',
      razorpay_payment_id: 'pay_1',
      razorpay_signature: 'forged'
    }));

    expect(res.statusCode).toBe(400);
    expect(await Order.countDocuments()).toBe(0);
  });

  it('refuses an online order when the amount paid is not the cart total', async () => {
    const product = await makeProduct({ price: 68 });
    razorpayFetch.mockResolvedValue({ amount: 100, notes: { purpose: 'order' } }); // ₹1

    const res = await request(app).post('/api/orders/checkout').send(cartBody(product, {
      paymentMethod: 'ONLINE',
      razorpay_order_id: 'order_2',
      razorpay_payment_id: 'pay_2',
      razorpay_signature: sign('order_2', 'pay_2')
    }));

    expect(res.statusCode).toBe(400);
    expect(await Order.countDocuments()).toBe(0);
  });

  it('records a verified online payment once, and never twice', async () => {
    const product = await makeProduct({ price: 68 });
    razorpayFetch.mockResolvedValue({ amount: 17000, notes: { purpose: 'order' } });
    const body = cartBody(product, {
      paymentMethod: 'ONLINE',
      razorpay_order_id: 'order_3',
      razorpay_payment_id: 'pay_3',
      razorpay_signature: sign('order_3', 'pay_3')
    });

    const first = await request(app).post('/api/orders/checkout').send(body);
    expect(first.statusCode).toBe(201);
    expect(first.body.isPaid).toBe(true);

    const replay = await request(app).post('/api/orders/checkout').send(body);
    expect(replay.statusCode).toBe(400);
    expect(await Order.countDocuments()).toBe(1);
  });
});

describe('wallet top-up', () => {
  it('credits a payment once even when two verifies race', async () => {
    const user = await makeUser({ walletBalance: 0 });
    razorpayFetch.mockResolvedValue({ amount: 50000, notes: { purpose: 'wallet', userId: String(user._id) } });
    const body = { razorpay_order_id: 'order_w', razorpay_payment_id: 'pay_w', razorpay_signature: sign('order_w', 'pay_w') };

    await Promise.all([
      request(app).post('/api/users/wallet/recharge').set('Authorization', bearer(user._id, 'user')).send(body),
      request(app).post('/api/users/wallet/recharge').set('Authorization', bearer(user._id, 'user')).send(body)
    ]);

    expect((await User.findById(user._id)).walletBalance).toBe(500);
    expect(await WalletTransaction.countDocuments({ user: user._id })).toBe(1);
  });

  it('refuses a payment made for another customer', async () => {
    const user = await makeUser({ walletBalance: 0 });
    razorpayFetch.mockResolvedValue({ amount: 50000, notes: { purpose: 'wallet', userId: 'someone-else' } });

    const res = await request(app)
      .post('/api/users/wallet/recharge')
      .set('Authorization', bearer(user._id, 'user'))
      .send({ razorpay_order_id: 'o', razorpay_payment_id: 'p', razorpay_signature: sign('o', 'p') });

    expect(res.statusCode).toBe(400);
    expect((await User.findById(user._id)).walletBalance).toBe(0);
  });
});

describe('withdrawals', () => {
  it('debits the wallet once when a request is approved and then completed', async () => {
    const admin = await makeUser({ role: 'admin', email: 'admin@example.com' });
    const customer = await makeUser({ walletBalance: 1000 });
    const request_ = await WithdrawalRequest.create({ user: customer._id, amount: 300, refundMethod: 'UPI', upiId: 'x@upi' });
    const asAdmin = bearer(admin._id, 'admin');

    const approved = await request(app).put(`/api/admin/withdrawals/${request_._id}/status`).set('Authorization', asAdmin).send({ status: 'Approved' });
    expect(approved.statusCode).toBe(200);
    const completed = await request(app).put(`/api/admin/withdrawals/${request_._id}/status`).set('Authorization', asAdmin).send({ status: 'Completed' });
    expect(completed.statusCode).toBe(200);

    expect((await User.findById(customer._id)).walletBalance).toBe(700);
    expect(await WalletTransaction.countDocuments({ user: customer._id, type: 'debit' })).toBe(1);
  });

  it('accepts a bank-account withdrawal from the website', async () => {
    const customer = await makeUser({ walletBalance: 1000 });
    const res = await request(app)
      .post('/api/users/wallet/withdraw')
      .set('Authorization', bearer(customer._id, 'user'))
      .send({ amount: 100, refundMethod: 'Bank Account', bankDetails: { accountName: 'A', accountNumber: '123', ifscCode: 'SBIN0000001' } });

    expect(res.statusCode).toBe(201);
    expect(res.body.withdrawalRequest.refundMethod).toBe('Bank Account');
  });
});

describe('delivery endpoints', () => {
  let staff; let otherStaff; let customer; let order;

  beforeEach(async () => {
    staff = await DeliveryStaff.create({ staffId: 'S1', name: 'Ravi', phone: '9820000001', email: 'ravi@example.com', password: 'password1', area: 'Kharghar' });
    otherStaff = await DeliveryStaff.create({ staffId: 'S2', name: 'Amit', phone: '9820000002', email: 'amit@example.com', password: 'password1', area: 'Panvel' });
    customer = await makeUser({ walletBalance: 0 });
    order = await Order.create({
      user: customer._id,
      orderItems: [{ name: 'Milk', qty: 1, price: 68 }],
      totalPrice: 68,
      paymentMethod: 'COD',
      deliveryStaff: staff._id
    });
  });

  it('refuses a customer token', async () => {
    const res = await request(app)
      .put(`/api/delivery/orders/${order._id}/deliver`)
      .set('Authorization', bearer(customer._id, 'user'))
      .send({ cashCollected: true });

    expect(res.statusCode).toBe(403);
    expect((await Order.findById(order._id)).isDelivered).toBe(false);
  });

  it('refuses a delivery person the order is not assigned to', async () => {
    const res = await request(app)
      .put(`/api/delivery/orders/${order._id}/deliver`)
      .set('Authorization', bearer(otherStaff._id, 'delivery'))
      .send({});

    expect(res.statusCode).toBe(404);
  });

  it('keeps the proof photo and the cash collected', async () => {
    const res = await request(app)
      .put(`/api/delivery/orders/${order._id}/deliver`)
      .set('Authorization', bearer(staff._id, 'delivery'))
      .send({ proofImageUrl: 'https://img.example/proof.jpg', cashCollected: true });

    expect(res.statusCode).toBe(200);
    const saved = await Order.findById(order._id);
    expect(saved.isDelivered).toBe(true);
    expect(saved.proofOfDelivery).toBe('https://img.example/proof.jpg');
    expect(saved.isPaid).toBe(true);
  });

  it('keeps the reason a delivery failed', async () => {
    await request(app)
      .put(`/api/delivery/orders/${order._id}/fail`)
      .set('Authorization', bearer(staff._id, 'delivery'))
      .send({ reason: 'Door locked' });

    expect((await Order.findById(order._id)).failedReason).toBe('Door locked');
  });

  it('lets a delivery person report their own location', async () => {
    const res = await request(app)
      .put('/api/delivery/location')
      .set('Authorization', bearer(staff._id, 'delivery'))
      .send({ lat: 19.03, lng: 73.06 });

    expect(res.statusCode).toBe(200);
    expect((await DeliveryStaff.findById(staff._id)).location.lat).toBe(19.03);
  });
});
