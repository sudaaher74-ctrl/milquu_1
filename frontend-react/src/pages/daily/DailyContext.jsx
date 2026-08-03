import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { PRODUCTS, RHYTHMS, DELIVERY_SLOTS, FALLBACK_AREAS, priceOf } from './catalogue';
import { addDays, dayKey, startOfDay } from './dates';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

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

/* ── per-device draft state ────────────────────────────────────────────────
   The account is the store of record: profile, address, wallet and orders all
   come from the API and are scoped to the signed-in user by their token.

   What lives here instead is the plan *draft* — the crate, rhythm, slot and
   skipped days — because the Subscription model has no per-date skip list yet,
   so there is nowhere on the server to put it. It is keyed by user id so two
   accounts on the same phone never see each other's draft. */

const draftKey = (userId) => `milquu.app.draft.${userId}`;

const EMPTY_DRAFT = {
  days: {},
  crate: {},
  cart: {},
  rhythm: 'daily',
  slot: 'early',
  planActive: false,
  planStartedOn: null,
};

const loadDraft = (userId) => {
  if (!userId || typeof localStorage === 'undefined') return EMPTY_DRAFT;
  try {
    const saved = JSON.parse(localStorage.getItem(draftKey(userId)));
    return saved && typeof saved === 'object' ? { ...EMPTY_DRAFT, ...saved } : EMPTY_DRAFT;
  } catch {
    return EMPTY_DRAFT;
  }
};

const BLANK_ADDRESS = { line1: '', line2: '', note: '', label: 'Home', area: '' };

