// Acceptance criteria 7-10, against a real database.
//
// These assert on money and on uniqueness, which only mean anything if the
// wallet, the orders and the indexes are real — so this runs on
// mongodb-memory-server rather than mocked models.

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectTestDb, clearTestDb, closeTestDb } from './helpers/db.js';
import { makeUser, makeProduct, makeSubscription } from './helpers/factories.js';
import { runSubscriptionEngine } from '../cron/subscriptionEngine.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Subscription from '../models/Subscription.js';
import WalletTransaction from '../models/WalletTransaction.js';
import SubscriptionDelivery from '../models/SubscriptionDelivery.js';
import { istTomorrow } from '../utils/ist.js';

beforeAll(async () => { await connectTestDb(); }, 120000);
afterAll(async () => { await closeTestDb(); });
beforeEach(async () => { await clearTestDb(); });

// 2 L at the ₹60 plan rate.
const DAILY_COST = 120;

describe('criterion 7: the engine generates exactly one order and debits the wallet', () => {
  it('creates tomorrow\'s order, debits the wallet and writes a transaction', async () => {
    const user = await makeUser({ walletBalance: 1000 });
    const product = await makeProduct();
    const sub = await makeSubscription(user, product);

    const summary = await runSubscriptionEngine();

    expect(summary.ordered).toBe(1);

    const orders = await Order.find({ user: user._id });
    expect(orders).toHaveLength(1);
    expect(orders[0].totalPrice).toBe(DAILY_COST);
    expect(orders[0].subscription.toString()).toBe(sub._id.toString());
    // Scheduled for tomorrow IST, at midnight IST exactly.
    expect(orders[0].scheduledDeliveryDate.getTime()).toBe(istTomorrow().getTime());
    // The money has actually moved — the old engine left this false forever.
    expect(orders[0].isPaid).toBe(true);

    const after = await User.findById(user._id);
    expect(after.walletBalance).toBe(1000 - DAILY_COST);

    const ledger = await WalletTransaction.find({ user: user._id });
    expect(ledger).toHaveLength(1);
    expect(ledger[0].type).toBe('debit');
    expect(ledger[0].amount).toBe(DAILY_COST);
    expect(ledger[0].balanceAfter).toBe(1000 - DAILY_COST);
  });

  it('charges the plan rate from the database, not the one-off rate', async () => {
    const user = await makeUser({ walletBalance: 1000 });
    const product = await makeProduct({ price: 68, planPrice: 60 });
    await makeSubscription(user, product);

    await runSubscriptionEngine();

    const after = await User.findById(user._id);
    expect(after.walletBalance).toBe(1000 - 120); // 2 x 60, not 2 x 68
  });
});

describe('criterion 8: running twice does not duplicate the order or the debit', () => {
  it('is idempotent on a second run', async () => {
    const user = await makeUser({ walletBalance: 1000 });
    const product = await makeProduct();
    await makeSubscription(user, product);

    const first = await runSubscriptionEngine();
    const second = await runSubscriptionEngine();

    expect(first.ordered).toBe(1);
    expect(second.ordered).toBe(0);
    expect(second.alreadyProcessed).toBe(1);

    expect(await Order.countDocuments({ user: user._id })).toBe(1);
    expect(await WalletTransaction.countDocuments({ user: user._id })).toBe(1);

    const after = await User.findById(user._id);
    expect(after.walletBalance).toBe(1000 - DAILY_COST); // debited once, not twice
  });

  it('is idempotent even when both runs overlap', async () => {
    const user = await makeUser({ walletBalance: 1000 });
    const product = await makeProduct();
    await makeSubscription(user, product);

    // The unique index, not the ordering of the two runs, is what guarantees
    // this — so run them concurrently rather than one after the other.
    await Promise.all([runSubscriptionEngine(), runSubscriptionEngine()]);

    expect(await Order.countDocuments({ user: user._id })).toBe(1);
    expect(await WalletTransaction.countDocuments({ user: user._id })).toBe(1);
    const after = await User.findById(user._id);
    expect(after.walletBalance).toBe(1000 - DAILY_COST);
  });
});

