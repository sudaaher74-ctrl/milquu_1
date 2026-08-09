// Presentation copy and fixed choices for the Milquu app.
//
// The product list itself is NOT here any more — it comes from GET /api/products
// and is loaded by DailyContext, keyed by Product._id. Prices, names, units and
// images are the server's. What stays here is the editorial copy the app shows
// alongside a product (the tagline, the tasting note, the spec table), which is
// written per product and does not belong in a database row.
//
// Copy is looked up by product name. A product with no entry still renders —
// it just shows what the API actually knows about it, rather than borrowing
// another product's description.

/** Editorial copy, keyed by the product name as seeded in the database. */
export const PRESENTATION = {
  'A2 Cow Milk': {
    short: 'Cow Milk',
    kicker: 'Desi cow',
    meta: 'Light, 4.1% fat · glass bottle',
    desc: 'Milked before dawn, chilled within the hour, bottled in glass and driven straight to Karanjade. Nothing added, nothing taken out — the cream still rises.',
    sub: 'Gir and Sahiwal cows',
    tags: ['4.1% fat', 'No preservatives', 'Returnable glass'],
    spec: [['Fat', '4.1%'], ['SNF', '8.6%']],
  },
  'Pure Cow Milk': {
    short: 'Cow Milk',
    kicker: 'Farm fresh',
    meta: 'Light, 4.0% fat · glass bottle',
    desc: 'The everyday bottle. Same morning batch, same glass, on the doorstep before the kettle is on.',
    sub: 'Single-herd cow milk',
    tags: ['4.0% fat', 'No preservatives', 'Returnable glass'],
    spec: [['Fat', '4.0%'], ['SNF', '8.5%']],
  },
  'Premium Buffalo Milk': {
    short: 'Buffalo Milk',
    kicker: 'Full cream',
    meta: 'Full cream, 6.5% fat · for curd',
    desc: 'Thick and full-cream, the milk families set their curd with. Same morning batch, same glass bottle.',
    sub: 'Murrah buffalo',
    tags: ['6.5% fat', 'No preservatives', 'Returnable glass'],
    spec: [['Fat', '6.5%'], ['SNF', '9.2%']],
  },
  'A2 Cow Ghee': {
    short: 'A2 Ghee',
    kicker: 'Bilona',
    meta: 'Bilona churned · monthly',
    desc: 'Hand-churned the old way from cultured A2 curd, not cream. Grainy, golden and deeply aromatic.',
    sub: 'Bilona churned',
    tags: ['A2 milk', 'Hand churned', 'Glass jar'],
    spec: [['Moisture', '0.2%'], ['Free fatty acid', '0.9%']],
  },
  'Pure Cow Ghee': {
    short: 'Ghee',
    kicker: 'Slow cooked',
    meta: 'Slow cooked · monthly',
    desc: 'Simmered down slowly until it turns clear and nutty. The everyday jar for tadka and rotis.',
    sub: 'Slow-cooked cow ghee',
    tags: ['Hand churned', 'No palm oil', 'Glass jar'],
    spec: [['Moisture', '0.3%'], ['Free fatty acid', '1.0%']],
  },
  'Fresh Dahi': {
    short: 'Dahi',
    kicker: 'Set curd',
    meta: 'Set curd · Mon, Wed, Fri',
    desc: 'Set overnight in the same clay-cool room the milk comes from. Thick enough to hold a spoon.',
    sub: 'Naturally set',
    tags: ['Live cultures', 'No thickeners', 'Set overnight'],
    spec: [['Fat', '4.0%'], ['pH', '4.4']],
  },
  'Soft Paneer': {
    short: 'Paneer',
    kicker: 'Made 5 am',
    meta: 'Pressed at 5 am · weekly',
    desc: 'Curdled with lemon at five in the morning and pressed by seven. Soft enough to eat raw.',
    sub: 'Made this morning',
    tags: ['High protein', 'No vinegar', 'Made daily'],
    spec: [['Fat', '22%'], ['Protein', '18%']],
  },
  'Sweet Lassi': {
    short: 'Lassi',
    kicker: 'Sweet',
    meta: 'Churned sweet · daily',
    desc: 'Yesterday’s dahi churned with a little sugar and cardamom. Cold, thin and drinkable.',
    sub: 'Lightly sweetened',
    tags: ['Live cultures', 'No stabilisers', 'Churned daily'],
    spec: [['Fat', '3.2%'], ['Sugar', '7 g']],
  },
};

