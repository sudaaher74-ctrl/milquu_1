// GA4 measurement.
//
// The gtag.js loader (and `gtag('config', …)`) lives in index.html with
// `send_page_view: false`; this module is the only place that sends events, so
// every hit is sent exactly once. (Previously both gtag('config') and
// react-ga4 sent page views, double-counting every navigation.)
//
// Measurement ID: VITE_GA_MEASUREMENT_ID (index.html carries the production ID
// for the initial gtag.js load).
//
// Privacy: never put names, phone numbers, emails, addresses or free text in
// event parameters — only product / order identifiers and amounts.
//
// Event names follow GA4's recommended e-commerce / lead events:
// view_item, select_item, add_to_cart, begin_checkout, purchase, generate_lead,
// plus `subscribe` and `contact` (custom, as the brief requires).

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-9S1HY0WW38';
const CURRENCY = 'INR';

// Never measure the internal dashboards / staff tools.
const UNTRACKED_PREFIXES = ['/admin', '/delivery', '/chatbot'];
const isUntracked = (path = '') => UNTRACKED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

const gtag = (...args) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
    return true;
  }
  return false;
};

/** Kept for backwards compatibility — initialisation now happens in index.html. */
export const initGA = () => {};

export const trackPageView = (path) => {
  if (isUntracked(path)) return;
  gtag('event', 'page_view', {
    page_path: path,
    page_location: typeof window !== 'undefined' ? window.location.href : undefined,
    page_title: typeof document !== 'undefined' ? document.title : undefined,
    send_to: GA_MEASUREMENT_ID,
  });
};

/** Legacy generic event (category/action/label). Prefer the helpers below. */
export const trackEvent = (category, action, label = '') => {
  gtag('event', action, { event_category: category, event_label: label });
};

// ── E-commerce helpers ───────────────────────────────────────────────────────
const toItem = (p = {}, quantity) => ({
  item_id: String(p.id ?? p._id ?? p.sku ?? p.slug ?? p.name ?? ''),
  item_name: p.name || p.displayName,
  item_brand: 'MilQuuFresh',
  ...(p.category ? { item_category: p.category } : {}),
  ...(p.price != null ? { price: Number(p.price) } : {}),
  quantity: quantity ?? p.quantity ?? 1,
});

const sumValue = (items) => items.reduce((t, i) => t + (i.price || 0) * (i.quantity || 1), 0);

export const trackViewItem = (product) => {
  const item = toItem(product, 1);
  gtag('event', 'view_item', { currency: CURRENCY, value: item.price || 0, items: [item] });
};

export const trackSelectItem = (product, listName = '') => {
  gtag('event', 'select_item', { item_list_name: listName, items: [toItem(product, 1)] });
};

export const trackAddToCart = (product, quantity = 1) => {
  const item = toItem(product, quantity);
  gtag('event', 'add_to_cart', { currency: CURRENCY, value: (item.price || 0) * quantity, items: [item] });
};

export const trackBeginCheckout = (products = []) => {
  const items = products.map((p) => toItem(p));
  gtag('event', 'begin_checkout', { currency: CURRENCY, value: sumValue(items), items });
};

// A purchase must be reported once per order. The id of every reported order is
// remembered for the browser session, so a re-render, a success-page reload or a
// double submit cannot send it twice. Orders without a real id are skipped
// rather than reported with an invented one.
const PURCHASE_KEY = 'mq_ga_purchases';
const readReported = () => {
  try {
    return JSON.parse(sessionStorage.getItem(PURCHASE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const trackPurchase = ({ transactionId, value, items = [] }) => {
  if (!transactionId) return false;
  const id = String(transactionId);
  const reported = readReported();
  if (reported.includes(id)) return false;
  try {
    sessionStorage.setItem(PURCHASE_KEY, JSON.stringify([...reported, id].slice(-50)));
  } catch {
    /* storage unavailable — still send once for this call */
  }
  return gtag('event', 'purchase', {
    transaction_id: id,
    currency: CURRENCY,
    value: Number(value) || 0,
    items: items.map((p) => toItem(p)),
  });
};

// ── Lead / engagement events (no personal data) ──────────────────────────────
/** `source` is a short fixed label such as 'product_whatsapp_inquiry'. */
export const trackGenerateLead = (source) => gtag('event', 'generate_lead', { lead_source: source });

/** Fire only after the subscription API call has actually succeeded. */
export const trackSubscribe = ({ frequency, value, items = [] } = {}) =>
  gtag('event', 'subscribe', {
    currency: CURRENCY,
    ...(frequency ? { frequency } : {}),
    ...(value != null ? { value: Number(value) || 0 } : {}),
    items: items.map((p) => toItem(p)),
  });

/** method: 'whatsapp' | 'phone' | 'email' | 'form'. `location` is the page area. */
export const trackContact = (method, location = '') =>
  gtag('event', 'contact', { contact_method: method, ...(location ? { contact_location: location } : {}) });
