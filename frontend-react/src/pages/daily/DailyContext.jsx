import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { RHYTHMS, DELIVERY_SLOTS, FALLBACK_AREAS, decorate } from './catalogue';
import { addDays, dayKey, startOfDay, fromKey } from './dates';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const DailyContext = createContext(null);

export const useDaily = () => {
  const ctx = useContext(DailyContext);
  if (!ctx) throw new Error('useDaily must be used inside <DailyProvider>');
  return ctx;
};

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

/* ── the account is the store of record ────────────────────────────────────
   The plan — the crate, the rhythm, the slot and the skipped days — lives on
   the customer's Subscription, so it is the same on any device they sign in
   from. What is still per-device is the *draft* a customer builds during
   onboarding, before they have confirmed anything: there is no subscription to
   attach it to until they press confirm. It is keyed by user id so two accounts
   on the same phone never see each other's draft, and it is cleared the moment
   the plan is created. */

/* A visitor with no account gets one shared 'guest' draft. It is what stops a
   cart built before signing in from vanishing at the login screen — signing in
   unmounts the app, so in-memory state does not survive the trip. */
const GUEST = 'guest';
const draftKey = (userId) => `milquu.app.draft.${userId ?? GUEST}`;

const EMPTY_DRAFT = { crate: {}, cart: {}, rhythm: 'daily', slot: 'early' };

const readDraft = (key) => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return saved && typeof saved === 'object' ? { ...EMPTY_DRAFT, ...saved } : null;
  } catch {
    return null;
  }
};

const isEmptyDraft = (draft) =>
  !draft || (!Object.keys(draft.crate || {}).length && !Object.keys(draft.cart || {}).length);

/**
 * The draft for whoever is here now. On first sign-in the guest draft is
 * adopted, so the crate someone built before signing in follows them into
 * their account — but only when their own draft is empty, so it can never
 * overwrite work already saved against the account.
 */
const loadDraft = (userId) => {
  const own = readDraft(draftKey(userId));
  if (!userId) return own ?? EMPTY_DRAFT;
  if (!isEmptyDraft(own)) return own;

  const guest = readDraft(draftKey(null));
  if (isEmptyDraft(guest)) return own ?? EMPTY_DRAFT;

  try {
    localStorage.removeItem(draftKey(null));
  } catch {
    /* private mode — the adopted copy is already in hand */
  }
  return guest;
};

const BLANK_ADDRESS = { line1: '', line2: '', note: '', label: 'Home', area: '' };

/** The subscription the app treats as "the plan": the live one, if any. */
const livePlan = (subscriptions) =>
  subscriptions.find((s) => ['Active', 'Paused'].includes(s.status)) ?? null;

