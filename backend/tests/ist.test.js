import { describe, it, expect } from 'vitest';
import {
  istStartOfDay,
  istTomorrow,
  istDayOfWeek,
  istDateKey,
  istDaysBetween,
  isLockedForChanges
} from '../utils/ist.js';
import { isDeliveryDay, deliveriesPerMonth } from '../utils/rhythm.js';

// 2026-08-04T19:00:00Z is 2026-08-05 00:30 IST — a different calendar day in
// India than in UTC. Anything that reads the host's day gets this wrong.
const LATE_EVENING_UTC = new Date('2026-08-04T19:00:00Z');

describe('IST date handling', () => {
  it('treats an instant after 18:30 UTC as the next Indian day', () => {
    expect(istDateKey(LATE_EVENING_UTC)).toBe('2026-08-05');
  });

  it('returns midnight IST as a UTC instant', () => {
    // Midnight in Kolkata is 18:30 UTC the previous day.
    expect(istStartOfDay(LATE_EVENING_UTC).toISOString()).toBe('2026-08-04T18:30:00.000Z');
  });

  it('is stable — two instants on the same Indian day give the same key', () => {
    const morning = new Date('2026-08-05T04:00:00Z'); // 09:30 IST
    expect(istStartOfDay(morning).getTime()).toBe(istStartOfDay(LATE_EVENING_UTC).getTime());
  });

  it('advances exactly one day for tomorrow', () => {
    expect(istDaysBetween(istStartOfDay(LATE_EVENING_UTC), istTomorrow(LATE_EVENING_UTC))).toBe(1);
  });

  it('reads the weekday in IST, not UTC', () => {
    // 2026-08-04T19:00Z is still Tuesday in UTC but Wednesday in India.
    expect(LATE_EVENING_UTC.getUTCDay()).toBe(2);
    expect(istDayOfWeek(LATE_EVENING_UTC)).toBe(3);
  });
});

describe('the 21:00 IST cut-off', () => {
  const tomorrowOf = (now) => istTomorrow(now);

  it('allows changes to tomorrow before 9 pm IST', () => {
    const now = new Date('2026-08-04T14:00:00Z'); // 19:30 IST
    expect(isLockedForChanges(tomorrowOf(now), now)).toBe(false);
  });

  it('locks tomorrow once 9 pm IST has passed', () => {
    const now = new Date('2026-08-04T15:45:00Z'); // 21:15 IST
    expect(isLockedForChanges(tomorrowOf(now), now)).toBe(true);
  });

  it('locks today outright — that round is already out', () => {
    const now = new Date('2026-08-04T04:00:00Z');
    expect(isLockedForChanges(istStartOfDay(now), now)).toBe(true);
  });

  it('leaves the day after tomorrow open', () => {
    const now = new Date('2026-08-04T15:45:00Z'); // past the cut-off
    const dayAfter = new Date(tomorrowOf(now).getTime() + 24 * 60 * 60 * 1000);
    expect(isLockedForChanges(dayAfter, now)).toBe(false);
  });
});

describe('delivery rhythms', () => {
  const base = {
    startDate: new Date('2026-08-03T18:30:00Z'), // midnight IST on Tue 4 Aug 2026
    skipDates: []
  };
  const day = (n) => new Date(base.startDate.getTime() + n * 24 * 60 * 60 * 1000);

  it('delivers every day on Daily', () => {
    const sub = { ...base, frequency: 'Daily' };
    expect([0, 1, 2, 3].every((n) => isDeliveryDay(sub, day(n)))).toBe(true);
  });

  it('delivers every other day on Alternate Days', () => {
    const sub = { ...base, frequency: 'Alternate Days' };
    expect([0, 2, 4].map((n) => isDeliveryDay(sub, day(n)))).toEqual([true, true, true]);
    expect([1, 3].map((n) => isDeliveryDay(sub, day(n)))).toEqual([false, false]);
  });

  it('delivers only on the chosen weekdays', () => {
    // The plan starts on Tue 4 Aug 2026; pick Tuesday (2) and Friday (5).
    const sub = { ...base, frequency: 'Weekly', weekdays: [2, 5] };
    expect(isDeliveryDay(sub, day(0))).toBe(true); // Tue
    expect(isDeliveryDay(sub, day(1))).toBe(false); // Wed
    expect(isDeliveryDay(sub, day(3))).toBe(true); // Fri
  });

  it('does not deliver on a skipped date', () => {
    const sub = { ...base, frequency: 'Daily', skipDates: [day(2)] };
    expect(isDeliveryDay(sub, day(2))).toBe(false);
    expect(isDeliveryDay(sub, day(3))).toBe(true);
  });

  it('does not deliver inside a pause window', () => {
    const sub = { ...base, frequency: 'Daily', pauseStartDate: day(2), pauseEndDate: day(4) };
    expect([2, 3, 4].map((n) => isDeliveryDay(sub, day(n)))).toEqual([false, false, false]);
    expect(isDeliveryDay(sub, day(5))).toBe(true);
  });

  it('does not deliver before the start date', () => {
    const sub = { ...base, frequency: 'Daily' };
    expect(isDeliveryDay(sub, day(-1))).toBe(false);
  });

  it('counts deliveries per month per rhythm', () => {
    expect(deliveriesPerMonth('daily')).toBe(30);
    expect(deliveriesPerMonth('alternate')).toBe(15);
    expect(deliveriesPerMonth('custom', [1, 4])).toBe(9);
  });
});
