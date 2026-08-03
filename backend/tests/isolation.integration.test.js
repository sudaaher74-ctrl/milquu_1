// Acceptance criterion 11: two customers, one browser. Each must see only
// their own plan, wallet and orders.
//
// This drives the real Express routes with real JWTs against a real database —
// mocking `protect` would test nothing, since the whole question is whether the
// token's identity actually scopes the queries.

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { connectTestDb, clearTestDb, closeTestDb } from './helpers/db.js';
import { makeUser, makeProduct, makeSubscription } from './helpers/factories.js';
import userRoutes from '../routes/userRoutes.js';
import generateToken from '../utils/generateToken.js';
import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';
import WalletTransaction from '../models/WalletTransaction.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-'.padEnd(64, 'x');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

const as = (user) => `Bearer ${generateToken(user._id, 'user')}`;

beforeAll(async () => { await connectTestDb(); }, 120000);
afterAll(async () => { await closeTestDb(); });
beforeEach(async () => { await clearTestDb(); });

describe('criterion 11: one customer cannot see or touch another\'s data', () => {
  let alice; let bob; let product; let aliceSub; let bobSub;

  beforeEach(async () => {
    product = await makeProduct();
    alice = await makeUser({ name: 'Alice', walletBalance: 900 });
    bob = await makeUser({ name: 'Bob', walletBalance: 100 });
    aliceSub = await makeSubscription(alice, product, { quantity: 2 });
    bobSub = await makeSubscription(bob, product, { quantity: 1 });

    await Order.create({
      user: alice._id, name: 'Alice', orderItems: [{ name: 'Pure Cow Milk', qty: 2, image: '/i.webp', price: 60, product: product._id }],
      paymentMethod: 'Wallet', totalPrice: 120, orderSource: 'App'
    });
    await WalletTransaction.create({
      user: alice._id, amount: 120, type: 'debit', description: 'Alice delivery', balanceAfter: 780
    });
  });

  it('lists only the signed-in customer\'s subscriptions', async () => {
    const res = await request(app).get('/api/users/subscriptions').set('Authorization', as(bob));

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]._id).toBe(bobSub._id.toString());
  });

  it('lists only the signed-in customer\'s orders', async () => {
    const res = await request(app).get('/api/users/orders').set('Authorization', as(bob));

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(0); // Alice's order must not leak through
  });

  it('returns only the signed-in customer\'s wallet and ledger', async () => {
    const res = await request(app).get('/api/users/wallet').set('Authorization', as(bob));

    expect(res.body.walletBalance).toBe(100);
    expect(res.body.transactions).toHaveLength(0);
  });

  it('refuses to update another customer\'s subscription', async () => {
    const res = await request(app)
      .put(`/api/users/subscriptions/${aliceSub._id}`)
      .set('Authorization', as(bob))
      .send({ items: [{ product: product._id.toString(), quantity: 20 }] });

    expect(res.statusCode).toBe(404);

    const untouched = await Subscription.findById(aliceSub._id);
    expect(untouched.items[0].quantity).toBe(2);
  });

  it('refuses to skip a day on another customer\'s subscription', async () => {
    const res = await request(app)
      .post(`/api/users/subscriptions/${aliceSub._id}/skip`)
      .set('Authorization', as(bob))
      .send({ date: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString() });

    expect(res.statusCode).toBe(404);
    expect((await Subscription.findById(aliceSub._id)).skipDates).toHaveLength(0);
  });

  it('refuses to pause another customer\'s subscription', async () => {
    const from = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString();
    const res = await request(app)
      .post(`/api/users/subscriptions/${aliceSub._id}/pause`)
      .set('Authorization', as(bob))
      .send({ from, to: from });

    expect(res.statusCode).toBe(404);
    expect((await Subscription.findById(aliceSub._id)).pauseStartDate).toBeUndefined();
  });

  it('refuses to cancel another customer\'s subscription', async () => {
    const res = await request(app)
      .put(`/api/users/subscriptions/${aliceSub._id}/status`)
      .set('Authorization', as(bob))
      .send({ status: 'Cancelled' });

    expect(res.statusCode).toBe(401);
    expect((await Subscription.findById(aliceSub._id)).status).toBe('Active');
  });

  it('rejects a request with no token at all', async () => {
    expect((await request(app).get('/api/users/subscriptions')).statusCode).toBe(401);
  });
});