/* The React Compiler memoizes this provider, so nothing here is wrapped by hand. */
export function DailyProvider({ children }) {
  const { user, login } = useAuth();
  const userId = user?._id ?? null;

  const today = startOfDay();
  const tomorrow = addDays(today, 1);
  const tomorrowKey = dayKey(tomorrow);

  /* ── onboarding draft, per user ────────────────────────────────────────── */

  const [loadedFor, setLoadedFor] = useState(userId);
  const [draft, setDraft] = useState(() => loadDraft(userId));

  // Switching account swaps the whole draft rather than leaking the last one.
  if (loadedFor !== userId) {
    setLoadedFor(userId);
    setDraft(loadDraft(userId));
  }

  const patch = (fields) => setDraft((d) => ({ ...d, ...fields }));

  useEffect(() => {
    try {
      // Persisted for a guest too, so a cart survives the trip to the login
      // screen and back.
      localStorage.setItem(draftKey(userId), JSON.stringify(draft));
    } catch {
      /* private mode or a full quota — the session still works in memory */
    }
  }, [userId, draft]);

  /* ── account data, from the API ────────────────────────────────────────── */

  const [products, setProducts] = useState({});
  const [productList, setProductList] = useState([]);
  const [wallet, setWallet] = useState(0);
  const [ledger, setLedger] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [areas, setAreas] = useState(FALLBACK_AREAS);
  // The catalogue is fetched whether or not anyone is signed in, so the app
  // always has something to load before its first paint.
  const [loading, setLoading] = useState(true);

  const address = user?.deliveryAddress
    ? { ...BLANK_ADDRESS, ...user.deliveryAddress }
    : BLANK_ADDRESS;

  const refresh = async () => {
    // The catalogue is public: a signed-out visitor browsing the shop needs it,
    // and it is the same list for everyone.
    const productsRes = await api.get('/api/products').catch(() => null);
    if (productsRes) {
      // Prices, names and units are the server's. The app only adds copy.
      const list = (productsRes.data ?? []).map(decorate);
      setProductList(list);
      setProducts(Object.fromEntries(list.map((p) => [p.id, p])));
    }

    // Everything below belongs to an account. With no one signed in there is
    // nothing to fetch, and the previous account's data must not linger.
    if (!userId) {
      setWallet(0);
      setLedger([]);
      setOrders([]);
      setSubscriptions([]);
      return;
    }

    const [walletRes, ordersRes, subsRes] = await Promise.allSettled([
      api.get('/api/users/wallet'),
      api.get('/api/users/orders'),
      api.get('/api/users/subscriptions'),
    ]);
    if (walletRes.status === 'fulfilled') {
      setWallet(walletRes.value.data.walletBalance ?? 0);
      setLedger(walletRes.value.data.transactions ?? []);
    }
    if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data ?? []);
    if (subsRes.status === 'fulfilled') setSubscriptions(subsRes.value.data ?? []);
  };

  /* Runs once for a visitor with no account, and again when they sign in or
     switch account. */
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

  /* ── catalogue helpers ─────────────────────────────────────────────────── */

  const productOf = (id) => products[id] ?? null;

  /** Price of one unit, at the plan or one-off rate. Both come from the server. */
  const priceOf = (id, onPlan = true) => {
    const p = products[id];
    if (!p) return 0;
    return onPlan && p.plan ? p.plan : p.price;
  };

  const sumItems = (items, onPlan = true) =>
    Object.keys(items).reduce((total, id) => total + items[id] * priceOf(id, onPlan), 0);

  const itemRows = (items) =>
    Object.keys(items)
      .filter((id) => products[id])
      .map((id) => ({ ...products[id], qty: items[id] }));

  const milks = productList.filter((p) => p.cat === 'milk' && p.plan);
  /** Add-ons offered next to the plan: everything that is not milk. */
  const suggested = productList.filter((p) => p.cat !== 'milk').slice(0, 3);

  /* ── the plan, from the account ────────────────────────────────────────── */

  const plan = livePlan(subscriptions);
  const planActive = Boolean(plan);

  /** The crate: the saved plan's items, or the onboarding draft if there is none. */
  const crate = plan
    ? Object.fromEntries(
        plan.items
          .map((item) => [String(item.product?._id ?? item.product), item.quantity])
          .filter(([id]) => id && id !== 'undefined')
      )
    : draft.crate;

  const cart = draft.cart;

  const rhythm = plan
    ? (plan.weekdays?.length ? 'custom' : (plan.frequency === 'Alternate Days' ? 'alternate' : 'daily'))
    : draft.rhythm;
  const slot = plan ? (plan.slotWindow ?? 'early') : draft.slot;

  const rhythmDef = RHYTHMS.find((r) => r.key === rhythm) ?? RHYTHMS[0];
  const slotDef = DELIVERY_SLOTS.find((s) => s.key === slot) ?? DELIVERY_SLOTS[0];

  /**
   * Does the plan deliver on this date? Mirrors the server's isDeliveryDay, so
   * the calendar the customer sees agrees with what the engine will actually
   * do. Alternate days are counted from the plan's start date, which is why
   * this cannot be answered from a fixed weekday list.
   */
  const planStart = plan?.startDate ? startOfDay(new Date(plan.startDate)) : tomorrow;
  const inRhythm = (date) => {
    const day = startOfDay(date);
    if (day < planStart) return false;
    if (rhythm === 'daily') return true;
    if (rhythm === 'alternate') {
      const days = Math.round((day - planStart) / 86400000);
      return days % 2 === 0;
    }
    const chosen = plan?.weekdays?.length ? plan.weekdays : rhythmDef.days ?? [];
    return chosen.includes(day.getDay());
  };

  /** Days the customer has skipped, as `YYYY-MM-DD` keys. */
  const skipped = new Set((plan?.skipDates ?? []).map((d) => dayKey(new Date(d))));
  const isSkipped = (key) => skipped.has(key);
  const tomorrowSkipped = isSkipped(tomorrowKey);
  const itemsOn = (key) => (isSkipped(key) ? {} : { ...crate });

  /** The customer's locality, as shown on the "deliver to" line. */
  const areaName = areas.find((a) => a.slug === address.area)?.name ?? '';

  const crateTotal = sumItems(crate);
  const cartTotal = sumItems(cart, false);
  const cartCount = countItems(cart);

  const tomorrowTotal = tomorrowSkipped ? cartTotal : crateTotal + cartTotal;
  const upiDue = Math.max(0, tomorrowTotal - wallet);

  const planDaily = crateTotal;
  const planMonthly = plan?.monthlyTotal ?? planDaily * rhythmDef.perMonth;
  const savingsMonthly = Math.round((planMonthly * SAVINGS_PERCENT) / (100 - SAVINGS_PERCENT));
  const runwayDays = planDaily > 0 ? Math.floor(wallet / planDaily) : 0;

  const planStartedOn = plan?.startDate ? dayKey(new Date(plan.startDate)) : null;

  /* ── actions ───────────────────────────────────────────────────────────── */

  /* Crate edits before the plan exists are local; once it exists they are a
     PUT, so the change is on the account and not just on this phone. */
  const bumpCrate = async (id, delta) => {
    if (!plan) {
      setDraft((d) => ({ ...d, crate: bumped(d.crate, id, delta) }));
      return;
    }
    const next = bumped(crate, id, delta);
    const items = Object.entries(next).map(([product, quantity]) => ({ product, quantity }));
    if (!items.length) {
      flash('A plan needs at least one item');
      return;
    }
    try {
      await savePlan({ items });
    } catch (err) {
      flash(err.response?.data?.message || 'Could not update your plan');
    }
  };

  const bumpCart = (id, delta) =>
    setDraft((d) => ({ ...d, cart: bumped(d.cart, id, delta) }));

  const addToCart = (id) => {
    bumpCart(id, 1);
    flash(`${products[id]?.name ?? 'Item'} added to tomorrow`);
  };

  /**
   * A plan needs a milk on it. Written as a set rather than an increment so
   * calling it twice — as StrictMode does — still leaves exactly one litre.
   */
  const ensurePlanMilk = () =>
    setDraft((d) => {
      if (Object.keys(d.crate).length) return d;
      const first = milks[0];
      return first ? { ...d, crate: { ...d.crate, [first.id]: 1 } } : d;
    });

  /** Push a change to the saved plan and refresh from the response. */
  const savePlan = async (changes) => {
    if (!plan) return null;
    const { data } = await api.put(`/api/users/subscriptions/${plan._id}`, changes);
    setSubscriptions((subs) => subs.map((s) => (s._id === data._id ? data : s)));
    return data;
  };

  const toggleSkip = async (key) => {
    if (!plan) return;
    const { data } = await api.post(`/api/users/subscriptions/${plan._id}/skip`, {
      date: fromKey(key).toISOString(),
    });
    setSubscriptions((subs) => subs.map((s) => (s._id === data.subscription._id ? data.subscription : s)));
  };

  const toggleSkipTomorrow = () => toggleSkip(tomorrowKey);

  const pauseRange = async (from, to) => {
    if (!plan) return;
    const { data } = await api.post(`/api/users/subscriptions/${plan._id}/pause`, {
      from: startOfDay(from).toISOString(),
      to: startOfDay(to).toISOString(),
    });
    setSubscriptions((subs) => subs.map((s) => (s._id === data._id ? data : s)));
  };

  const cancelPlan = async () => {
    if (!plan) return;
    const { data } = await api.post(`/api/users/subscriptions/${plan._id}/cancel`);
    setSubscriptions((subs) => subs.map((s) => (s._id === data._id ? data : s)));
  };

  const setRhythm = async (value) => {
    if (!plan) { patch({ rhythm: value }); return; }
    const def = RHYTHMS.find((r) => r.key === value);
    await savePlan({ frequency: value, weekdays: value === 'custom' ? def?.days : undefined });
  };

  const setSlot = async (value) => {
    if (!plan) { patch({ slot: value }); return; }
    await savePlan({ slotWindow: value });
  };

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

  /** Confirm the onboarding draft as a real subscription on the account. */
  const startPlan = async () => {
    const items = Object.entries(draft.crate).map(([product, quantity]) => ({ product, quantity }));
    if (!items.length) throw new Error('Add some milk to your plan first');

    const def = RHYTHMS.find((r) => r.key === draft.rhythm);
    const { data } = await api.post('/api/users/subscriptions', {
      items,
      frequency: draft.rhythm,
      weekdays: draft.rhythm === 'custom' ? def?.days : undefined,
      slotWindow: draft.slot,
    });

    setSubscriptions((subs) => [...subs, data]);
    // The draft has become a real plan; there is nothing left to keep locally.
    setDraft((d) => ({ ...EMPTY_DRAFT, cart: d.cart }));
    flash('Your plan starts tomorrow morning');
    return data;
  };

  const clearCart = () => patch({ cart: {} });

  /**
   * Place the one-off extras in the cart as a real order for tomorrow, paid
   * from the wallet. The plan's own crate is charged by the nightly engine, so
   * it is deliberately not included here.
   */
  const placeOrder = async () => {
    const items = Object.entries(cart).map(([product, quantity]) => ({ product, quantity }));
    if (!items.length) throw new Error('Nothing to order');

    const { data } = await api.post('/api/users/orders', { items });
    setOrders((list) => [data.order, ...list]);
    setWallet(data.walletBalance);
    return data.order;
  };

  const value = {
    user,
    loading,
    areas,
    areaName,

    products,
    productList,
    productOf,
    priceOf,
    sumItems,
    itemRows,
    milks,
    suggested,

    today,
    tomorrow,
    tomorrowKey,
    isSkipped,
    inRhythm,
    itemsOn,
    toggleSkip,
    toggleSkipTomorrow,
    tomorrowSkipped,
    pauseRange,
    cancelPlan,

    crate,
    crateTotal,
    bumpCrate,
    ensurePlanMilk,

    cart,
    cartTotal,
    cartCount,
    bumpCart,
    addToCart,
    clearCart,
    placeOrder,

    wallet,
    ledger,
    orders,
    subscriptions,
    plan,
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
