import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { PRODUCTS, RHYTHMS, DELIVERY_SLOTS, STANDING_ORDER, priceOf } from './catalogue';
import { addDays, dayKey, startOfDay } from './dates';

const DailyContext = createContext(null);

export const useDaily = () => {
  const ctx = useContext(DailyContext);
  if (!ctx) throw new Error('useDaily must be used inside <DailyProvider>');
  return ctx;
};

/** Total value of an item bucket ({ productKey: qty }) at plan or one-off rates. */
export const sumItems = (items, onPlan = true) =>
  Object.keys(items).reduce((total, key) => total + items[key] * priceOf(key, onPlan), 0);

/** Turn an item bucket into rows the list components can render. */
export const itemRows = (items) =>
  Object.keys(items).map((key) => ({ ...PRODUCTS[key], qty: items[key] }));

export const countItems = (items) =>
  Object.keys(items).reduce((total, key) => total + items[key], 0);

const bumped = (items, key, delta, min = 0) => {
  const next = { ...items };
  next[key] = Math.max(min, (next[key] || 0) + delta);
  if (!next[key]) delete next[key];
  return next;
};

const TODAY = startOfDay();

/** The percentage a plan saves against the one-off price. */
export const SAVINGS_PERCENT = 12;

/* Design content that has no interactive behaviour — the rider, the timeline
   and the ledger are read-only in this build. */
export const RIDER = { initials: 'RS', name: 'Ravi Shinde', note: 'Your street since March · 4.9' };

export const TRACK_STEPS = [
  ['Bottled at the dairy', '5:38 am · batch #204', 'done'],
  ['Left for Karanjade', '5:52 am · 18 crates', 'done'],
  ['On your street', 'Sai Residency next · 4 stops', 'now'],
  ['In your milk box', 'Photo proof when delivered', 'todo'],
];

export const LEDGER = [
  ['Monday’s crate', '3 Aug · 2 L milk, dahi', -180],
  ['Skipped Sunday', '2 Aug · refunded to wallet', 120],
  ['Recharge · UPI', '1 Aug · ravi@okhdfc', 1000],
  ['A2 Ghee 250 g', '31 Jul · one-off', -720],
];

export const PAST_ORDERS = [
  ['Mon 3 Aug · 2 L milk, dahi', 'Delivered 6:42 am · photo', true],
  ['Sat 1 Aug · 2 L milk, ghee', 'Delivered 6:31 am', true],
  ['Fri 31 Jul · 2 L milk', 'Delivered late, 8:05 am · ₹20 credited', false],
];

