import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { PRODUCTS, RHYTHMS, DELIVERY_SLOTS, priceOf } from './catalogue';
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

/** The percentage a plan saves against the one-off price. */
export const SAVINGS_PERCENT = 12;

/* ── persistence ───────────────────────────────────────────────────────────
   Everything here is created by the person using the app — there is no seeded
   content. Until the screens are wired to the API this is the store of record,
   so it is kept in localStorage rather than lost on every refresh. */

const STORAGE_KEY = 'milquu.app.v1';

const EMPTY = {
  days: {},
  crate: {},
  cart: {},
  wallet: 0,
  rhythm: 'daily',
  slot: 'early',
  address: { flat: '', street: '', note: '', label: 'Home' },
  planActive: false,
  planStartedOn: null,
  ledger: [],
  orders: [],
};

const loadState = () => {
  if (typeof localStorage === 'undefined') return EMPTY;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === 'object' ? { ...EMPTY, ...saved } : EMPTY;
  } catch {
    return EMPTY;
  }
};

/* The React Compiler memoizes this provider, so nothing here is wrapped by hand. */
export function DailyProvider({ children }) {
  const today = startOfDay();
  const tomorrow = addDays(today, 1);
  const tomorrowKey = dayKey(tomorrow);

  const [saved] = useState(loadState);

  const [days, setDays] = useState(saved.days);
  const [crate, setCrate] = useState(saved.crate);
  const [cart, setCart] = useState(saved.cart);
  const [wallet, setWallet] = useState(saved.wallet);
  const [rhythm, setRhythm] = useState(saved.rhythm);
  const [slot, setSlot] = useState(saved.slot);
  const [address, setAddress] = useState(saved.address);
  const [planActive, setPlanActive] = useState(saved.planActive);
  const [planStartedOn, setPlanStartedOn] = useState(saved.planStartedOn);
  const [ledger, setLedger] = useState(saved.ledger);
  const [orders, setOrders] = useState(saved.orders);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const state = {
      days, crate, cart, wallet, rhythm, slot, address,
      planActive, planStartedOn, ledger, orders,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* private mode or a full quota — the session still works in memory */
    }
  }, [days, crate, cart, wallet, rhythm, slot, address, planActive, planStartedOn, ledger, orders]);

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
  const tomorrowTotal = tomorrowSkipped ? cartTotal : crateTotal + cartTotal;
  const upiDue = Math.max(0, tomorrowTotal - wallet);

  const planDaily = crateTotal;
  const planMonthly = planDaily * rhythmDef.perMonth;
  const savingsMonthly = Math.round((planMonthly * SAVINGS_PERCENT) / (100 - SAVINGS_PERCENT));
  const runwayDays = planDaily > 0 ? Math.floor(wallet / planDaily) : 0;

  /** The order scheduled for tomorrow, once one has been paid for. */
  const nextOrder = orders.find((o) => o.on === tomorrowKey) ?? null;

  /* ── actions ───────────────────────────────────────────────────────────── */

  const bumpCrate = (key, delta) => setCrate((c) => bumped(c, key, delta));
  const bumpCart = (key, delta) => setCart((c) => bumped(c, key, delta));

  const addToCart = (key) => {
    setCart((c) => bumped(c, key, 1));
    flash(`${PRODUCTS[key].name} added to tomorrow`);
  };

  /**
   * A plan needs a milk on it. Written as a set rather than an increment so
   * calling it twice — as StrictMode does — still leaves exactly one litre.
   */
  const ensurePlanMilk = () =>
    setCrate((c) => (c.cow || c.buf ? c : { ...c, cow: 1 }));

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

  const record = (entry) =>
    setLedger((l) => [{ id: `${Date.now()}-${l.length}`, at: dayKey(today), ...entry }, ...l]);

  const topUp = (amount) => {
    setWallet((w) => w + amount);
    record({ title: 'Wallet top-up', note: 'Added in the app', amount });
    flash(`Added ₹${amount.toLocaleString('en-IN')} to your wallet`);
  };

  /**
   * Settle tomorrow's crate: schedule the order, take what the wallet can cover
   * and log it. Anything above the balance is settled by the chosen method, so
   * the balance never goes negative.
   */
  const checkout = (method = 'wallet') => {
    const total = tomorrowTotal;
    const items = { ...crate, ...cart };
    const fromWallet = Math.min(wallet, total);

    setOrders((o) => [
      {
        id: `${Date.now()}`,
        on: tomorrowKey,
        items,
        total,
        slot,
        method,
        status: 'scheduled',
      },
      ...o,
    ]);
    if (fromWallet > 0) {
      setWallet((w) => w - fromWallet);
      record({ title: 'Tomorrow’s crate', note: 'Paid from wallet', amount: -fromWallet });
    }
    setCart({});
    flash(method === 'cash' ? 'Confirmed — pay at the door' : 'Paid. Your crate is scheduled');
  };

  /** Finish signup: the picked milk and rhythm become the standing order. */
  const startPlan = () => {
    setPlanActive(true);
    setPlanStartedOn((d) => d ?? dayKey(today));
    flash('Your plan starts tomorrow morning');
  };

  /** Wipe everything this device has stored and go back to a new-user state. */
  const resetApp = () => {
    setDays(EMPTY.days);
    setCrate(EMPTY.crate);
    setCart(EMPTY.cart);
    setWallet(EMPTY.wallet);
    setRhythm(EMPTY.rhythm);
    setSlot(EMPTY.slot);
    setAddress(EMPTY.address);
    setPlanActive(false);
    setPlanStartedOn(null);
    setLedger([]);
    setOrders([]);
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
    ensurePlanMilk,

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
    ledger,
    orders,
    nextOrder,

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
    planStartedOn,
    startPlan,
    resetApp,

    toast,
    flash,
  };

  return <DailyContext.Provider value={value}>{children}</DailyContext.Provider>;
}
