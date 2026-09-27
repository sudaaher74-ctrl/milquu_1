// Admin panel: role-based access, staff accounts, the morning summary,
// business settings, the audit log, area assignment and paginated lists.
// Real routes, real JWTs, real database.

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { connectTestDb, clearTestDb, closeTestDb } from './helpers/db.js';
import { makeUser, makeProduct, makeSubscription } from './helpers/factories.js';
import generateToken from '../utils/generateToken.js';
import adminRoutes from '../routes/adminRoutes.js';
import erpRoutes from '../routes/erpRoutes.js';
import subscriptionRoutes from '../routes/subscriptionRoutes.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';
import DeliveryStaff from '../models/DeliveryStaff.js';
import AuditLog from '../models/AuditLog.js';
import { istTomorrow, istStartOfDay } from '../utils/ist.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-'.padEnd(64, 'x');

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);
app.use('/api/erp', erpRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

const as = (user) => `Bearer ${generateToken(user._id, user.role)}`;
let counter = 0;
const employee = (role, extra = {}) => {
  counter += 1;
  return User.create({ name: `${role} ${counter}`, email: `${role}${counter}@example.com`, password: 'password1', role, ...extra });
};

beforeAll(async () => { await connectTestDb(); }, 120000);
afterAll(async () => { await closeTestDb(); });
beforeEach(async () => { await clearTestDb(); });

describe('role-based access', () => {
  it('lets counter staff use POS endpoints but not finance or admin ones', async () => {
    const staff = await employee('staff');

    expect((await request(app).get('/api/admin/today').set('Authorization', as(staff))).statusCode).toBe(200);
    expect((await request(app).get('/api/erp/credit-customers').set('Authorization', as(staff))).statusCode).toBe(200);
    expect((await request(app).get('/api/erp/purchases').set('Authorization', as(staff))).statusCode).toBe(403);
    expect((await request(app).get('/api/erp/analytics').set('Authorization', as(staff))).statusCode).toBe(403);
    expect((await request(app).get('/api/admin/withdrawals').set('Authorization', as(staff))).statusCode).toBe(403);
  });

  it('lets managers run the business but not manage staff or money out', async () => {
    const manager = await employee('manager');

    expect((await request(app).get('/api/erp/purchases').set('Authorization', as(manager))).statusCode).toBe(200);
    expect((await request(app).get('/api/erp/analytics').set('Authorization', as(manager))).statusCode).toBe(200);
    expect((await request(app).get('/api/admin/employees').set('Authorization', as(manager))).statusCode).toBe(403);
    expect((await request(app).post('/api/admin/wallets/transaction').set('Authorization', as(manager)).send({})).statusCode).toBe(403);
  });

  it('refuses customers everywhere in the admin panel', async () => {
    const customer = await makeUser();
    expect((await request(app).get('/api/admin/today').set('Authorization', as(customer))).statusCode).toBe(403);
  });

  it('treats superadmin as an admin', async () => {
    const superadmin = await employee('superadmin');
    expect((await request(app).get('/api/admin/employees').set('Authorization', as(superadmin))).statusCode).toBe(200);
  });
});

describe('staff accounts', () => {
  it('creates an employee who can then sign in, and records it', async () => {
    const admin = await employee('admin');
    const res = await request(app)
      .post('/api/admin/employees')
      .set('Authorization', as(admin))
      .send({ name: 'Counter Ravi', email: 'Ravi@Example.com', password: 'counter123', role: 'staff' });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe('ravi@example.com');
    const login = await request(app).post('/api/admin/login').send({ email: 'ravi@example.com', password: 'counter123' });
    expect(login.statusCode).toBe(200);
    expect(login.body.role).toBe('staff');
    expect(await AuditLog.countDocuments({ action: 'employee.create' })).toBe(1);
  });

  it('signs a deactivated employee out immediately and blocks their login', async () => {
    const admin = await employee('admin');
    const staff = await employee('staff');

    const res = await request(app).put(`/api/admin/employees/${staff._id}`).set('Authorization', as(admin)).send({ isActive: false });
    expect(res.statusCode).toBe(200);

    expect((await request(app).get('/api/admin/today').set('Authorization', as(staff))).statusCode).toBe(401);
    const login = await request(app).post('/api/admin/login').send({ email: staff.email, password: 'password1' });
    expect(login.statusCode).toBe(403);
  });

  it('never leaves the business without an active admin', async () => {
    const onlyAdmin = await employee('admin');
    const res = await request(app).put(`/api/admin/employees/${onlyAdmin._id}`).set('Authorization', as(onlyAdmin)).send({ role: 'staff' });
    expect(res.statusCode).toBe(400);

    const other = await employee('admin');
    const demote = await request(app).put(`/api/admin/employees/${other._id}`).set('Authorization', as(onlyAdmin)).send({ role: 'manager' });
    expect(demote.statusCode).toBe(200);
    const lastOne = await request(app).put(`/api/admin/employees/${onlyAdmin._id}`).set('Authorization', as(onlyAdmin)).send({ isActive: false });
    expect(lastOne.statusCode).toBe(400); // cannot deactivate yourself either
  });

  it('only lets a superadmin create a superadmin', async () => {
    const admin = await employee('admin');
    const res = await request(app)
      .post('/api/admin/employees')
      .set('Authorization', as(admin))
      .send({ name: 'Boss', email: 'boss@example.com', password: 'bosspass1', role: 'superadmin' });
    expect(res.statusCode).toBe(403);
  });
});

describe('the morning summary', () => {
  it('reports the round, auto-paused plans and overdue khata', async () => {
    const staff = await employee('staff');
    const product = await makeProduct();
    const customer = await makeUser({ walletBalance: 10 });
    await makeSubscription(customer, product, { status: 'Paused', pausedReason: 'insufficient_balance' });
    await makeSubscription(await makeUser(), product); // active, no delivery person

    const today = istStartOfDay();
    await Order.create({ orderItems: [{ name: 'Milk', qty: 1, price: 60 }], totalPrice: 60, scheduledDeliveryDate: today, isPaid: true });
    await Order.create({ orderItems: [{ name: 'Milk', qty: 1, price: 60 }], totalPrice: 60, scheduledDeliveryDate: today, isPaid: true, isDelivered: true });
    await Order.create({
      orderItems: [{ name: 'Milk', qty: 2, price: 60 }], totalPrice: 120, orderSource: 'POS', paymentMethod: 'Credit',
      isPaid: false, creditPaidAmount: 20, creditDueDate: new Date(Date.now() - 86400000), name: 'Shop Customer'
    });

    const res = await request(app).get('/api/admin/today').set('Authorization', as(staff));

    expect(res.statusCode).toBe(200);
    expect(res.body.round).toMatchObject({ total: 2, delivered: 1, pending: 1, unassigned: 1 });
    expect(res.body.autoPaused.count).toBe(1);
    expect(res.body.autoPaused.items[0].walletBalance).toBe(10);
    expect(res.body.unassignedPlans).toBe(1);
    expect(res.body.overdueKhata).toMatchObject({ bills: 1, outstanding: 100 });
    // Refund totals are for admins only
    expect(res.body.refunds).toBeNull();
  });
});

describe('business settings', () => {
  it('starts from the real business details and records edits', async () => {
    const admin = await employee('admin');
    const read = await request(app).get('/api/admin/settings').set('Authorization', as(admin));
    expect(read.body.business.supportPhone).toBe('+91 87670 67884');
    expect(read.body.systemRules.planChangeCutoff).toMatch(/9:00 pm/);

    const saved = await request(app).put('/api/admin/settings').set('Authorization', as(admin)).send({ gstin: '27abcde1234f1z5', address: 'New Panvel' });
    expect(saved.statusCode).toBe(200);
    expect(saved.body.business.gstin).toBe('27ABCDE1234F1Z5');
    expect(await AuditLog.countDocuments({ action: 'settings.update' })).toBe(1);
  });

  it('rejects a malformed GSTIN', async () => {
    const admin = await employee('admin');
    const res = await request(app).put('/api/admin/settings').set('Authorization', as(admin)).send({ gstin: '123' });
    expect(res.statusCode).toBe(400);
  });

  it('is readable but not editable by staff', async () => {
    const staff = await employee('staff');
    expect((await request(app).get('/api/admin/settings').set('Authorization', as(staff))).statusCode).toBe(200);
    expect((await request(app).put('/api/admin/settings').set('Authorization', as(staff)).send({ tagline: 'x' })).statusCode).toBe(403);
  });
});

describe('audit log', () => {
  it('records a manual wallet credit with who did it, and lists it newest first', async () => {
    const admin = await employee('admin');
    const customer = await makeUser({ name: 'Asha', walletBalance: 0 });
    await request(app).post('/api/admin/wallets/transaction').set('Authorization', as(admin))
      .send({ userId: customer._id, amount: 150, type: 'credit', description: 'Goodwill' });

    const res = await request(app).get('/api/admin/audit-logs?search=Asha').set('Authorization', as(admin));
    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.logs[0]).toMatchObject({ action: 'wallet.credit', actorName: admin.name });
    expect(res.body.logs[0].summary).toContain('₹150');
  });
});

