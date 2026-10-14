// Product SEO + page content, keyed by the existing /product/:slug URLs.
//
// URLs are preserved from the original site. `name` is the product name as the
// database knows it (ProductPage matches live stock on it), `displayName` is
// what visitors and search engines see.
//
// Content policy — everything shown here must be a fact the owner already
// publishes (the customer app catalogue, the existing pages) or generic
// operational information. Deliberately NOT included: nutrition figures,
// health benefits, certifications, shelf-life numbers, delivery timelines.
// Items marked OWNER-CONFIRM need the owner's sign-off before they are relied on.
//
// Plain ESM (no JSX) so scripts/prerender-seo.js can import it.

import { buildProductSchema, buildFAQSchema, SITE_URL } from './schemas.js';
import { SERVED_AREAS } from './locations.js';

const servedNames = SERVED_AREAS.map((a) => a.name).join(', ');

const AREAS_FAQ = {
  question: 'Which areas do you deliver to?',
  answer: `MilQuuFresh currently delivers in ${servedNames} (Navi Mumbai).`,
};

const MORNING_ROUND_FAQ = (label) => ({
  question: `Can I order ${label} along with my daily milk?`,
  answer: `Yes. Add it to your order and it is delivered with your regular morning round. You can also manage or pause your daily milk subscription from your account.`,
});

const BOTTLE_FAQ = {
  question: 'What happens to the empty glass bottle?',
  answer: 'Leave empty bottles outside your door and our delivery team collects them on a delivery round.',
};

const REFRIGERATED_STORAGE =
  // OWNER-CONFIRM: add the real shelf-life guidance for each product.
  'Refrigerate on arrival. For shelf-life guidance on this product, message us on WhatsApp.';

// How a page is matched to its row in GET /api/products (names and image
// basenames, ignoring folder/extension). Stock, price and pack size shown on
// the page come from that row, so they always agree with what checkout charges.
const DB_MATCH = {
  'farm-fresh-cow-milk': { names: ['A2 Cow Milk'], images: ['A2milk'] },
  'cow-milk-pouch': { names: ['Cow Milk (Pouch)'], images: ['cowmilkplasticbag', 'cow-milk-pouch'] },
  'pure-buffalo-milk': { names: ['Premium Buffalo Milk'], images: ['buffalomilk'] },
  'buffalo-milk-pouch': { names: ['Buffalo Milk (Pouch)'], images: ['buffalomilkplasticbag', 'buffalo-milk-pouch'] },
  'desi-cow-ghee': { names: ['A2 Cow Ghee', 'Bilona A2 Cow Ghee'], images: ['A2ghee'] },
  'fresh-paneer': { names: ['Soft Paneer', 'Fresh Malai Paneer'], images: ['panner'] },
  'fresh-dahi': { names: ['Fresh Dahi'], images: ['Dahi'] },
  'sweet-lassi': { names: ['Sweet Lassi'], images: ['lassi'] },
};

const imageKey = (src = '') => String(src).split('/').pop().replace(/\.[a-z0-9]+$/i, '');

/** Find the API product row for a page's product data. */
export const matchDbProduct = (product, dbProducts = []) => {
  const m = DB_MATCH[product.slug] || { names: [product.name], images: [] };
  return (
    dbProducts.find((d) => m.names.includes(d.name)) ||
    dbProducts.find((d) => m.images.includes(imageKey(d.image))) ||
    null
  );
};

const defineProduct = (p) => {
  const url = `${SITE_URL}/product/${p.slug}`;
  const product = {
    indexable: true,
    robots: 'index, follow',
    ...p,
    url,
    /**
     * Product + FAQ structured data. `price` / `availability` are only passed
     * when they are real (live API); the static `price` field below is a
     * fallback for display and is NEVER asserted in markup, because catalogue
     * prices are edited in the admin panel and this file is not.
     */
    buildSchema({ price, availability } = {}) {
      return [
        buildProductSchema({
          name: this.displayName,
          description: this.description,
          image: this.image,
          price,
          availability,
          url,
        }),
        buildFAQSchema(this.faqs),
      ].filter(Boolean);
    },
    get schema() {
      return this.buildSchema();
    },
  };
  return product;
};

