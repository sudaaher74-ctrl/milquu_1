// Delivery areas — the SEO layer's view of backend/config/serviceAreas.js.
//
// backend/config/serviceAreas.js is the single source of truth for where
// MilQuuFresh actually delivers. SERVED_AREAS below mirrors it, and
// tests/seo/locations.test.js fails the build if the two drift apart.
//
// A location landing page may only exist for an area in SERVED_AREAS.
// Candidate areas that are NOT served (e.g. Vashi) must never get a page.
//
// Plain ESM with no JSX/imports so the build-time sitemap + prerender scripts
// can load it in Node.

export const SERVED_AREAS = [
  { slug: 'new-panvel', name: 'New Panvel' },
  { slug: 'panvel', name: 'Panvel' },
  { slug: 'karanjade', name: 'Karanjade' },
  { slug: 'kharghar', name: 'Kharghar' },
  { slug: 'taloja', name: 'Taloja' },
  { slug: 'kamothe', name: 'Kamothe' },
  { slug: 'belapur', name: 'CBD Belapur' },
  { slug: 'nerul', name: 'Nerul' },
];

// Existing landing-page URLs are preserved as-is (they may already rank), even
// though their slugs are not uniform. Taloja and Kamothe are served but have no
// page yet on purpose: a page needs genuinely local facts (societies served,
// round timings) from the owner, otherwise it is a doorway page.
// See docs/seo/LOCAL_SEO_STRATEGY.md.
export const LOCATION_PAGES = [
  {
    areaSlug: 'panvel',
    path: '/milk-delivery-panvel',
    title: 'Fresh Milk Delivery in Panvel | MilQuuFresh',
    description:
      'Order A2 cow milk and buffalo milk from MilQuuFresh in Panvel. Start a daily milk subscription or place a one-time order online.',
    lastmod: '2026-10-12',
  },
  {
    areaSlug: 'new-panvel',
    path: '/milk-delivery-new-panvel',
    title: 'Fresh Milk Delivery in New Panvel | MilQuuFresh',
    description:
      'Daily cow and buffalo milk delivery for New Panvel homes. See what MilQuuFresh delivers and set up a morning subscription online.',
    lastmod: '2026-10-12',
  },
  {
    areaSlug: 'karanjade',
    path: '/milk-delivery-karanjade',
    title: 'Fresh Milk Delivery in Karanjade | MilQuuFresh',
    description:
      'MilQuuFresh delivers A2 cow milk and buffalo milk to homes in Karanjade. Choose your milk, pick a delivery rhythm and order online.',
    lastmod: '2026-10-12',
  },
  {
    areaSlug: 'kharghar',
    path: '/organic-milk-kharghar',
    title: 'Fresh Milk Delivery in Kharghar | MilQuuFresh',
    description:
      'Fresh cow milk, buffalo milk, desi ghee and paneer from MilQuuFresh for homes in Kharghar. Subscribe to daily delivery or order once.',
    lastmod: '2026-10-12',
  },
  {
    areaSlug: 'belapur',
    path: '/fresh-cow-milk-belapur',
    title: 'Fresh Milk Delivery in CBD Belapur | MilQuuFresh',
    description:
      'MilQuuFresh brings A2 cow milk and everyday dairy to homes in CBD Belapur. Start a daily subscription or place a one-time order online.',
    lastmod: '2026-10-12',
  },
  {
    areaSlug: 'nerul',
    path: '/farm-fresh-milk-nerul',
    title: 'Fresh Milk Delivery in Nerul | MilQuuFresh',
    description:
      'A2 cow milk and buffalo milk delivered to homes in Nerul by MilQuuFresh. Set up a flexible daily subscription online.',
    lastmod: '2026-10-12',
  },
];

export const areaBySlug = (slug) => SERVED_AREAS.find((a) => a.slug === slug) || null;

export const locationPageForPath = (path) => LOCATION_PAGES.find((p) => p.path === path) || null;

/** Served areas that do not (yet) have their own landing page. */
export const AREAS_WITHOUT_PAGE = SERVED_AREAS.filter(
  (a) => !LOCATION_PAGES.some((p) => p.areaSlug === a.slug)
);
