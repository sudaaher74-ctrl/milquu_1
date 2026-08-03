// The customer app's own subscription endpoints. Every one of these is scoped
// to req.user._id: a customer must never be able to read or write another
// customer's plan, so ownership is checked on the query itself rather than
// after the fact.

import Subscription, { SLOT_WINDOWS } from '../models/Subscription.js';
import User from '../models/User.js';
import { isServiceableArea, areaName } from '../config/serviceAreas.js';
import { istStartOfDay, istTomorrow, isLockedForChanges, CUTOFF_HOUR_IST } from '../utils/ist.js';
import { normaliseRhythm, legacyFrequency, priceCrate, PricingError } from '../services/subscriptionPricing.js';

const CUTOFF_MESSAGE =
  `Tomorrow's crate is already with the dairy. Changes are open again until ${CUTOFF_HOUR_IST > 12 ? CUTOFF_HOUR_IST - 12 : CUTOFF_HOUR_IST} pm tomorrow.`;

/** Load a subscription the signed-in customer owns, or null. */
const findOwned = (id, userId) => Subscription.findOne({ _id: id, user: userId });

/** Parse a client-supplied date into midnight IST, or null if unusable. */
const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : istStartOfDay(date);
};

const sendPricingError = (res, error) => {
  if (error instanceof PricingError) {
    return res.status(error.status).json({
      message: error.message,
      errors: [{ path: error.path, message: error.message }]
    });
  }
  throw error;
};

/**
 * The delivery address a subscription is created against comes from the
 * customer's saved profile, never from the request — it is the address the
 * delivery round will actually visit.
 */
const addressFor = (user) => {
  const structured = user.deliveryAddress;
  if (!structured?.line1 || !structured?.area) {
    return { error: 'Add a delivery address before starting a plan' };
  }
  if (!isServiceableArea(structured.area)) {
    return { error: 'We do not deliver to that area yet' };
  }
  const line = [structured.line1, structured.line2, areaName(structured.area)]
    .filter(Boolean)
    .join(', ');
  return { line, area: structured.area };
};

