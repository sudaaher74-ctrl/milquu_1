// One-off migration for the customer-app release.
//
//   node seeder/migrate.js          report only, changes nothing
//   node seeder/migrate.js --apply  make the changes
//
// Safe to run more than once: every step is idempotent, and anything it cannot
// work out for certain is reported rather than guessed at.

import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Subscription from '../models/Subscription.js';
import { SERVICE_AREAS } from '../config/serviceAreas.js';
import { normalisePhone, isValidPhone } from '../utils/phone.js';
import { priceCrate, normaliseRhythm } from '../services/subscriptionPricing.js';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(here, '../../.env') });

const apply = process.argv.includes('--apply');
const log = (...args) => console.log(...args);

/**
 * 1. The email index.
 *
 * email used to be `required: true, unique: true`. It is now sparse-unique, so
 * that customers can sign up with a phone number and no email. Changing the
 * schema does not rebuild the index — the old non-sparse one has to be dropped,
 * or the second account without an email collides on null.
 */
const migrateIndexes = async () => {
  const collection = mongoose.connection.collection('users');

  // listIndexes throws on a collection that does not exist yet — a fresh
  // database has nothing to migrate, only indexes to create.
  let indexes = [];
  try {
    indexes = await collection.indexes();
  } catch (error) {
    if (error.codeName !== 'NamespaceNotFound') throw error;
    log('  no users collection yet — nothing to rebuild');
  }

  for (const name of ['email_1', 'phone_1']) {
    const existing = indexes.find((i) => i.name === name);
    if (existing && existing.unique && !existing.sparse) {
      log(`  index ${name} is unique but not sparse — needs rebuilding`);
      if (apply) {
        await collection.dropIndex(name);
        log(`  dropped ${name}`);
      }
    }
  }

  if (apply) {
    // Recreates whatever the schema declares, including the sparse variants.
    await User.syncIndexes();
    await Subscription.syncIndexes();
    log('  indexes synced');
  }
};

/**
 * 2. Phone numbers.
 *
 * The phone number is now the sign-in identifier, so stored values have to be
 * normalised to bare digits or a customer cannot be found at sign-in.
 * Duplicates are reported, never merged — two accounts sharing a number is a
 * business decision, not something a script should resolve.
 */
const migratePhones = async () => {
  const users = await User.find({ phone: { $exists: true, $ne: null } })
    .select('phone name email')
    .lean();

  const seen = new Map();
  let changed = 0;
  const duplicates = [];
  const invalid = [];

  for (const user of users) {
    const normalised = normalisePhone(user.phone);

    if (!isValidPhone(user.phone)) {
      invalid.push(`${user._id} (${user.name}): "${user.phone}"`);
      continue;
    }
    if (seen.has(normalised)) {
      duplicates.push(`${normalised}: ${seen.get(normalised)} and ${user._id}`);
      continue;
    }
    seen.set(normalised, String(user._id));

    if (normalised !== user.phone) {
      changed += 1;
      if (apply) await User.updateOne({ _id: user._id }, { $set: { phone: normalised } });
    }
  }

  log(`  ${changed} phone numbers ${apply ? 'normalised' : 'would be normalised'}`);
  if (invalid.length) {
    log(`  ${invalid.length} accounts have an unusable phone number and cannot sign in by phone:`);
    invalid.forEach((line) => log(`    ${line}`));
  }
  if (duplicates.length) {
    log(`  ${duplicates.length} phone numbers are shared by more than one account — resolve by hand:`);
    duplicates.forEach((line) => log(`    ${line}`));
  }
};

/**
 * 3. Delivery addresses.
 *
 * Existing customers have a single-line `address` string and no structured
 * deliveryAddress, which the app needs for the "deliver to" line and for
 * routing. The only part that must be right is the area: an address parsed into
 * the wrong locality sends a van to the wrong suburb. So the area is taken only
 * from an unambiguous name match, and anything else is left alone — the app
 * sends those customers through the address screen, which is the correct
 * outcome, not a broken state.
 */