describe('assigning a delivery person to an area', () => {
  it('gives them the unassigned plans there and those plans’ upcoming orders', async () => {
    const manager = await employee('manager');
    const product = await makeProduct();
    const staff = await DeliveryStaff.create({ staffId: 'D1', name: 'Ravi', phone: '9820000001', email: 'ravi@d.com', password: 'password1', area: 'Old' });
    const inArea = await makeSubscription(await makeUser(), product, { deliveryArea: 'kharghar' });
    const elsewhere = await makeSubscription(await makeUser(), product, { deliveryArea: 'panvel' });
    const order = await Order.create({
      subscription: inArea._id, orderItems: [{ name: 'Milk', qty: 1, price: 60 }], totalPrice: 60,
      scheduledDeliveryDate: istTomorrow(), isPaid: true
    });

    const res = await request(app)
      .post(`/api/erp/delivery-staff/${staff._id}/assign-area`)
      .set('Authorization', as(manager))
      .send({ area: 'kharghar' });

    expect(res.statusCode).toBe(200);
    expect(res.body.plansAssigned).toBe(1);
    expect(String((await Subscription.findById(inArea._id)).assignedStaff)).toBe(String(staff._id));
    expect((await Subscription.findById(elsewhere._id)).assignedStaff).toBeUndefined();
    expect(String((await Order.findById(order._id)).deliveryStaff)).toBe(String(staff._id));
    expect((await DeliveryStaff.findById(staff._id)).area).toBe('Kharghar');
  });

  it('rejects an area Milquu does not deliver to', async () => {
    const manager = await employee('manager');
    const staff = await DeliveryStaff.create({ staffId: 'D2', name: 'Amit', phone: '9820000002', email: 'amit@d.com', password: 'password1', area: 'x' });
    const res = await request(app).post(`/api/erp/delivery-staff/${staff._id}/assign-area`).set('Authorization', as(manager)).send({ area: 'khandeshwar' });
    expect(res.statusCode).toBe(400);
  });
});

