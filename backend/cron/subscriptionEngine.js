// Generates tomorrow's delivery from every active subscription, charges it to
// the customer's wallet, and auto-pauses anyone who cannot cover it.
//
// This runs unattended once a night, so the two things that matter most are:
//
//  1. Idempotency. Running twice on the same day must not create two orders or
//     take two debits. A SubscriptionDelivery row, unique on (subscription,
//     deliveryDate), is claimed before any money moves; a second run loses the
//     insert race and skips.
//  2. IST. "Tomorrow" is an Indian calendar day. Reaching for the host's local
//     day on a UTC server delivers milk on the wrong morning.

import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Subscription from '../models/Subscription.js';
import SubscriptionDelivery from '../models/SubscriptionDelivery.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import connectDB from '../config/db.js';
import logger from '../utils/logger.js';
import { istStartOfDay, istTomorrow, istDateKey } from '../utils/ist.js';
import { isDeliveryDay } from '../utils/rhythm.js';
import { toPaise, toRupees, sumItemsPaise } from '../utils/money.js';

/** Cost of one delivery, in integer paise, from the stored item prices. */
const dailyCostPaise = (sub) => {
  const fromItems = sumItemsPaise(sub.items || []);
  if (fromItems > 0) return fromItems;
  // Older subscriptions predate dailyTotal; fall back rather than charge zero.
  if (sub.dailyTotal) return toPaise(sub.dailyTotal);
  if (sub.monthlyTotal) return Math.round(toPaise(sub.monthlyTotal) / 30);
  return 0;
};

/**
 * Auto-resume a subscription whose pause window has ended.
 * Returns true if the subscription is deliverable after this.
 */
const resumeIfDue = async (sub, today) => {
  if (sub.status !== 'Paused') return sub.status === 'Active';

  // A pause with an end date that has passed resumes on its own.
  if (sub.pauseEndDate && istStartOfDay(sub.pauseEndDate) < today) {
    sub.status = 'Active';
    sub.pauseStartDate = undefined;
    sub.pauseEndDate = undefined;
    await sub.save();
    logger.info(`[engine] auto-resumed subscription ${sub._id}`);
    return true;
  }
  return false;
};

/** Build the order line items, taking names and images from the products. */
const buildOrderItems = async (sub) => {
  const ids = (sub.items || []).map((i) => i.product).filter(Boolean);
  const products = await Product.find({ _id: { $in: ids } }).select('name image').lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  return (sub.items || []).map((item) => {
    const product = byId.get(String(item.product));
    return {
      name: product?.name || item.name || 'Item',
      qty: item.quantity || 1,
      image: product?.image || '/placeholder.jpg',
      price: item.price,
      product: item.product
    };
  });
};

/**
 * Process one subscription for one delivery date.
 * Returns a short result string for the run summary.
 */