const migrateAddresses = async () => {
  const users = await User.find({
    address: { $exists: true, $nin: [null, ''] },
    $or: [{ 'deliveryAddress.line1': { $in: [null, ''] } }, { deliveryAddress: { $exists: false } }]
  }).select('address name').lean();

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    const text = String(user.address).toLowerCase();
    const matches = SERVICE_AREAS.filter((area) => {
      const name = area.name.toLowerCase();
      return text.includes(name) || text.includes(area.slug.replace(/-/g, ' '));
    });

    // Exactly one area, or we do not guess. "New Panvel" contains "Panvel", so
    // prefer the longest match when one name is a substring of another.
    const best = matches.length
      ? matches.reduce((a, b) => (b.name.length > a.name.length ? b : a))
      : null;
    const ambiguous = matches.filter((m) => m.name.length === best?.name.length).length > 1;

    if (!best || ambiguous) {
      skipped += 1;
      continue;
    }

    // Strip the locality off the tail so it is not repeated in the line.
    const line1 = String(user.address).split(',')[0].trim() || String(user.address).trim();
    const line2 = String(user.address).split(',').slice(1).join(',').trim();

    migrated += 1;
    if (apply) {
      await User.updateOne(
        { _id: user._id },
        { $set: { deliveryAddress: { line1, line2, note: '', label: 'Home', area: best.slug } } }
      );
    }
  }

  log(`  ${migrated} addresses ${apply ? 'migrated' : 'would be migrated'}`);
  log(`  ${skipped} left for the customer to confirm in the app (no unambiguous area)`);
};

/**
 * 4. Subscription totals.
 *
 * dailyTotal/monthlyTotal are what the engine charges from. They used to be
 * whatever the client sent, which was usually nothing at all — leaving the
 * daily cost NaN. Recompute both from the Product collection.
 */
const migrateSubscriptionTotals = async () => {
  const subs = await Subscription.find({ status: { $in: ['Active', 'Paused', 'Pending'] } });

  let fixed = 0;
  let unpriceable = 0;

  for (const sub of subs) {
    const items = (sub.items || [])
      .filter((i) => i.product)
      .map((i) => ({ product: i.product, quantity: i.quantity }));

    if (!items.length) {
      unpriceable += 1;
      continue;
    }

    try {
      const rhythm = normaliseRhythm(sub.frequency);
      const priced = await priceCrate(items, { rhythm, weekdays: sub.weekdays || [] });

      if (sub.dailyTotal !== priced.dailyTotal || sub.monthlyTotal !== priced.monthlyTotal) {
        fixed += 1;
        if (apply) {
          sub.items = priced.items;
          sub.totalAmount = priced.dailyTotal;
          sub.dailyTotal = priced.dailyTotal;
          sub.monthlyTotal = priced.monthlyTotal;
          if (!sub.slotWindow) sub.slotWindow = 'early';
          if (!Array.isArray(sub.skipDates)) sub.skipDates = [];
          await sub.save();
        }
      }
    } catch {
      unpriceable += 1;
    }
  }

  log(`  ${fixed} subscriptions ${apply ? 'repriced' : 'would be repriced'}`);
  if (unpriceable) log(`  ${unpriceable} could not be priced (missing or deleted products) — check by hand`);
};

/**
 * 5. Plan prices.
 *
 * Reports milk products with no planPrice. It does not invent a discount —
 * priceOf() falls back to the one-off price, so an unset planPrice simply means
 * the plan costs the same, which is a pricing decision for someone to make.
 */
const reportPlanPrices = async () => {
  const milks = await Product.find({ category: 'milk' }).select('name price planPrice').lean();
  const missing = milks.filter((p) => p.planPrice == null);

  if (!missing.length) {
    log('  every milk has a plan price');
    return;
  }
  log(`  ${missing.length} milk products have no planPrice and will bill at the one-off rate:`);
  missing.forEach((p) => log(`    ${p.name} (₹${p.price})`));
};

const run = async () => {
  await connectDB();
  log(apply ? '\nApplying migration…\n' : '\nDry run — nothing will be changed. Pass --apply to commit.\n');

  log('Indexes:');
  await migrateIndexes();
  log('\nPhone numbers:');
  await migratePhones();
  log('\nDelivery addresses:');
  await migrateAddresses();
  log('\nSubscription totals:');
  await migrateSubscriptionTotals();
  log('\nPlan prices:');
  await reportPlanPrices();

  log(apply ? '\nDone.\n' : '\nDry run complete. Re-run with --apply to make these changes.\n');
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Migration failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