describe('live tracking', () => {
  it('reports today’s real progress and never sends password hashes', async () => {
    const staffUser = await employee('staff');
    const rider = await DeliveryStaff.create({ staffId: 'D3', name: 'Sunil', phone: '9820000003', email: 's@d.com', password: 'password1', area: 'Kharghar' });
    await Order.create({ orderItems: [{ name: 'Milk', qty: 1, price: 60 }], totalPrice: 60, scheduledDeliveryDate: istStartOfDay(), deliveryStaff: rider._id, isDelivered: true, deliveredAt: new Date() });
    await Order.create({ orderItems: [{ name: 'Milk', qty: 1, price: 60 }], totalPrice: 60, scheduledDeliveryDate: istStartOfDay(), deliveryStaff: rider._id });

    const live = await request(app).get('/api/erp/delivery-staff/live').set('Authorization', as(staffUser));
    expect(live.statusCode).toBe(200);
    expect(live.body.staff[0].today).toMatchObject({ assigned: 2, delivered: 1 });
    expect(live.body.staff[0].location).toBeNull();
    expect(JSON.stringify(live.body)).not.toContain('password');

    const list = await request(app).get('/api/erp/delivery-staff').set('Authorization', as(staffUser));
    expect(list.body[0].password).toBeUndefined();
  });
});

describe('paginated lists', () => {
  it('pages and searches orders in the database', async () => {
    const staff = await employee('staff');
    for (let i = 0; i < 30; i++) {
      await Order.create({ name: i === 7 ? 'Meera Iyer' : `Customer ${i}`, phone: `98200${String(10000 + i)}`, orderItems: [{ name: 'Milk', qty: 1, price: 60 }], totalPrice: 60 });
    }

    const page = await request(app).get('/api/erp/orders?page=2&limit=10').set('Authorization', as(staff));
    expect(page.body).toMatchObject({ total: 30, page: 2, pages: 3 });
    expect(page.body.orders).toHaveLength(10);

    const found = await request(app).get('/api/erp/orders?page=1&search=meera').set('Authorization', as(staff));
    expect(found.body.total).toBe(1);

    // Without ?page the full array is still returned, for report exports
    const all = await request(app).get('/api/erp/orders').set('Authorization', as(staff));
    expect(all.body).toHaveLength(30);
  });

  it('lists customers only, never staff, with their order stats', async () => {
    const admin = await employee('admin');
    const customer = await makeUser({ name: 'Farah' });
    await Order.create({ user: customer._id, orderItems: [{ name: 'Milk', qty: 1, price: 60 }], totalPrice: 60, isPaid: true });

    const res = await request(app).get('/api/admin/customers?page=1').set('Authorization', as(admin));
    expect(res.body.total).toBe(1);
    expect(res.body.customers[0]).toMatchObject({ name: 'Farah', orders: 1, lifetimeValue: 60, status: 'Active' });
  });

  it('pages subscriptions with status counts', async () => {
    const staff = await employee('staff');
    const product = await makeProduct();
    await makeSubscription(await makeUser(), product);
    await makeSubscription(await makeUser(), product, { status: 'Paused' });

    const res = await request(app).get('/api/subscriptions?page=1&status=Paused').set('Authorization', as(staff));
    expect(res.body.total).toBe(1);
    expect(res.body.counts).toMatchObject({ Active: 1, Paused: 1 });
  });
});