/* The React Compiler memoizes this provider, so nothing here is wrapped by hand. */
export function DailyProvider({ children }) {
  const { user, login } = useAuth();
  const userId = user?._id ?? null;

  const today = startOfDay();
  const tomorrow = addDays(today, 1);
  const tomorrowKey = dayKey(tomorrow);

  /* ── draft, per user ───────────────────────────────────────────────────── */

  const [loadedFor, setLoadedFor] = useState(userId);
  const [draft, setDraft] = useState(() => loadDraft(userId));

  // Switching account swaps the whole draft rather than leaking the last one.
  if (loadedFor !== userId) {
    setLoadedFor(userId);
    setDraft(loadDraft(userId));
  }

  const { days, crate, cart, rhythm, slot, planActive, planStartedOn } = draft;
  const patch = (fields) => setDraft((d) => ({ ...d, ...fields }));

  useEffect(() => {
    if (!userId) return;
    try {
      localStorage.setItem(draftKey(userId), JSON.stringify(draft));
    } catch {
      /* private mode or a full quota — the session still works in memory */
    }
  }, [userId, draft]);

  /* ── account data, from the API ────────────────────────────────────────── */

  const [wallet, setWallet] = useState(0);
  const [ledger, setLedger] = useState([]);
  const [orders, setOrders] = useState([]);
  const [areas, setAreas] = useState(FALLBACK_AREAS);
  const [loading, setLoading] = useState(Boolean(userId));

  const address = user?.deliveryAddress
    ? { ...BLANK_ADDRESS, ...user.deliveryAddress }
    : BLANK_ADDRESS;

  const refresh = async () => {
    if (!userId) return;
    const [walletRes, ordersRes] = await Promise.allSettled([
      api.get('/api/users/wallet'),
      api.get('/api/users/orders'),
    ]);
    if (walletRes.status === 'fulfilled') {
      setWallet(walletRes.value.data.walletBalance ?? 0);
      setLedger(walletRes.value.data.transactions ?? []);
    }
    if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data ?? []);
  };

  /* DailyApp only mounts this provider for a signed-in customer, so there is
     always an account to load. Switching account re-runs the fetch. */
  useEffect(() => {
    let live = true;
    (async () => {
      await refresh();
      if (live) setLoading(false);
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // The serviceable-area list is the same for everyone and rarely changes.
  useEffect(() => {
    let live = true;
    api.get('/api/service-areas')
      .then(({ data }) => { if (live && data?.length) setAreas(data); })
      .catch(() => { /* keep FALLBACK_AREAS so the picker still works */ });
    return () => { live = false; };
  }, []);

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

  /** The customer's locality, as shown on the "deliver to" line. */
  const areaName = areas.find((a) => a.slug === address.area)?.name ?? '';

  const isSkipped = (key) => days[key]?.mode === 'skip';
  const tomorrowSkipped = isSkipped(tomorrowKey);
  const itemsOn = (key) => (isSkipped(key) ? {} : { ...crate });

  const crateTotal = sumItems(crate);
  const cartTotal = sumItems(cart, false);
  const cartCount = countItems(cart);

  const tomorrowTotal = tomorrowSkipped ? cartTotal : crateTotal + cartTotal;
  const upiDue = Math.max(0, tomorrowTotal - wallet);

  const planDaily = crateTotal;
  const planMonthly = planDaily * rhythmDef.perMonth;
  const savingsMonthly = Math.round((planMonthly * SAVINGS_PERCENT) / (100 - SAVINGS_PERCENT));
  const runwayDays = planDaily > 0 ? Math.floor(wallet / planDaily) : 0;

  /* ── actions ───────────────────────────────────────────────────────────── */

  const bumpCrate = (key, delta) =>
    setDraft((d) => ({ ...d, crate: bumped(d.crate, key, delta) }));
  const bumpCart = (key, delta) =>
    setDraft((d) => ({ ...d, cart: bumped(d.cart, key, delta) }));

  const addToCart = (key) => {
    bumpCart(key, 1);
    flash(`${PRODUCTS[key].name} added to tomorrow`);
  };

  const addToPlan = (key) => {
    bumpCrate(key, 1);
    flash(`${PRODUCTS[key].name} added to your plan`);
  };

  /**
   * A plan needs a milk on it. Written as a set rather than an increment so
   * calling it twice — as StrictMode does — still leaves exactly one litre.
   */
  const ensurePlanMilk = () =>
    setDraft((d) => (d.crate.cow || d.crate.buf ? d : { ...d, crate: { ...d.crate, cow: 1 } }));

  const toggleSkip = (key) =>
    setDraft((d) => {
      const next = { ...d.days };
      if (next[key]?.mode === 'skip') delete next[key];
      else next[key] = { mode: 'skip' };
      return { ...d, days: next };
    });

  const toggleSkipTomorrow = () => toggleSkip(tomorrowKey);

  const pauseRange = (from, to) =>
    setDraft((d) => {
      const next = { ...d.days };
      for (let cur = startOfDay(from); cur <= startOfDay(to); cur = addDays(cur, 1)) {
        next[dayKey(cur)] = { mode: 'skip' };
      }
      return { ...d, days: next };
    });

  const setRhythm = (value) => patch({ rhythm: value });
  const setSlot = (value) => patch({ slot: value });

  /**
   * Save the delivery address on the account. The PUT response carries no token,
   * so it is merged onto the signed-in user rather than replacing it — replacing
   * would drop the JWT and sign them out.
   */
  const saveAddress = async (next) => {
    const { data } = await api.put('/api/users/profile', { deliveryAddress: next });
    login({ ...user, ...data });
    return data;
  };

  const startPlan = () => {
    patch({ planActive: true, planStartedOn: planStartedOn ?? dayKey(today) });
    flash('Your plan starts tomorrow morning');
  };

  const clearCart = () => patch({ cart: {} });

  const value = {
    user,
    loading,
    areas,
    areaName,

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
    clearCart,

    wallet,
    ledger,
    orders,
    refresh,
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
    saveAddress,
    planActive,
    planStartedOn,
    startPlan,

    toast,
    flash,
  };

  return <DailyContext.Provider value={value}>{children}</DailyContext.Provider>;
}
