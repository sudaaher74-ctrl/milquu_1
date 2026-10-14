// MilQuuFresh – centralised JSON-LD schema builders.
// Used by SEOHead.jsx, the page components and the build-time prerender
// (scripts/prerender-seo.js), so this file must stay plain ESM with no
// JSX / bundler-only imports.
//
// Rules for everything in here:
//   * only facts that are visible on the website or confirmed by the owner;
//   * no fabricated ratings, reviews, opening hours or price ranges;
//   * optional fields are omitted rather than guessed.

import { SERVED_AREAS } from './locations.js';

export const BASE_URL = 'https://milquufresh.in';
export const BRAND_NAME = 'MilQuuFresh';
export const PHONE = '+918767067884';
export const WHATSAPP = '918767067884';
export const EMAIL = 'milquufresh@gmail.com';
export const LOGO_URL = `${BASE_URL}/brand-logo.jpg`;
// TODO(owner): replace with a dedicated 1200x630 social-share image when one is
// designed (see docs/seo/SEO_IMPLEMENTATION_REPORT.md). Until then the brand
// logo (exists in /public, 886x886) is used so og:image is never a 404.
export const DEFAULT_OG_IMAGE = LOGO_URL;
// Only profiles that are actually linked from the site footer.
export const SOCIAL_PROFILES = ['https://instagram.com/milquufresh'];

const abs = (p) => (!p ? p : /^https?:\/\//i.test(p) ? p : `${BASE_URL}${p.startsWith('/') ? '' : '/'}${p}`);

// ─── LocalBusiness Schema ───────────────────────────────────────────────────
// The address below is the one printed in the site footer. It is the owner's
// confirmed contact address, not a storefront we invented — but the owner must
// confirm it is correct before relying on it for Google Business Profile.
export const LocalBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${BASE_URL}/#localbusiness`,
  name: BRAND_NAME,
  description:
    'Fresh milk and dairy products delivered to homes in Navi Mumbai, including A2 cow milk, buffalo milk, desi ghee and paneer.',
  url: BASE_URL,
  telephone: PHONE,
  email: EMAIL,
  logo: LOGO_URL,
  image: DEFAULT_OG_IMAGE,
  currenciesAccepted: 'INR',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Lakhani Centrium, 4th Floor',
    addressLocality: 'Navi Mumbai',
    addressRegion: 'Maharashtra',
    postalCode: '410206',
    addressCountry: 'IN',
  },
  areaServed: SERVED_AREAS.map((a) => ({ '@type': 'Place', name: `${a.name}, Navi Mumbai` })),
  sameAs: SOCIAL_PROFILES,
};

// ─── Organization Schema ─────────────────────────────────────────────────────
export const OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: BRAND_NAME,
  url: BASE_URL,
  logo: LOGO_URL,
  email: EMAIL,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: PHONE,
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi', 'Marathi'],
  },
  sameAs: SOCIAL_PROFILES,
};

export const WebSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  name: BRAND_NAME,
  url: BASE_URL,
  publisher: { '@id': `${BASE_URL}/#organization` },
};

// ─── FAQ Schema Builder ──────────────────────────────────────────────────────
// Returns null when there are no FAQs (an empty FAQPage is invalid markup).
// Only pass FAQs that are rendered visibly on the same page.
export const buildFAQSchema = (faqs = []) => {
  const valid = (faqs || []).filter((f) => f && f.question && f.answer);
  if (!valid.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: valid.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
};

// ─── Product Schema Builder ──────────────────────────────────────────────────
// `url` is the product page. `availability` is only emitted when the caller
// actually knows it ('InStock' | 'OutOfStock'); the static prerender does not.
// `rating`/`reviewCount` are only included when real values are passed in —
// no fabricated ratings are shipped in structured data.
export const buildProductSchema = ({
  name,
  description,
  image,
  price,
  sku,
  url,
  availability,
  rating,
  reviewCount,
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name,
  description,
  image: abs(image),
  ...(sku ? { sku } : {}),
  brand: { '@type': 'Brand', name: BRAND_NAME },
  ...(price != null
    ? {
        offers: {
          '@type': 'Offer',
          url: url || `${BASE_URL}/products`,
          priceCurrency: 'INR',
          price: String(price),
          ...(availability ? { availability: `https://schema.org/${availability}` } : {}),
          seller: { '@type': 'Organization', name: BRAND_NAME },
        },
      }
    : {}),
  ...(rating != null && reviewCount != null
    ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: rating,
          reviewCount,
          bestRating: '5',
        },
      }
    : {}),
});

// ─── Breadcrumb Schema Builder ───────────────────────────────────────────────
export const buildBreadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(({ name, url }, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name,
    item: `${BASE_URL}${url === '/' ? '' : url}${url === '/' ? '/' : ''}`,
  })),
});

// ─── Article Schema Builder (Blog) ──────────────────────────────────────────
export const buildArticleSchema = ({ title, description, slug, datePublished, dateModified, image }) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: title,
  description,
  image: abs(image) || DEFAULT_OG_IMAGE,
  datePublished,
  dateModified: dateModified || datePublished,
  author: {
    '@type': 'Organization',
    name: 'MilQuu Fresh Team',
    url: BASE_URL,
  },
  publisher: {
    '@type': 'Organization',
    name: BRAND_NAME,
    logo: { '@type': 'ImageObject', url: LOGO_URL },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/blog/${slug}` },
});

// ─── Common FAQs (used on homepage and landing pages) ────────────────────────
const servedAreaNames = SERVED_AREAS.map((a) => a.name);
const servedAreaList = `${servedAreaNames.slice(0, -1).join(', ')} and ${servedAreaNames[servedAreaNames.length - 1]}`;

export const commonFAQs = [
  {
    question: 'What areas does MilQuuFresh deliver to?',
    answer: `MilQuuFresh currently delivers in ${servedAreaList}, all in Navi Mumbai.`,
  },
  {
    question: 'What time is milk delivered?',
    // TODO(owner): delivery windows are quoted differently across the site
    // (6–9 AM here, "before 8 AM" on landing pages, "before 7 AM" in the app
    // manifest). Confirm the real window and make them all match.
    answer: 'We deliver fresh milk every morning between 6:00 AM and 9:00 AM so you have it ready for your morning tea, coffee, or breakfast.',
  },
  {
    question: 'How do I subscribe to daily milk delivery?',
    answer: 'Visit milquufresh.in/subscribe, choose your milk type and quantity, fill in your delivery address, and we will start delivery from the next morning.',
  },
  {
    question: 'Where does MilQuuFresh get its milk?',
    answer: 'MilQuuFresh sources milk, including A2 cow milk, through trusted milk-processing partners. We focus on convenient ordering and reliable doorstep delivery of the products they supply.',
  },
  {
    question: 'Can I pause or cancel my subscription?',
    answer: 'Yes. Log into your MilQuuFresh account and manage your subscription anytime — pause, resume, or cancel.',
  },
  {
    question: 'Do you offer buffalo milk delivery?',
    answer: 'Yes. We deliver buffalo milk, a thicker and richer milk that is popular for tea, curd and traditional recipes.',
  },
];

export const PHONE_NUMBER = PHONE;
export const WHATSAPP_NUMBER = WHATSAPP;
export const SITE_URL = BASE_URL;
export const SITE_NAME = BRAND_NAME;
export { EMAIL as CONTACT_EMAIL, abs as absoluteUrl };