/* The React Compiler memoizes this provider, so nothing here is wrapped by hand. */
export function DailyProvider({ children }) {
  const today = TODAY;
  const tomorrow = addDays(today, 1);
  const tomorrowKey = dayKey(tomorrow);

  /* Day exceptions, keyed YYYY-MM-DD: { mode: 'skip' }. The plan itself is the
     standing order; a day only appears here when it departs from it. */
  const [days, setDays] = useState(() => ({ [dayKey(addDays(TODAY, 3))]: { mode: 'skip' } }));
  const [crate, setCrate] = useState(STANDING_ORDER);
  const [cart, setCart] = useState({});
  const [wallet, setWallet] = useState(420);
  const [rhythm, setRhythm] = useState('daily');
  const [slot, setSlot] = useState('early');
  const [address, setAddress] = useState({
    flat: 'B-704, Sai Residency',
    street: 'Plot 22, near Gharda school',
    note: 'In the milk box outside the door. Please don’t ring the bell before 6:30.',
    label: 'Home',
  });
  const [planActive, setPlanActive] = useState(true);
  const [toast, setToast] = useState('');

  const toastTimer = useRef(null);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const flash = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  };

  /* ── derived ───────────────────────────────────────────────────────────── */

  const rhythmDef = RHYTHMS.find((r) => r.key === rhythm) ?? RHYTHMS[0];
  const slotDef = DELIVERY_SLOTS.find((s) => s.key === slot) ?? DELIVERY_SLOTS[0];

  const isSkipped = (key) => days[key]?.mode === 'skip';
  const tomorrowSkipped = isSkipped(tomorrowKey);

  /** What actually arrives on a day: nothing when skipped, else the crate. */
  const itemsOn = (key) => (isSkipped(key) ? {} : { ...crate });

  const crateTotal = sumItems(crate);
  const cartTotal = sumItems(cart, false);
  const cartCount = countItems(cart);

  /* Tomorrow's bill is the crate plus anything added one-off. */
  const tomorrowTotal = tomorrowSkipped ? 0 : crateTotal + cartTotal;
  const upiDue = Math.max(0, tomorrowTotal - wallet);

  const planDaily = crateTotal;
  const planMonthly = planDaily * rhythmDef.perMonth;
  const savingsMonthly = Math.round((planMonthly * SAVINGS_PERCENT) / (100 - SAVINGS_PERCENT));
  const runwayDays = planDaily > 0 ? Math.floor(wallet / planDaily) : 0;

  /* ── actions ───────────────────────────────────────────────────────────── */

  const bumpCrate = (key, delta) => setCrate((c) => bumped(c, key, delta));
  const bumpCart = (key, delta) => setCart((c) => bumped(c, key, delta));

  const addToCart = (key) => {
    setCart((c) => bumped(c, key, 1));
    flash(`${PRODUCTS[key].name} added to tomorrow`);
  };

  /** Put a product on the standing order rather than into a single crate. */
  const addToPlan = (key) => {
    setCrate((c) => bumped(c, key, 1));
    flash(`${PRODUCTS[key].name} added to your plan`);
  };

  const toggleSkip = (key) => {
    setDays((d) => {
      const next = { ...d };
      if (next[key]?.mode === 'skip') delete next[key];
      else next[key] = { mode: 'skip' };
      return next;
    });
  };

  const toggleSkipTomorrow = () => toggleSkip(tomorrowKey);

  /** Skip every day in an inclusive range. */
  const pauseRange = (from, to) => {
    setDays((d) => {
      const next = { ...d };
      for (let cur = startOfDay(from); cur <= startOfDay(to); cur = addDays(cur, 1)) {
        next[dayKey(cur)] = { mode: 'skip' };
      }
      return next;
    });
  };

  const topUp = (amount) => {
    setWallet((w) => w + amount);
    flash(`Added ₹${amount.toLocaleString('en-IN')} to your wallet`);
  };

  /**
   * Settle tomorrow's crate. Anything the wallet can't cover is treated as paid
   * by the chosen method, so the balance never goes negative.
   */
  const checkout = (method = 'wallet') => {
    setWallet((w) => Math.max(0, w - Math.min(w, tomorrowTotal)));
    setCart({});
    flash(method === 'cash' ? 'Confirmed — pay Ravi at the door' : 'Paid. See you at 6 tomorrow');
  };

  /** Finish signup: the picked milk and rhythm become the standing order. */
  const startPlan = () => {
    setPlanActive(true);
    flash('Your plan starts tomorrow morning');
  };

  const value = {
    today,
    tomorrow,
    tomorrowKey,
    days,
    isSkipped,
    itemsOn,
    toggleSkip,
    toggleSkipTomorrow,
    tomorrowSkipped,
    pauseRange,

    crate,
    crateTotal,
    bumpCrate,
    addToPlan,

    cart,
    cartTotal,
    cartCount,
    bumpCart,
    addToCart,

    wallet,
    topUp,
    checkout,
    tomorrowTotal,
    upiDue,
    runwayDays,

    rhythm,
    setRhythm,
    rhythmDef,
    slot,
    setSlot,
    slotDef,
    planDaily,
    planMonthly,
    savingsMonthly,
    savingsPercent: SAVINGS_PERCENT,

    address,
    setAddress,
    planActive,
    startPlan,

    toast,
    flash,
  };

  return <DailyContext.Provider value={value}>{children}</DailyContext.Provider>;
}
