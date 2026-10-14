// Central SEO registry — the single source of truth for every public page's
// metadata. It feeds:
//   * <SEOHead path="…" />            (runtime head tags via react-helmet-async)
//   * scripts/generate-sitemap.js     (sitemap.xml)
//   * scripts/prerender-seo.js        (per-route static HTML with head tags in
//                                      the initial response — no JS required)
//   * tests/seo/*                      (automated SEO quality checks)
//
// Plain ESM (no JSX) so the Node scripts can import it.
//
// `lastmod` must reflect the last MEANINGFUL content change of the page — bump
// it by hand (or via the post's `modified` field) when you change what the page
// says. Never set it to the build time.

import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  OrganizationSchema,
  WebSiteSchema,
  LocalBusinessSchema,
  buildBreadcrumbSchema,
  buildArticleSchema,
  buildFAQSchema,
  absoluteUrl,
} from './schemas.js';
import { productSEOData } from './products-seo.js';
import { allBlogPosts } from './blog-posts.js';
import { LOCATION_PAGES, SERVED_AREAS, AREAS_WITHOUT_PAGE, areaBySlug } from './locations.js';
import { isGlassBottlePageReady } from './glass-bottle.js';

/**
 * Route prefixes that must never be indexed: dashboards, auth, carts, the
 * logged-in mobile app. They are served the noindex app shell AND get an
 * `X-Robots-Tag: noindex` header (vercel.json). They are deliberately NOT
 * disallowed in robots.txt, so Google can crawl them and see the noindex.
 * (Admin/delivery/chatbot are additionally behind authentication; robots.txt
 * only trims crawl noise there — it is not the security control.)
 */
export const PRIVATE_PREFIXES = [
  '/admin',
  '/delivery',
  '/chatbot',
  '/app',
  '/login',
  '/register',
  '/account',
  '/cart',
  '/offline',
  '/free-sample',
];

export const isPrivatePath = (p) =>
  PRIVATE_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`));

const canonicalFor = (path) => (path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`);

const link = (href, text) => ({ href, text });

const productLinks = Object.values(productSEOData)
  .filter((p) => p.indexable)
  .map((p) => link(`/product/${p.slug}`, p.displayName));

const areaLinks = LOCATION_PAGES.map((p) => link(p.path, `Milk delivery in ${areaBySlug(p.areaSlug).name}`));

const base = (e) => ({
  ogType: 'website',
  ogImage: DEFAULT_OG_IMAGE,
  robots: 'index, follow',
  indexable: true,
  inSitemap: true,
  schema: [],
  links: [],
  ...e,
  canonical: canonicalFor(e.path),
});