describe('creating a plan is scoped and priced by the server', () => {
  it('creates the plan against the signed-in customer and their saved address', async () => {
    const product = await makeProduct();
    const alice = await makeUser({ name: 'Alice' });

    const res = await request(app)
      .post('/api/users/subscriptions')
      .set('Authorization', as(alice))
      .send({
        items: [{ product: product._id.toString(), quantity: 2 }],
        frequency: 'daily',
        slotWindow: 'early'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toBe(alice._id.toString());
    // Plan rate from the DB, and totals computed server-side.
    expect(res.body.items[0].price).toBe(60);
    expect(res.body.dailyTotal).toBe(120);
    expect(res.body.monthlyTotal).toBe(3600);
    // Address comes from the profile, and the legacy fields stay populated.
    expect(res.body.deliveryArea).toBe('new-panvel');
    expect(res.body.deliveryAddress).toContain('New Panvel');
    expect(res.body.frequency).toBe('Daily');
    expect(res.body.deliverySlot).toBe('Morning');
  });

  it('ignores any price the client tries to set', async () => {
    const product = await makeProduct();
    const alice = await makeUser();

    const res = await request(app)
      .post('/api/users/subscriptions')
      .set('Authorization', as(alice))
      .send({
        items: [{ product: product._id.toString(), quantity: 1, price: 1 }],
        totalAmount: 1,
        monthlyTotal: 1,
        frequency: 'daily'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.items[0].price).toBe(60);
    expect(res.body.totalAmount).toBe(60);
    expect(res.body.monthlyTotal).toBe(1800);
  });

  it('refuses a plan when the customer has no serviceable address', async () => {
    const product = await makeProduct();
    const nomad = await makeUser({ deliveryAddress: undefined });

    const res = await request(app)
      .post('/api/users/subscriptions')
      .set('Authorization', as(nomad))
      .send({ items: [{ product: product._id.toString(), quantity: 1 }], frequency: 'daily' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/delivery address/i);
  });

  it('refuses an address in an area we do not serve (criterion 4)', async () => {
    const alice = await makeUser();

    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', as(alice))
      .send({ deliveryAddress: { line1: '1 Far Away', area: 'mumbai-central' } });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/do not deliver/i);
  });

  it('saves a New Panvel address and reports the area back (criterion 3)', async () => {
    const alice = await makeUser({ deliveryAddress: undefined });

    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', as(alice))
      .send({ deliveryAddress: { line1: '9 Palm Beach Road', label: 'Home', area: 'new-panvel' } });

    expect(res.statusCode).toBe(200);
    expect(res.body.deliveryAddress.area).toBe('new-panvel');
    // The legacy single-line address stays in step for the storefront and the
    // delivery lists that still read it.
    expect(res.body.address).toBe('9 Palm Beach Road');
  });
});

describe('criteria 1 and 2: register with a phone number, then sign back in', () => {
  it('registers, signs out and signs back in with the phone number', async () => {
    const register = await request(app).post('/api/users/register').send({
      name: 'New Customer',
      phone: '+91 98111 22333',
      password: 'passwor1'
    });

    expect(register.statusCode).toBe(201);
    expect(register.body.token).toBeTruthy();
    expect(register.body.phone).toBe('9811122333');

    // Signing back in with a differently formatted version of the same number.
    const login = await request(app).post('/api/users/login').send({
      identifier: '09811122333',
      password: 'passwor1'
    });

    expect(login.statusCode).toBe(200);
    expect(login.body._id).toBe(register.body._id);
  });

  it('rejects a duplicate phone number with a 400, not a 500', async () => {
    const body = { name: 'Ab', phone: '9811122444', password: 'passwor1' };
    await request(app).post('/api/users/register').send(body);
    const second = await request(app).post('/api/users/register').send(body);

    expect(second.statusCode).toBe(400);
    expect(second.body.message).toMatch(/already exists/i);
  });

  it('rejects a short password with a field-level 400 (the old 500)', async () => {
    const res = await request(app).post('/api/users/register').send({
      name: 'Ab', phone: '9811122555', password: 'short1'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].path).toBe('password');
  });

  it('accepts an 8-character password that the old schema/model gap rejected', async () => {
    const res = await request(app).post('/api/users/register').send({
      name: 'Ab', phone: '9811122666', password: 'passwor1'
    });

    expect(res.statusCode).toBe(201);
  });
});