describe('criterion 9: a skipped day produces no order and no debit', () => {
  it('skips tomorrow when tomorrow is in skipDates', async () => {
    const user = await makeUser({ walletBalance: 1000 });
    const product = await makeProduct();
    await makeSubscription(user, product, { skipDates: [istTomorrow()] });

    const summary = await runSubscriptionEngine();

    expect(summary.ordered).toBe(0);
    expect(await Order.countDocuments({ user: user._id })).toBe(0);
    expect(await WalletTransaction.countDocuments({ user: user._id })).toBe(0);

    const after = await User.findById(user._id);
    expect(after.walletBalance).toBe(1000);
  });

  it('skips a day the rhythm does not cover', async () => {
    const user = await makeUser({ walletBalance: 1000 });
    const product = await makeProduct();
    // Weekdays that deliberately exclude tomorrow.
    const tomorrowDow = new Date(istTomorrow().getTime() + 5.5 * 3600 * 1000).getUTCDay();
    const otherDays = [0, 1, 2, 3, 4, 5, 6].filter((d) => d !== tomorrowDow);
    await makeSubscription(user, product, { frequency: 'Weekly', weekdays: otherDays });

    await runSubscriptionEngine();

    expect(await Order.countDocuments({ user: user._id })).toBe(0);
    const after = await User.findById(user._id);
    expect(after.walletBalance).toBe(1000);
  });
});

describe('criterion 10: a short balance auto-pauses the subscription', () => {
  it('auto-pauses instead of delivering on credit', async () => {
    const user = await makeUser({ walletBalance: 50 }); // less than one day's ₹120
    const product = await makeProduct();
    const sub = await makeSubscription(user, product);

    const summary = await runSubscriptionEngine();

    expect(summary.autoPaused).toBe(1);
    expect((await Subscription.findById(sub._id)).status).toBe('Paused');

    expect(await Order.countDocuments({ user: user._id })).toBe(0);
    expect(await WalletTransaction.countDocuments({ user: user._id })).toBe(0);

    const after = await User.findById(user._id);
    expect(after.walletBalance).toBe(50); // untouched, never negative
  });

  it('does not backfill a refused day after a top-up', async () => {
    const user = await makeUser({ walletBalance: 50 });
    const product = await makeProduct();
    await makeSubscription(user, product);

    await runSubscriptionEngine();
    await User.findByIdAndUpdate(user._id, { walletBalance: 1000, });
    await runSubscriptionEngine();

    // The day was already claimed and refused; re-running must not now charge
    // for a delivery that was never loaded onto the van.
    expect(await Order.countDocuments({ user: user._id })).toBe(0);
    const after = await User.findById(user._id);
    expect(after.walletBalance).toBe(1000);

    const claims = await SubscriptionDelivery.find({ user: user._id });
    expect(claims).toHaveLength(1);
    expect(claims[0].status).toBe('failed');
  });

  it('auto-resumes once the pause window has ended', async () => {
    const user = await makeUser({ walletBalance: 1000 });
    const product = await makeProduct();
    const yesterday = new Date(Date.now() - 3 * 24 * 3600 * 1000);
    const sub = await makeSubscription(user, product, {
      status: 'Paused',
      pauseStartDate: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      pauseEndDate: yesterday,
      startDate: new Date(Date.now() - 10 * 24 * 3600 * 1000)
    });

    await runSubscriptionEngine();

    const resumed = await Subscription.findById(sub._id);
    expect(resumed.status).toBe('Active');
    expect(await Order.countDocuments({ user: user._id })).toBe(1);
  });
});

describe('the engine keeps customers separate', () => {
  it('charges each customer only for their own plan', async () => {
    const product = await makeProduct();
    const alice = await makeUser({ walletBalance: 1000 });
    const bob = await makeUser({ walletBalance: 1000 });
    await makeSubscription(alice, product, { quantity: 2 }); // ₹120
    await makeSubscription(bob, product, { quantity: 1 }); // ₹60

    await runSubscriptionEngine();

    expect((await User.findById(alice._id)).walletBalance).toBe(880);
    expect((await User.findById(bob._id)).walletBalance).toBe(940);
    expect(await Order.countDocuments({ user: alice._id })).toBe(1);
    expect(await Order.countDocuments({ user: bob._id })).toBe(1);
  });
});