// ── Static marketing / content pages ────────────────────────────────────────
const staticEntries = () => [
  base({
    path: '/',
    type: 'home',
    title: 'Fresh Milk Delivery in Navi Mumbai | MilQuuFresh',
    description:
      'Discover fresh cow milk, A2 Gir cow milk, buffalo milk, desi ghee and paneer from MilQuuFresh. Check delivery availability and order online.',
    h1: 'Fresh Milk Delivery in Navi Mumbai',
    summary:
      'MilQuuFresh delivers fresh cow milk, A2 Gir cow milk, buffalo milk, desi ghee and paneer to homes in Navi Mumbai.',
    lastmod: '2026-10-12',
    source: 'src/pages/Home.jsx',
    schema: [OrganizationSchema, WebSiteSchema, LocalBusinessSchema],
    links: [
      ...productLinks,
      link('/milk-delivery-navi-mumbai', 'Delivery areas in Navi Mumbai'),
      link('/subscribe', 'Daily milk subscription'),
      link('/glass-bottle-milk-delivery', 'Glass bottle milk delivery'),
      link('/blog', 'Dairy blog'),
    ],
  }),
  base({
    path: '/products',
    type: 'listing',
    title: 'Fresh Milk, Ghee & Paneer Online in Navi Mumbai | MilQuuFresh',
    description:
      'Browse MilQuuFresh A2 Gir cow milk, fresh cow milk, buffalo milk, desi ghee and paneer. See prices and order online or start a daily subscription.',
    h1: 'MilQuuFresh Products',
    summary: 'Milk, ghee, paneer and other dairy from MilQuuFresh, delivered across Navi Mumbai.',
    lastmod: '2026-10-12',
    source: 'src/pages/CategoryListing.jsx',
    schema: [
      buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' },
      ]),
    ],
    links: [link('/', 'Home'), ...productLinks, link('/subscribe', 'Daily milk subscription')],
  }),
  base({
    path: '/subscribe',
    type: 'page',
    title: 'Daily Milk Subscription in Navi Mumbai | MilQuuFresh',
    description:
      'Set up a daily or custom-day milk subscription with MilQuuFresh. Choose your milk, quantity and delivery rhythm, and pause or cancel from your account.',
    h1: 'Daily Milk Subscription',
    summary: 'Choose your milk, quantity and delivery days, and manage your subscription from your MilQuuFresh account.',
    lastmod: '2026-10-12',
    source: 'src/pages/Subscription.jsx',
    schema: [
      buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Subscribe', url: '/subscribe' },
      ]),
    ],
    links: [link('/', 'Home'), link('/products', 'All products'), link('/milk-delivery-navi-mumbai', 'Delivery areas'), link('/glass-bottle-milk-delivery', 'Glass bottle delivery')],
  }),
  base({
    path: '/contact',
    type: 'page',
    title: 'Contact MilQuuFresh | Milk Delivery in Navi Mumbai',
    description:
      'Contact MilQuuFresh by phone, WhatsApp or email for milk delivery, subscriptions and product questions in Navi Mumbai.',
    h1: 'Contact MilQuuFresh',
    summary: 'Reach the MilQuuFresh team by phone, WhatsApp or email.',
    lastmod: '2026-10-12',
    source: 'src/pages/ContactUs.jsx',
    schema: [
      buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Contact', url: '/contact' },
      ]),
    ],
    links: [link('/', 'Home'), link('/milk-delivery-navi-mumbai', 'Delivery areas'), link('/subscribe', 'Subscribe')],
  }),
  base({
    path: '/about-us',
    type: 'page',
    title: 'About MilQuuFresh | Fresh Dairy Delivered Daily',
    description:
      'MilQuuFresh is building a convenient way to order milk, dairy products and other everyday fresh essentials, delivered to your doorstep in Navi Mumbai.',
    h1: 'About MilQuuFresh',
    summary: 'The story and values behind MilQuuFresh.',
    lastmod: '2026-10-03',
    source: 'src/pages/seo/AboutUs.jsx',
    links: [link('/', 'Home'), link('/our-process', 'Our process'), link('/products', 'Products')],
  }),
  base({
    path: '/our-farm',
    type: 'page',
    title: 'How We Source Our Dairy | MilQuuFresh',
    description:
      'MilQuuFresh works with trusted milk-processing partners and dairy suppliers to bring everyday fresh essentials to your doorstep.',
    h1: 'How We Source',
    summary: 'How MilQuuFresh works with trusted processing partners and suppliers.',
    lastmod: '2026-10-03',
    source: 'src/pages/seo/OurFarm.jsx',
    links: [link('/', 'Home'), link('/our-process', 'Our process'), link('/quality-assurance', 'Quality')],
  }),
  base({
    path: '/our-process',
    type: 'page',
    title: 'Our Process | MilQuuFresh',
    description:
      'See how MilQuuFresh takes an order from trusted suppliers to your doorstep — choose, order, prepare, deliver.',
    h1: 'Our Process',
    summary: 'From order to doorstep: how MilQuuFresh works.',
    lastmod: '2026-10-03',
    source: 'src/pages/seo/OurProcess.jsx',
    links: [link('/', 'Home'), link('/our-farm', 'How we source'), link('/quality-assurance', 'Quality')],
  }),
  base({
    path: '/quality-assurance',
    type: 'page',
    title: 'Quality | MilQuuFresh',
    description:
      'How MilQuuFresh approaches quality — working with trusted processing partners and checking orders before they go out for delivery.',
    h1: 'Quality',
    summary: 'How MilQuuFresh approaches quality.',
    lastmod: '2026-08-10',
    source: 'src/pages/seo/QualityAssurance.jsx',
    links: [link('/', 'Home'), link('/our-process', 'Our process'), link('/our-farm', 'How we source')],
  }),
  base({
    path: '/milk-delivery-navi-mumbai',
    type: 'areas-hub',
    title: 'Milk Delivery in Navi Mumbai | MilQuuFresh',
    description:
      'MilQuuFresh delivers A2 cow milk, buffalo milk, paneer and ghee across Panvel, Kharghar, Nerul and more of Navi Mumbai. See delivery areas and order online.',
    h1: 'Milk Delivery in Navi Mumbai',
    summary: `MilQuuFresh currently delivers in ${SERVED_AREAS.map((a) => a.name).join(', ')}.`,
    lastmod: '2026-10-12',
    source: 'src/pages/seo/MilkDeliveryNaviMumbai.jsx',
    schema: [
      LocalBusinessSchema,
      buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Delivery Areas', url: '/milk-delivery-navi-mumbai' },
      ]),
    ],
    links: [link('/', 'Home'), ...areaLinks, ...productLinks, link('/subscribe', 'Daily milk subscription')],
  }),
  base({
    path: '/blog',
    type: 'blog-index',
    title: 'Dairy Blog | MilQuuFresh',
    description:
      'Guides from MilQuuFresh on cow and buffalo milk, choosing a milk delivery service in Navi Mumbai, and everyday dairy use.',
    h1: 'The Dairy Knowledge Hub',
    summary: 'Articles from the MilQuuFresh team.',
    lastmod: '2026-10-12',
    source: 'src/pages/blog/BlogIndex.jsx',
    schema: [
      buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Dairy Blog', url: '/blog' },
      ]),
    ],
    links: [
      link('/', 'Home'),
      ...allBlogPosts.filter((p) => p.status === 'published').map((p) => link(`/blog/${p.slug}`, p.title)),
    ],
  }),
  base({
    path: '/refund-policy',
    type: 'page',
    title: 'Refund & Cancellation Policy | MilQuuFresh',
    description:
      'Read the MilQuuFresh refund and cancellation policy for milk subscriptions and one-time dairy orders.',
    h1: 'Refund & Cancellation Policy',
    summary: 'How refunds and cancellations work at MilQuuFresh.',
    lastmod: '2026-06-09',
    source: 'src/pages/RefundPolicy.jsx',
    links: [link('/', 'Home'), link('/contact', 'Contact us')],
  }),
  (() => {
    const ready = isGlassBottlePageReady();
    return base({
      path: '/glass-bottle-milk-delivery',
      type: 'page',
      title: 'Glass Bottle Milk Delivery in Navi Mumbai | MilQuuFresh',
      description:
        'MilQuuFresh delivers milk in reusable glass bottles across Navi Mumbai. See which products come in glass and how empty bottles are collected.',
      h1: 'Fresh Milk Delivery in Glass Bottles',
      summary: 'Which MilQuuFresh products come in glass bottles and how empty bottles are collected.',
      lastmod: '2026-10-12',
      source: 'src/pages/seo/GlassBottleDelivery.jsx',
      // Held back until the owner confirms the operational details (see
      // src/data/glass-bottle.js). Reachable by URL, not indexed, not in sitemap.
      indexable: ready,
      inSitemap: ready,
      robots: ready ? 'index, follow' : 'noindex, follow',
      schema: [
        buildBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Glass Bottle Delivery', url: '/glass-bottle-milk-delivery' },
        ]),
      ],
      links: [link('/', 'Home'), link('/product/farm-fresh-cow-milk', 'A2 Gir Cow Milk'), link('/product/pure-buffalo-milk', 'Buffalo Milk'), link('/subscribe', 'Daily milk subscription')],
    });
  })(),
];

