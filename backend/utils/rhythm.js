// Whether a subscription delivers on a given date. The engine, the customer
// endpoints and the delivery round all have to agree on this, so it lives in
// one place. Everything here is IST.

import { istStartOfDay, istDayOfWeek, istDaysBetween } from './ist.js';

/**
 * The app's three rhythms, mapped onto the `frequency` values the admin
 * dashboard and delivery app already understand. `weekdays` carries the detail
 * `frequency` cannot express.
 */
export const RHYTHMS = {
  daily: { frequency: 'Daily', perMonth: 30 },
  alternate: { frequency: 'Alternate Days', perMonth: 15 },
  custom: { frequency: 'Weekly', perMonth: null } // depends on how many days were picked
};

/** Deliveries in a typical 30-day month at this rhythm. */
export const deliveriesPerMonth = (rhythm, weekdays = []) => {
  if (rhythm === 'custom') return Math.round((weekdays.length * 30) / 7);
  return RHYTHMS[rhythm]?.perMonth ?? 30;
};

/** Map a subscription's stored fields back to one of the app's three rhythms. */
export const rhythmOf = (sub) => {
  const freq = String(sub.frequency || '').toLowerCase();
  if (Array.isArray(sub.weekdays) && sub.weekdays.length) return 'custom';
  if (freq === 'alternate days' || freq === 'alternate') return 'alternate';
  if (freq === 'daily') return 'daily';
  if (freq === 'weekly') return 'custom';
  return 'one-time';
};

/** True when `date` is one of the subscription's skipped dates. */
export const isSkipped = (sub, date) => {
  const target = istStartOfDay(date).getTime();
  return (sub.skipDates || []).some((d) => istStartOfDay(d).getTime() === target);
};

/** True when `date` falls inside an active pause window. */
export const isPaused = (sub, date) => {
  if (!sub.pauseStartDate && !sub.pauseEndDate) return false;
  const target = istStartOfDay(date).getTime();
  const from = sub.pauseStartDate ? istStartOfDay(sub.pauseStartDate).getTime() : -Infinity;
  const to = sub.pauseEndDate ? istStartOfDay(sub.pauseEndDate).getTime() : Infinity;
  return target >= from && target <= to;
};

/**
 * True when this subscription should produce a delivery on `date`.
 *
 * Answers the rhythm question only — it does not look at status or wallet
 * balance, which are the engine's business.
 */
export const isDeliveryDay = (sub, date) => {
  const target = istStartOfDay(date);
  const start = istStartOfDay(sub.startDate || sub.createdAt || new Date());

  if (target < start) return false;
  if (isSkipped(sub, target)) return false;
  if (isPaused(sub, target)) return false;

  switch (rhythmOf(sub)) {
    case 'daily':
      return true;
    case 'alternate':
      return istDaysBetween(start, target) % 2 === 0;
    case 'custom': {
      const days = Array.isArray(sub.weekdays) && sub.weekdays.length
        ? sub.weekdays
        // A 'Weekly' subscription with no weekdays list is the legacy shape:
        // it delivers on the same weekday it started on.
        : [istDayOfWeek(start)];
      return days.includes(istDayOfWeek(target));
    }
    case 'one-time':
    default:
      return target.getTime() === start.getTime();
  }
};