export const productSEOData = {
  'farm-fresh-cow-milk': defineProduct({
    name: 'A2 Cow Milk',
    displayName: 'A2 Gir Cow Milk',
    slug: 'farm-fresh-cow-milk',
    title: 'A2 Gir Cow Milk Delivery | MilQuuFresh',
    description:
      'Order A2 Gir cow milk from MilQuuFresh, delivered in glass bottles across Navi Mumbai. Choose 500 ml or 1 litre and start a daily subscription online.',
    price: 90,
    image: '/img/products/A2milk.webp',
    sku: 'MQ-COW-1L',
    packaging: 'glass',
    lastmod: '2026-10-12',
    summary:
      'A2 cow milk from Gir cows, delivered to your door in Navi Mumbai in returnable glass bottles. Order it as a daily subscription or as a one-time purchase.',
    highlights: [
      'Packed in returnable glass bottles',
      '500 ml and 1 litre options',
      'Fat 4.1% · SNF 8.6% as listed in our app',
      'Daily or custom-day subscription, pause any time',
    ],
    details:
      'MilQuuFresh A2 cow milk comes from Gir cows and is delivered in glass bottles with your morning round. It is a lighter milk, with about 4.1% fat as listed in our customer app. Compare it with our buffalo milk if you prefer a thicker, richer cup.',
    storage: REFRIGERATED_STORAGE,
    faqs: [
      {
        question: 'What is A2 milk?',
        answer:
          'A2 milk comes from cows whose milk carries only the A2 type of beta-casein protein. Indigenous breeds such as the Gir are commonly associated with A2 milk.',
      },
      {
        question: 'Which sizes can I order?',
        answer: 'You can order 500 ml or 1 litre. The price shown on this page updates with the size you pick.',
      },
      BOTTLE_FAQ,
      MORNING_ROUND_FAQ('this milk'),
      AREAS_FAQ,
    ],
    related: ['pure-buffalo-milk', 'cow-milk-pouch', 'desi-cow-ghee'],
  }),

  'cow-milk-pouch': defineProduct({
    name: 'Cow Milk (Pouch)',
    displayName: 'Fresh Cow Milk (Pouch)',
    slug: 'cow-milk-pouch',
    title: 'Fresh Cow Milk Delivery | MilQuuFresh',
    description:
      'Fresh cow milk in pouches, delivered every morning across Navi Mumbai. Choose 500 ml or 1 litre and order online or subscribe to daily delivery.',
    price: 58,
    image: '/img/products/cow-milk-pouch.webp',
    sku: 'MQ-COW-POUCH',
    packaging: 'pouch',
    lastmod: '2026-10-12',
    summary:
      'Everyday fresh cow milk in a convenient pouch, delivered to your door in Navi Mumbai. A simple option for a regular morning order.',
    highlights: [
      'Pouch packaging',
      '500 ml and 1 litre options',
      'Fat 4.0% · SNF 8.5% as listed in our app',
      'Daily or custom-day subscription, pause any time',
    ],
    details:
      'Our cow milk pouch is the everyday option: fresh cow milk with about 4.0% fat as listed in our customer app, packed in a pouch and delivered with your morning round.',
    storage: REFRIGERATED_STORAGE,
    faqs: [
      {
        question: 'Which sizes can I order?',
        answer: 'You can order 500 ml or 1 litre. The price shown on this page updates with the size you pick.',
      },
      MORNING_ROUND_FAQ('this milk'),
      AREAS_FAQ,
    ],
    related: ['farm-fresh-cow-milk', 'pure-buffalo-milk', 'fresh-dahi'],
  }),

  'pure-buffalo-milk': defineProduct({
    name: 'Premium Buffalo Milk',
    displayName: 'Buffalo Milk',
    slug: 'pure-buffalo-milk',
    title: 'Fresh Buffalo Milk Delivery | MilQuuFresh',
    description:
      'Order thick, full-cream buffalo milk from MilQuuFresh, delivered in glass bottles across Navi Mumbai. Ideal for chai, curd and sweets — subscribe online.',
    price: 75,
    image: '/img/products/buffalomilk.webp',
    sku: 'MQ-BUFF-1L',
    packaging: 'glass',
    lastmod: '2026-10-12',
    summary:
      'Thick, full-cream buffalo milk from Murrah buffaloes, delivered in returnable glass bottles in Navi Mumbai. The milk families set their curd with.',
    highlights: [
      'Packed in returnable glass bottles',
      '500 ml and 1 litre options',
      'Fat 6.5% · SNF 9.2% as listed in our app',
      'Daily or custom-day subscription, pause any time',
    ],
    details:
      'Buffalo milk is naturally thicker and higher in fat than cow milk — about 6.5% as listed in our customer app — which is why many households prefer it for chai, setting curd and making sweets or paneer at home.',
    storage: REFRIGERATED_STORAGE,
    faqs: [
      {
        question: 'What is buffalo milk best used for?',
        answer: 'Its thick, creamy texture makes it popular for chai, setting curd and traditional sweets.',
      },
      BOTTLE_FAQ,
      MORNING_ROUND_FAQ('this milk'),
      AREAS_FAQ,
    ],
    related: ['farm-fresh-cow-milk', 'fresh-paneer', 'fresh-dahi'],
  }),

  'buffalo-milk-pouch': defineProduct({
    name: 'Buffalo Milk (Pouch)',
    displayName: 'Buffalo Milk (Pouch)',
    slug: 'buffalo-milk-pouch',
    title: 'Buffalo Milk Pouch Delivery | MilQuuFresh',
    description:
      'Buffalo milk in pouches, delivered every morning across Navi Mumbai. Choose 500 ml or 1 litre and order online.',
    price: 75,
    image: '/img/products/buffalo-milk-pouch.webp',
    sku: 'MQ-BUFF-POUCH',
    packaging: 'pouch',
    // Same milk as the glass-bottle Buffalo Milk page in a different pack:
    // kept reachable for existing links but out of the index/sitemap to avoid
    // near-duplicate pages competing with /product/pure-buffalo-milk.
    indexable: false,
    robots: 'noindex, follow',
    lastmod: '2026-10-12',
    summary: 'Full-cream buffalo milk in a pouch, delivered to your door in Navi Mumbai.',
    highlights: ['Pouch packaging', '500 ml and 1 litre options', 'Fat 6.5% · SNF 9.2% as listed in our app'],
    details: 'The pouch version of our buffalo milk, for households that prefer pouch packaging.',
    storage: REFRIGERATED_STORAGE,
    faqs: [MORNING_ROUND_FAQ('this milk'), AREAS_FAQ],
    related: ['pure-buffalo-milk', 'farm-fresh-cow-milk', 'fresh-paneer'],
  }),

  'desi-cow-ghee': defineProduct({
    name: 'Bilona A2 Cow Ghee',
    displayName: 'Bilona A2 Cow Ghee',
    slug: 'desi-cow-ghee',
    title: 'Pure Desi Ghee Online | MilQuuFresh',
    description:
      'Buy bilona A2 desi cow ghee online from MilQuuFresh — made by the traditional hand-churned method and delivered to your door in Navi Mumbai.',
    price: 850,
    image: '/img/products/A2ghee.webp',
    sku: 'MQ-GHEE-1L',
    packaging: 'jar',
    lastmod: '2026-10-12',
    // OWNER-CONFIRM: pack size / weight is not stated anywhere in the codebase.
    summary:
      'Bilona A2 desi cow ghee, made the traditional way: A2 milk is set into curd, hand-churned into butter and slowly heated into ghee.',
    highlights: [
      'Bilona method — churned from cultured A2 curd, not cream',
      'Packed in a glass jar',
      'Order with your daily milk or on its own',
    ],
    details:
      'Bilona ghee is made differently from ghee produced from cream: A2 milk is first set into curd, the curd is hand-churned to separate butter, and the butter is slowly heated to make ghee. This is the method MilQuuFresh follows for its bilona A2 cow ghee.',
    storage:
      // OWNER-CONFIRM: add the real shelf-life / storage guidance.
      'Keep the jar closed and away from moisture. For shelf-life guidance, message us on WhatsApp.',
    faqs: [
      {
        question: 'What does bilona mean?',
        answer:
          'Bilona is the traditional method of making ghee from curd. The curd is churned to separate butter, which is then heated slowly to make ghee, rather than skimming cream and heating it directly.',
      },
      MORNING_ROUND_FAQ('ghee'),
      AREAS_FAQ,
    ],
    related: ['farm-fresh-cow-milk', 'fresh-paneer', 'pure-buffalo-milk'],
  }),

  'fresh-paneer': defineProduct({
    name: 'Fresh Malai Paneer',
    displayName: 'Fresh Malai Paneer',
    slug: 'fresh-paneer',
    title: 'Fresh Paneer Delivery | MilQuuFresh',
    description:
      'Order fresh malai paneer from MilQuuFresh, made with lemon juice and delivered to your door in Navi Mumbai along with your daily milk.',
    price: 90,
    image: '/img/products/panner.webp',
    sku: 'MQ-PAN-250G',
    packaging: 'tub',
    lastmod: '2026-10-12',
    // OWNER-CONFIRM: pack weight (SKU suggests 250 g) is not stated anywhere visible.
    summary:
      'Soft malai paneer made from buffalo milk and curdled with lemon juice, delivered to your door in Navi Mumbai.',
    highlights: [
      'Curdled with lemon juice',
      'Made from buffalo milk',
      'Add it to your daily milk order',
    ],
    details:
      'MilQuuFresh paneer is made from buffalo milk and curdled with lemon juice, which gives a soft, creamy block that works for curries, bhurji and grilling. Order it on its own or add it to your milk delivery.',
    storage: REFRIGERATED_STORAGE,
    faqs: [
      {
        question: 'Can I add paneer to my daily milk delivery?',
        answer: 'Yes. Add paneer to your order and it is delivered with your regular morning round.',
      },
      {
        question: 'How should I store paneer?',
        answer: 'Keep it refrigerated. For shelf-life guidance, message us on WhatsApp.',
      },
      AREAS_FAQ,
    ],
    related: ['pure-buffalo-milk', 'farm-fresh-cow-milk', 'desi-cow-ghee'],
  }),

  'fresh-dahi': defineProduct({
    name: 'Fresh Dahi',
    displayName: 'Fresh Dahi',
    slug: 'fresh-dahi',
    title: 'Fresh Dahi Delivery | MilQuuFresh',
    description:
      'Thick, naturally set dahi from MilQuuFresh, delivered to your door in Navi Mumbai. Add it to your daily milk order online.',
    price: 60,
    image: '/img/products/Dahi.webp',
    sku: 'MQ-DAHI-500G',
    packaging: 'tub',
    lastmod: '2026-10-12',
    summary: 'Naturally set dahi with a thick, creamy texture, delivered to your door in Navi Mumbai.',
    highlights: ['Naturally set', 'Add it to your daily milk order'],
    details:
      'Our dahi is set naturally, without synthetic coagulants, for a thick, creamy texture in the style of traditional homemade curd.',
    storage: REFRIGERATED_STORAGE,
    faqs: [MORNING_ROUND_FAQ('dahi'), AREAS_FAQ],
    related: ['pure-buffalo-milk', 'sweet-lassi', 'farm-fresh-cow-milk'],
  }),

  'sweet-lassi': defineProduct({
    name: 'Sweet Lassi',
    displayName: 'Sweet Lassi',
    slug: 'sweet-lassi',
    title: 'Sweet Lassi Delivery | MilQuuFresh',
    description:
      'Traditional sweet lassi from MilQuuFresh, made from fresh dahi and delivered to your door in Navi Mumbai.',
    price: 25,
    image: '/img/products/lassi.webp',
    sku: 'MQ-LASSI-250ML',
    packaging: 'bottle',
    lastmod: '2026-10-12',
    summary: 'A lightly sweetened, churned lassi made from our dahi, delivered to your door in Navi Mumbai.',
    highlights: ['Made from our fresh dahi', 'Lightly sweetened'],
    details: 'Sweet lassi churned from our dahi — a cold, drinkable accompaniment to your daily milk order.',
    storage: REFRIGERATED_STORAGE,
    faqs: [MORNING_ROUND_FAQ('lassi'), AREAS_FAQ],
    related: ['fresh-dahi', 'pure-buffalo-milk', 'farm-fresh-cow-milk'],
  }),
};

export const productSlugs = Object.keys(productSEOData);