// ── Location landing pages (verified service areas only) ────────────────────
const locationEntries = () =>
  LOCATION_PAGES.filter((p) => areaBySlug(p.areaSlug)).map((p) => {
    const area = areaBySlug(p.areaSlug);
    return base({
      path: p.path,
      type: 'location',
      title: p.title,
      description: p.description,
      h1: `Fresh Milk Delivery in ${area.name}`,
      summary: `MilQuuFresh delivers in ${area.name}, Navi Mumbai.`,
      lastmod: p.lastmod,
      source: 'src/components/seo/LocationLandingTemplate.jsx',
      areaSlug: p.areaSlug,
      schema: [
        LocalBusinessSchema,
        buildBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Delivery Areas', url: '/milk-delivery-navi-mumbai' },
          { name: area.name, url: p.path },
        ]),
      ],
      links: [
        link('/', 'Home'),
        link('/milk-delivery-navi-mumbai', 'All delivery areas'),
        ...productLinks,
        link('/subscribe', 'Start a subscription'),
      ],
    });
  });

// ── Product pages ───────────────────────────────────────────────────────────
const productEntries = (liveOffers = {}) =>
  Object.values(productSEOData).map((p) =>
    base({
      path: `/product/${p.slug}`,
      type: 'product',
      title: p.title,
      description: p.description,
      ogImage: absoluteUrl(p.image),
      ogType: 'website',
      h1: p.displayName,
      summary: p.summary,
      lastmod: p.lastmod,
      slug: p.slug,
      source: 'src/pages/seo/ProductPage.jsx',
      indexable: p.indexable,
      inSitemap: p.indexable,
      robots: p.robots,
      schema: [
        ...p.buildSchema(liveOffers[p.slug]),
        buildBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Products', url: '/products' },
          { name: p.displayName, url: `/product/${p.slug}` },
        ]),
      ],
      links: [
        link('/', 'Home'),
        link('/products', 'All products'),
        ...p.related.map((r) => link(`/product/${r}`, productSEOData[r].displayName)),
        link('/milk-delivery-navi-mumbai', 'Delivery areas in Navi Mumbai'),
        link('/subscribe', 'Daily milk subscription'),
      ],
    })
  );