// @route  POST /api/users/subscriptions
// @access Private
export const createMySubscription = async (req, res) => {
  try {
    const { items, frequency, weekdays, slotWindow = 'early', startDate } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const address = addressFor(user);
    if (address.error) {
      return res.status(400).json({ message: address.error, errors: [{ path: 'deliveryAddress', message: address.error }] });
    }

    const rhythm = normaliseRhythm(frequency);
    const days = rhythm === 'custom' ? weekdays : undefined;

    const priced = await priceCrate(items, { rhythm, weekdays: days || [] });

    // A plan starts tomorrow by default. A start date of today would promise a
    // delivery on a round that has already left.
    const requestedStart = startDate ? parseDate(startDate) : null;
    const earliest = istTomorrow();
    const start = requestedStart && requestedStart > earliest ? requestedStart : earliest;

    const subscription = await Subscription.create({
      user: user._id,
      name: user.name,
      phone: user.phone,
      items: priced.items,
      totalAmount: priced.dailyTotal,
      dailyTotal: priced.dailyTotal,
      monthlyTotal: priced.monthlyTotal,
      status: 'Active',
      deliveryAddress: address.line,
      deliveryArea: address.area,
      frequency: legacyFrequency(rhythm),
      weekdays: days,
      slotWindow,
      deliverySlot: SLOT_WINDOWS[slotWindow]?.deliverySlot || 'Morning',
      startDate: start,
      skipDates: []
    });

    res.status(201).json(subscription);
  } catch (error) {
    try {
      return sendPricingError(res, error);
    } catch {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
};

// @route  PUT /api/users/subscriptions/:id
// @access Private
export const updateMySubscription = async (req, res) => {
  try {
    const subscription = await findOwned(req.params.id, req.user._id);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    const { items, frequency, weekdays, slotWindow } = req.body;

    // A change to the crate or the rhythm changes what gets loaded onto
    // tomorrow's van, so it is subject to the same cut-off the app advertises.
    if (isLockedForChanges(istTomorrow())) {
      return res.status(409).json({ message: CUTOFF_MESSAGE });
    }

    if (frequency !== undefined || weekdays !== undefined) {
      const rhythm = normaliseRhythm(frequency ?? subscription.frequency);
      const days = rhythm === 'custom' ? (weekdays ?? subscription.weekdays ?? []) : undefined;
      if (rhythm === 'custom' && !days.length) {
        return res.status(400).json({ message: 'Pick which days you want milk', errors: [{ path: 'weekdays', message: 'Pick which days you want milk' }] });
      }
      subscription.frequency = legacyFrequency(rhythm);
      subscription.weekdays = days;
    }

    if (slotWindow !== undefined) {
      subscription.slotWindow = slotWindow;
      subscription.deliverySlot = SLOT_WINDOWS[slotWindow]?.deliverySlot || 'Morning';
    }

    if (items !== undefined) {
      subscription.items = items;
    }

    // Reprice whatever the plan now is — the items may have changed, and so may
    // the number of deliveries a month if the rhythm did.
    const rhythmNow = normaliseRhythm(subscription.frequency);
    const priced = await priceCrate(
      subscription.items.map((i) => ({ product: i.product, quantity: i.quantity })),
      { rhythm: rhythmNow, weekdays: subscription.weekdays || [] }
    );
    subscription.items = priced.items;
    subscription.totalAmount = priced.dailyTotal;
    subscription.dailyTotal = priced.dailyTotal;
    subscription.monthlyTotal = priced.monthlyTotal;

    const saved = await subscription.save();
    res.json(saved);
  } catch (error) {
    try {
      return sendPricingError(res, error);
    } catch {
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
};

// @route  POST /api/users/subscriptions/:id/skip
// @desc   Toggle one date in skipDates
// @access Private
export const skipMySubscriptionDate = async (req, res) => {
  try {
    const subscription = await findOwned(req.params.id, req.user._id);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    const date = parseDate(req.body.date);
    if (!date) {
      return res.status(400).json({ message: 'That date is not valid', errors: [{ path: 'date', message: 'That date is not valid' }] });
    }

    if (isLockedForChanges(date)) {
      return res.status(409).json({ message: CUTOFF_MESSAGE });
    }

    const target = date.getTime();
    const existing = (subscription.skipDates || []).filter(
      (d) => istStartOfDay(d).getTime() === target
    );

    if (existing.length) {
      subscription.skipDates = subscription.skipDates.filter(
        (d) => istStartOfDay(d).getTime() !== target
      );
    } else {
      subscription.skipDates = [...(subscription.skipDates || []), date];
    }

    const saved = await subscription.save();
    res.json({ skipped: !existing.length, skipDates: saved.skipDates, subscription: saved });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @route  POST /api/users/subscriptions/:id/pause
// @access Private
export const pauseMySubscription = async (req, res) => {
  try {
    const subscription = await findOwned(req.params.id, req.user._id);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    const from = parseDate(req.body.from);
    const to = parseDate(req.body.to);
    if (!from || !to) {
      return res.status(400).json({ message: 'Those dates are not valid', errors: [{ path: 'from', message: 'Those dates are not valid' }] });
    }
    if (to < from) {
      return res.status(400).json({ message: 'The pause cannot end before it starts', errors: [{ path: 'to', message: 'The pause cannot end before it starts' }] });
    }
    if (isLockedForChanges(from)) {
      return res.status(409).json({ message: CUTOFF_MESSAGE });
    }

    subscription.pauseStartDate = from;
    subscription.pauseEndDate = to;
    // Status stays Active: the engine reads the pause window and will skip the
    // days inside it, then the plan simply resumes. Flipping to 'Paused' here
    // would make it indistinguishable from an out-of-balance auto-pause.
    const saved = await subscription.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
