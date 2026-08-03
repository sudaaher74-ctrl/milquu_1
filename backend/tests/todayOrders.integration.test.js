// Acceptance criterion 12: a plan created through the app still shows up
// correctly on the delivery round.

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { connectTestDb, clearTestDb, closeTestDb } from './helpers/db.js';
import { makeUser, makeProduct, makeSubscription } from './helpers/factories.js';
import { runSubscriptionEngine } from '../cron/subscriptionEngine.js';
import { istStartOfDay, istTomorrow, istDayOfWeek } from '../utils/ist.js';

// The round itself is admin-only; the auth path is covered elsewhere.
vi.mock('../middleware/authMiddleware.js', () => ({
  protect: (req, res, next) => { req.user = { _id: 'admin', role: 'admin' }; next(); },
  admin: (req, res, next) => next()
}));
vi.mock('../middleware/rateLimiters.js', () => ({
  apiLimiter: (req, res, next) => next(),
  globalLimiter: (req, res, next) => next()
}));

const { default: subscriptionRoutes } = await import('../routes/subscriptionRoutes.js');

const app = express();
app.use(express.json());
app.use('/api/subscriptions', subscriptionRoutes);

const tomorrowKey = () => istTomorrow().toISOString();

beforeAll(async () => { await connectTestDb(); }, 120000);
afterAll(async () => { await closeTestDb(); });
beforeEach(async () => { await clearTestDb(); });

describe('criterion 12: the delivery round sees app-created plans', () => {
  it('lists a daily plan on its delivery day', async () => {
    const user = await makeUser();
    const product = await makeProduct();
    const sub = await makeSubscription(user, product);

    const res = await request(app).get('/api/subscriptions/today-orders').query({ date: tomorrowKey() });

    expect(res.statusCode).toBe(200);
    const ids = res.body.subscriptions.map((s) => String(s._id));
    expect(ids).toContain(String(sub._id));

    const row = res.body.subscriptions.find((s) => String(s._id) === String(sub._id));
    // The fields the admin and delivery-staff views read must still be there.
    expect(row.deliveryAddress).toContain('New Panvel');
    expect(row.frequency).toBe('Daily');
    expect(row.deliverySlot).toBe('Morning');
    expect(row.items[0].quantity).toBe(2);
  });

  it('does not list a plan on a day its rhythm excludes', async () => {
    const user = await makeUser();
    const product = await makeProduct();
    const tomorrowDow = istDayOfWeek(istTomorrow());
    const otherDays = [0, 1, 2, 3, 4, 5, 6].filter((d) => d !== tomorrowDow);
    const sub = await makeSubscription(user, product, { frequency: 'Weekly', weekdays: otherDays });

    const res = await request(app).get('/api/subscriptions/today-orders').query({ date: tomorrowKey() });

    const ids = res.body.subscriptions.map((s) => String(s._id));
    expect(ids).not.toContain(String(sub._id));
  });

  it('does not list a plan on a skipped date', async () => {
    const user = await makeUser();
    const product = await makeProduct();
    const sub = await makeSubscription(user, product, { skipDates: [istTomorrow()] });

    const res = await request(app).get('/api/subscriptions/today-orders').query({ date: tomorrowKey() });

    const ids = res.body.subscriptions.map((s) => String(s._id));
    expect(ids).not.toContain(String(sub._id));
  });

  it('shows a generated order once, folded into its subscription row', async () => {
    const user = await makeUser({ walletBalance: 1000 });
    const product = await makeProduct();
    const sub = await makeSubscription(user, product);

    await runSubscriptionEngine();

    const res = await request(app).get('/api/subscriptions/today-orders').query({ date: tomorrowKey() });

    // One line on the round, not two — the subscription and the order the
    // engine generated from it are the same delivery.
    expect(res.body.totalDeliveries).toBe(1);
    const row = res.body.subscriptions[0];
    expect(String(row._id)).toBe(String(sub._id));
    expect(row.orderId).toBeTruthy();
    expect(row.isPaid).toBe(true);
  });

  it('reads the Indian calendar day, not the host\'s', async () => {
    const user = await makeUser();
    const product = await makeProduct();
    await makeSubscription(user, product, { startDate: istStartOfDay(new Date('2026-08-01T00:00:00Z')) });

    // 18:45 UTC on 4 Aug is already 5 Aug in India.
    const res = await request(app)
      .get('/api/subscriptions/today-orders')
      .query({ date: '2026-08-04T18:45:00Z' });

    expect(res.body.date).toBe('2026-08-05');
    expect(res.body.dayName).toBe('Wednesday');
  });

  it('paginates rather than returning every subscription', async () => {
    const product = await makeProduct();
    for (let i = 0; i < 5; i += 1) {
      const user = await makeUser();
      await makeSubscription(user, product);
    }

    const res = await request(app)
      .get('/api/subscriptions/today-orders')
      .query({ date: tomorrowKey(), page: 1, limit: 2 });

    expect(res.body.subscriptions).toHaveLength(2);
    expect(res.body.totalCandidates).toBe(5);
    expect(res.body.hasMore).toBe(true);

    const last = await request(app)
      .get('/api/subscriptions/today-orders')
      .query({ date: tomorrowKey(), page: 3, limit: 2 });
    expect(last.body.hasMore).toBe(false);
  });
});