// ── Blog posts ──────────────────────────────────────────────────────────────
const blogEntries = () =>
  allBlogPosts
    .filter((p) => p.status === 'published' || p.status === 'review')
    .map((p) => {
      const published = p.status === 'published';
      const path = `/blog/${p.slug}`;
      return base({
        path,
        type: 'blog-post',
        title: `${p.title} | MilQuuFresh`,
        description: p.excerpt,
        ogType: 'article',
        ogImage: absoluteUrl(p.image),
        h1: p.title,
        summary: p.excerpt,
        lastmod: p.modified,
        slug: p.slug,
        source: 'src/pages/blog/BlogPost.jsx',
        indexable: published,
        inSitemap: published,
        robots: published ? 'index, follow' : 'noindex, follow',
        schema: [
          buildArticleSchema({
            title: p.title,
            description: p.excerpt,
            slug: p.slug,
            datePublished: p.date,
            dateModified: p.modified,
            image: p.image,
          }),
          buildBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Dairy Blog', url: '/blog' },
            { name: p.title, url: path },
          ]),
          buildFAQSchema(p.faqs),
        ].filter(Boolean),
        links: [link('/', 'Home'), link('/blog', 'Dairy blog'), ...productLinks.slice(0, 3), link('/subscribe', 'Daily milk subscription')],
      });
    });

let cache = null;
/**
 * All public pages that have a live, prerendered URL (indexable or not).
 *
 * `liveOffers` ({ [productSlug]: { price, availability } }) is optional: the
 * build-time prerender passes real catalogue prices fetched from the API; with
 * none, product schema is emitted without an Offer rather than with a guess.
 */
export const buildSeoEntries = (liveOffers) => {
  if (liveOffers) {
    return [...staticEntries(), ...locationEntries(), ...productEntries(liveOffers), ...blogEntries()];
  }
  if (!cache) {
    cache = [...staticEntries(), ...locationEntries(), ...productEntries(), ...blogEntries()];
  }
  return cache;
};

export const getSeoEntry = (path) => buildSeoEntries().find((e) => e.path === path) || null;

export const sitemapEntries = () => buildSeoEntries().filter((e) => e.indexable && e.inSitemap && e.robots.startsWith('index'));

export { AREAS_WITHOUT_PAGE };
