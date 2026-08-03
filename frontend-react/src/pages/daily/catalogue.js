// Catalogue for the Milquu mobile app. Prices, units and copy follow the
// "Milquu App" design; images are the assets served from /public/img/products.
//
// Milk carries two prices: `price` is the one-off rate, `plan` the standing-order
// rate. Everything else is sold at a single price either way.
export const PRODUCTS = {
  cow: {
    key: 'cow',
    name: 'Desi Cow Milk',
    short: 'Cow Milk',
    unit: '1 L',
    price: 68,
    plan: 60,
    cat: 'milk',
    kicker: 'Desi cow',
    meta: 'Light, 4.1% fat · glass bottle',
    img: '/img/products/cowmilk.webp',
    desc: 'Milked before dawn, chilled within the hour, bottled in glass and driven straight to Karanjade. Nothing added, nothing taken out — the cream still rises.',
    sub: '1 L glass bottle · Gir and Sahiwal cows',
    tags: ['4.1% fat', 'No preservatives', 'Returnable glass'],
    lab: [['Fat', '4.1%'], ['SNF', '8.6%'], ['Adulterants', 'None detected']],
  },
  buf: {
    key: 'buf',
    name: 'Buffalo Milk',
    short: 'Buffalo Milk',
    unit: '1 L',
    price: 82,
    plan: 72,
    cat: 'milk',
    kicker: 'Full cream',
    meta: 'Full cream, 6.5% fat · for curd',
    img: '/img/products/buffalomilk.webp',
    desc: 'Thick and full-cream, the milk families set their curd with. Same morning batch, same glass bottle.',
    sub: '1 L glass bottle · Murrah buffalo',
    tags: ['6.5% fat', 'No preservatives', 'Returnable glass'],
    lab: [['Fat', '6.5%'], ['SNF', '9.2%'], ['Adulterants', 'None detected']],
  },
  ghee: {
    key: 'ghee',
    name: 'A2 Ghee',
    short: 'A2 Ghee',
    unit: '250 g',
    price: 720,
    cat: 'ghee',
    kicker: 'Bilona',
    meta: 'Bilona churned · monthly',
    img: '/img/products/A2ghee.webp',
    desc: 'Hand-churned the old way from cultured A2 curd, not cream. Grainy, golden and deeply aromatic.',
    sub: '250 g jar · bilona churned',
    tags: ['A2 milk', 'Hand churned', 'Glass jar'],
    lab: [['Moisture', '0.2%'], ['Free fatty acid', '0.9%'], ['Adulterants', 'None detected']],
  },
  dahi: {
    key: 'dahi',
    name: 'Dahi',
    short: 'Dahi',
    unit: '400 g',
    price: 60,
    cat: 'curd',
    kicker: 'Set curd',
    meta: 'Set curd · Mon, Wed, Fri',
    img: '/img/products/Dahi.webp',
    desc: 'Set overnight in the same clay-cool room the milk comes from. Thick enough to hold a spoon.',
    sub: '400 g tub · naturally set',
    tags: ['Live cultures', 'No thickeners', 'Set overnight'],
    lab: [['Fat', '4.0%'], ['pH', '4.4'], ['Adulterants', 'None detected']],
  },
  pan: {
    key: 'pan',
    name: 'Paneer',
    short: 'Paneer',
    unit: '200 g',
    price: 110,
    cat: 'paneer',
    kicker: 'Made 5 am',
    meta: 'Pressed at 5 am · weekly',
    img: '/img/products/panner.webp',
    desc: 'Curdled with lemon at five in the morning and pressed by seven. Soft enough to eat raw.',
    sub: '200 g block · made this morning',
    tags: ['High protein', 'No vinegar', 'Made daily'],
    lab: [['Fat', '22%'], ['Protein', '18%'], ['Adulterants', 'None detected']],
  },
  lassi: {
    key: 'lassi',
    name: 'Lassi',
    short: 'Lassi',
    unit: '200 ml',
    price: 35,
    cat: 'curd',
    kicker: 'Sweet',
    meta: 'Churned sweet · daily',
    img: '/img/products/lassi.webp',
    desc: 'Yesterday’s dahi churned with a little sugar and cardamom. Cold, thin and drinkable.',
    sub: '200 ml bottle · lightly sweetened',
    tags: ['Live cultures', 'No stabilisers', 'Churned daily'],
    lab: [['Fat', '3.2%'], ['Sugar', '7 g'], ['Adulterants', 'None detected']],
  },
};

export const PRODUCT_LIST = Object.values(PRODUCTS);

export const CATEGORIES = [
  ['all', 'All'],
  ['milk', 'Milk'],
  ['ghee', 'Ghee'],
  ['curd', 'Curd'],
  ['paneer', 'Paneer'],
];

/** Suggested add-ons on the plan and home screens. */
export const SUGGESTED = ['ghee', 'pan', 'lassi'];

export const DELIVERY_SLOTS = [
  {
    key: 'early',
    label: '6:00 – 7:30 am',
    note: 'Most families · bottle waiting before chai',
    badge: 'On time 98%',
  },
  {
    key: 'late',
    label: '7:30 – 9:00 am',
    note: 'Later start, same batch',
  },
];

export const RHYTHMS = [
  { key: 'daily', label: 'Every day', long: 'Every day', days: [0, 1, 2, 3, 4, 5, 6], perMonth: 30 },
  { key: 'alt', label: 'Alternate', long: 'Alternate days', days: [0, 2, 4, 6], perMonth: 15 },
  { key: 'custom', label: 'Pick days', long: 'Mon, Tue, Wed, Fri', days: [0, 1, 2, 4], perMonth: 17 },
];

/** The standing order a new plan starts from. */
export const STANDING_ORDER = { cow: 2, dahi: 1 };

export const SERVICE_AREA = 'Karanjade';
export const BATCH = { no: '204', milkedAt: '5:20 am', fat: '4.1%' };

/** Farm photography, reused from the storefront. */
export const FARM_HERO = '/img/hero/home1.png';
export const FARM_THUMB = '/img/process/process2.png';

export const rupees = (n) => Math.round(n).toLocaleString('en-IN');

/** Price of one unit, at plan or one-off rate. */
export const priceOf = (key, onPlan = true) => {
  const p = PRODUCTS[key];
  return onPlan && p.plan ? p.plan : p.price;
};
