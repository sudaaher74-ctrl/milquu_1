// Dairy-specific copy for /glass-bottle-milk-delivery.
//
// MilQuuFresh delivers milk in glass bottles. What we can publish today is
// only what the owner's own app and site already say. Everything about the
// bottle LIFECYCLE (reuse policy, cleaning, sanitisation, deposit, handling) is
// operational detail that must come from the business — it is `null` below and
// the page simply does not render those sections until it is filled in.
//
// The page is kept out of the sitemap and marked noindex until the three
// "required" fields are confirmed (see isGlassBottlePageReady).
//
// To publish: fill in the fields with text that describes what MilQuuFresh
// actually does, then redeploy. Do not paste generic dairy-industry claims.
//
// Plain ESM so the prerender script can import it.

export const GLASS_BOTTLE = {
  // ── Already stated on the site / in the customer app ──────────────────────
  glassProducts: [
    { name: 'A2 Gir Cow Milk', path: '/product/farm-fresh-cow-milk' },
    { name: 'Buffalo Milk', path: '/product/pure-buffalo-milk' },
  ],
  jarProducts: [{ name: 'Bilona A2 Cow Ghee', path: '/product/desi-cow-ghee' }],
  // Source: customer app Track/Done screens ("Leave any empty bottles outside").
  emptyBottleInstruction:
    'Leave empty bottles outside your door and our delivery team collects them on a delivery round.',

  // ── OWNER-CONFIRM: operational facts. Leave null until true. ──────────────
  // Short paragraph each, written as plain statements of current practice.
  reusePolicy: null, // e.g. are bottles reused? is a deposit charged?
  collectionProcess: null, // when/how bottles are picked up, what if left out
  cleaningProcess: null, // how returned bottles are cleaned
  sanitisationProcess: null, // how they are sanitised before refill
  customerHandling: null, // what customers should do (rinse? caps? etc.)
  deliveryProcess: null, // how bottles are packed/transported on the round
};

const REQUIRED = ['reusePolicy', 'collectionProcess', 'cleaningProcess'];

export const isGlassBottlePageReady = () => REQUIRED.every((k) => typeof GLASS_BOTTLE[k] === 'string' && GLASS_BOTTLE[k].trim());
