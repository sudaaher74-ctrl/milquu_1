// Calendar helpers for the planner. Days are identified by a local `YYYY-MM-DD`
// key so a day survives timezone maths and can be used as an object key.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

export const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const addDays = (date, n) => {
  const d = startOfDay(date);
  d.setDate(d.getDate() + n);
  return d;
};

export const dayKey = (date) => {
  const d = startOfDay(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

export const fromKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** "30 Jul" */
export const fmtShort = (date) => `${date.getDate()} ${MONTHS[date.getMonth()]}`;

/** "Thu 30 Jul" */
export const fmtDay = (date) => `${WEEKDAYS[date.getDay()]} ${fmtShort(date)}`;

export const monthName = (date) => MONTHS_LONG[date.getMonth()];

/**
 * Grid of the given month, Monday-first, padded with nulls so the first row
 * lines up under the right weekday.
 */
export const monthGrid = (date) => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7; // Sunday is 0; we start on Monday
  const length = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: lead }, () => null);
  for (let n = 1; n <= length; n += 1) {
    cells.push(new Date(date.getFullYear(), date.getMonth(), n));
  }
  return cells;
};

export const WEEKDAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