const processSubscription = async (sub, deliveryDate, today) => {
  const deliverable = await resumeIfDue(sub, today);
  if (!deliverable) return 'paused';

  if (!isDeliveryDay(sub, deliveryDate)) return 'not-a-delivery-day';

  const costPaise = dailyCostPaise(sub);
  if (costPaise <= 0) {
    logger.warn(`[engine] subscription ${sub._id} has no priced items — skipping`);
    return 'no-cost';
  }

  const user = await User.findById(sub.user);
  if (!user) return 'no-user';

  // Claim the day before anything irreversible happens. The unique index on
  // (subscription, deliveryDate) is what makes a second run a no-op: the
  // duplicate-key error below is the expected outcome, not a failure.
  let claim;
  try {
    claim = await SubscriptionDelivery.create({
      subscription: sub._id,
      user: sub.user,
      deliveryDate,
      amount: toRupees(costPaise),
      status: 'claimed'
    });
  } catch (error) {
    if (error?.code === 11000) return 'already-processed';
    throw error;
  }

  // Auto-pause rather than deliver on credit. The claim row is left behind
  // marked failed, so a re-run after a top-up does not double up on the day
  // that was already refused.
  const balancePaise = toPaise(user.walletBalance || 0);
  if (balancePaise < costPaise) {
    sub.status = 'Paused';
    await sub.save();
    claim.status = 'failed';
    claim.note = 'Insufficient wallet balance';
    await claim.save();
    logger.info(
      `[engine] auto-paused subscription ${sub._id}: balance ${toRupees(balancePaise)} < cost ${toRupees(costPaise)}`
    );
    return 'auto-paused';
  }

  const orderItems = await buildOrderItems(sub);
  const order = await Order.create({
    user: sub.user,
    subscription: sub._id,
    name: sub.name || user.name,
    phone: sub.phone || user.phone,
    orderItems,
    shippingAddress: {
      address: sub.deliveryAddress,
      city: 'Navi Mumbai',
      postalCode: '000000',
      country: 'India'
    },
    paymentMethod: 'Wallet',
    paymentStatus: 'PAID',
    taxPrice: 0,
    totalPrice: toRupees(costPaise),
    // Paid from the wallet at generation time — the money has actually moved,
    // which the previous version claimed but never did.
    isPaid: true,
    paidAt: new Date(),
    isDelivered: false,
    deliverySlot: sub.deliverySlot || 'Morning',
    scheduledDeliveryDate: deliveryDate,
    orderSource: 'App'
  });

  // Debit atomically and read the resulting balance back, so two concurrent
  // runs cannot both write a stale balance.
  const debited = await User.findByIdAndUpdate(
    user._id,
    { $inc: { walletBalance: -toRupees(costPaise) } },
    { returnDocument: 'after' }
  );

  await WalletTransaction.create({
    user: user._id,
    amount: toRupees(costPaise),
    type: 'debit',
    description: `Milk delivery ${istDateKey(deliveryDate)} (subscription)`,
    balanceAfter: toRupees(toPaise(debited.walletBalance))
  });

  claim.status = 'charged';
  claim.order = order._id;
  await claim.save();

  // Low-balance warning. Unchanged behaviour: the engine only logs a simulated
  // SMS, which is out of scope to make real.
  const remainingPaise = toPaise(debited.walletBalance);
  if (remainingPaise < costPaise * 3) {
    logger.info(
      `[SIMULATED SMS to ${user.phone}]: Hi ${user.name}, your MilQuu wallet is low (₹${toRupees(remainingPaise)}). Please recharge to avoid a pause.`
    );
  }

  return 'ordered';
};

/**
 * Run the engine for one delivery date (tomorrow, IST, by default).
 *
 * Subscriptions are streamed with a cursor rather than loaded into an array —
 * at thousands of customers, find() into memory is the thing that falls over
 * first.
 */
export const runSubscriptionEngine = async ({ date, batchSize = 200 } = {}) => {
  const deliveryDate = date ? istStartOfDay(date) : istTomorrow();
  const today = istStartOfDay();

  logger.info(`[engine] starting run for ${istDateKey(deliveryDate)}`);

  const summary = {
    date: istDateKey(deliveryDate),
    processed: 0,
    ordered: 0,
    autoPaused: 0,
    skipped: 0,
    alreadyProcessed: 0,
    errors: 0
  };

  const cursor = Subscription.find({ status: { $in: ['Active', 'Paused'] } })
    .batchSize(batchSize)
    .cursor();

  for await (const sub of cursor) {
    summary.processed += 1;
    try {
      const result = await processSubscription(sub, deliveryDate, today);
      if (result === 'ordered') summary.ordered += 1;
      else if (result === 'auto-paused') summary.autoPaused += 1;
      else if (result === 'already-processed') summary.alreadyProcessed += 1;
      else summary.skipped += 1;
    } catch (error) {
      summary.errors += 1;
      // One bad subscription must not stop the round for everyone else.
      logger.error(`[engine] subscription ${sub._id} failed: ${error.message}`);
    }
  }

  logger.info(
    `[engine] finished ${summary.date}: ${summary.ordered} ordered, ${summary.autoPaused} auto-paused, ` +
    `${summary.alreadyProcessed} already done, ${summary.skipped} skipped, ${summary.errors} errors`
  );

  return summary;
};

// Run directly: `node cron/subscriptionEngine.js`. This is the entry point the
// Render cron job uses, and the recovery path if a night is missed.
const thisFile = fileURLToPath(import.meta.url);
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === thisFile;
if (isDirectRun) {
  const { default: dotenv } = await import('dotenv');
  dotenv.config({ path: path.join(path.dirname(thisFile), '../../.env') });

  try {
    await connectDB();
    const summary = await runSubscriptionEngine();
    logger.info(`[engine] ${JSON.stringify(summary)}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error(`[engine] run failed: ${error.message}`);
    process.exit(1);
  }
}
