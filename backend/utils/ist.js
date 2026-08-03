// Every delivery date in this system is an Indian calendar date. The server
// runs on Render in UTC, so anything that reaches for the host's local day is
// wrong by 5h30m — which lands milk on the wrong morning either side of
// midnight. All date arithmetic for deliveries goes through here.

/** India has a fixed +05:30 offset and no daylight saving. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Midnight IST of the calendar day the given instant falls on, as a UTC Date.
 * Shifting into IST, truncating, then shifting back gives an instant that is
 * exactly 00:00 in Kolkata — the value stored in scheduledDeliveryDate, so two
 * runs on the same day always produce the same key.
 */
export const istStartOfDay = (date = new Date()) => {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - IST_OFFSET_MS);
};

/** Midnight IST of the day after the given instant's IST day. */
export const istTomorrow = (date = new Date()) =>
  new Date(istStartOfDay(date).getTime() + 24 * 60 * 60 * 1000);

/** Day of week in IST: 0 = Sunday … 6 = Saturday. */
export const istDayOfWeek = (date = new Date()) =>
  new Date(date.getTime() + IST_OFFSET_MS).getUTCDay();

/** Hour of day in IST, 0–23. */
export const istHour = (date = new Date()) =>
  new Date(date.getTime() + IST_OFFSET_MS).getUTCHours();

/** YYYY-MM-DD in IST — the key the app uses for a day. */
export const istDateKey = (date = new Date()) =>
  new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

/** Whole days between two instants, counted in IST calendar days. */
export const istDaysBetween = (from, to) =>
  Math.round((istStartOfDay(to) - istStartOfDay(from)) / (24 * 60 * 60 * 1000));

/** True when two instants fall on the same IST calendar day. */
export const isSameIstDay = (a, b) => istStartOfDay(a).getTime() === istStartOfDay(b).getTime();

/**
 * The hour after which tomorrow's crate is locked. The app promises "change
 * tomorrow's crate until 9 pm tonight", so the server enforces the same.
 */
export const CUTOFF_HOUR_IST = 21;

/**
 * True when `date` can no longer be changed. A delivery date is locked once
 * 21:00 IST on the evening before it has passed; anything already in the past
 * is locked outright.
 */
export const isLockedForChanges = (date, now = new Date()) => {
  const target = istStartOfDay(date);
  const today = istStartOfDay(now);
  if (target < today) return true;
  if (target > istTomorrow(now)) return false; // further out than tomorrow: still open
  if (target.getTime() === today.getTime()) return true; // today's round is already out
  return istHour(now) >= CUTOFF_HOUR_IST;
};