/** Group a product's API category into one of the app's shop filters. */
const categoryOf = (product) => {
  const raw = `${product.category || ''} ${product.name || ''}`.toLowerCase();
  if (raw.includes('ghee')) return 'ghee';
  if (raw.includes('paneer')) return 'paneer';
  if (raw.includes('dahi') || raw.includes('curd') || raw.includes('lassi')) return 'curd';
  if (raw.includes('milk')) return 'milk';
  return 'other';
};

/**
 * Merge an API product with its presentation copy into the shape the screens
 * render. `id` is the real Product._id — it is what gets sent back to the API.
 *
 * Every price comes from the server: `price` is the one-off rate and `plan` the
 * standing-order rate, which is null when the product has no separate plan rate.
 */
export const decorate = (product) => {
  const copy = PRESENTATION[product.name] || {};
  return {
    id: product._id,
    key: product._id, // screens key by product id
    name: product.name,
    short: copy.short || product.name,
    unit: product.unit,
    price: product.price,
    plan: product.planPrice ?? null,
    stock: product.stock,
    cat: categoryOf(product),
    img: product.image,
    // Copy falls back to what the API actually knows. No invented detail.
    kicker: copy.kicker || '',
    meta: copy.meta || product.unit || '',
    desc: copy.desc || product.description || '',
    sub: copy.sub ? `${product.unit} · ${copy.sub}` : product.unit,
    tags: copy.tags || product.labels || [],
    spec: copy.spec || [],
  };
};

export const CATEGORIES = [
  ['all', 'All'],
  ['milk', 'Milk'],
  ['ghee', 'Ghee'],
  ['curd', 'Curd'],
  ['paneer', 'Paneer'],
];

export const DELIVERY_SLOTS = [
  {
    key: 'early',
    label: '6:00 – 7:30 am',
    note: 'Bottle waiting before chai',
  },
  {
    key: 'late',
    label: '7:30 – 9:00 am',
    note: 'Later start, same batch',
  },
];

/**
 * The three rhythms. `days` is the weekday list sent to the API as `weekdays`
 * (0 = Sunday), and `perMonth` mirrors the server's deliveriesPerMonth so the
 * monthly figure the customer sees matches the one that gets stored.
 */
export const RHYTHMS = [
  { key: 'daily', label: 'Every day', long: 'Every day', days: [0, 1, 2, 3, 4, 5, 6], perMonth: 30 },
  { key: 'alternate', label: 'Alternate', long: 'Alternate days', days: null, perMonth: 15 },
  { key: 'custom', label: 'Pick days', long: 'Chosen days', days: [1, 2, 3, 5], perMonth: 17 },
];

/**
 * Fallback locality list, mirroring backend/config/serviceAreas.js. The app
 * prefers GET /api/service-areas; this keeps the address picker usable if that
 * request fails, so a customer is never blocked from saving an address.
 */
export const FALLBACK_AREAS = [
  { slug: 'new-panvel', name: 'New Panvel' },
  { slug: 'panvel', name: 'Panvel' },
  { slug: 'karanjade', name: 'Karanjade' },
  { slug: 'kharghar', name: 'Kharghar' },
  { slug: 'taloja', name: 'Taloja' },
  { slug: 'kamothe', name: 'Kamothe' },
  { slug: 'belapur', name: 'CBD Belapur' },
  { slug: 'nerul', name: 'Nerul' }
];

/** Farm photography, reused from the storefront. */
export const FARM_HERO = '/img/hero/home1.png';
export const FARM_THUMB = '/img/process/process2.png';

export const rupees = (n) => Math.round(n || 0).toLocaleString('en-IN');
