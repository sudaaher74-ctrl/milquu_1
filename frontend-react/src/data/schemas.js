// MilQuu Fresh – Centralized JSON-LD Schema Data
// Used by SEOHead.jsx across all pages

const BASE_URL = 'https://milquufresh.in';
const PHONE = '+918767067884';
const WHATSAPP = '918767067884';

// ─── LocalBusiness + DairyFarm Schema ───────────────────────────────────────
export const LocalBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'FoodEstablishment'],
  name: 'MilQuu Fresh',
  description: 'Premium farm-fresh dairy delivery service in Navi Mumbai. A2 cow milk, buffalo milk, paneer, ghee delivered daily to your doorstep.',
  url: BASE_URL,
  telephone: PHONE,
  email: 'contact@milquufresh.in',
  logo: `${BASE_URL}/favicon.svg`,
  image: `${BASE_URL}/og-image.jpg`,
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, UPI, Credit Card, Debit Card',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'New Panvel',
    addressLocality: 'Navi Mumbai',
    addressRegion: 'Maharashtra',
    postalCode: '410206',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '18.9894',
    longitude: '73.1175',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '05:00',
      closes: '21:00',
    },
  ],
  areaServed: [
    { '@type': 'City', name: 'Panvel' },
    { '@type': 'City', name: 'New Panvel' },
    { '@type': 'City', name: 'Karanjade' },
    { '@type': 'City', name: 'Kharghar' },
    { '@type': 'City', name: 'Belapur' },
    { '@type': 'City', name: 'Nerul' },
    { '@type': 'City', name: 'Navi Mumbai' },
  ],
  sameAs: [
    'https://www.instagram.com/milquufresh',
    'https://www.facebook.com/milquufresh',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '128',
    bestRating: '5',
    worstRating: '1',
  },
};

// ─── Organization Schema ─────────────────────────────────────────────────────
export const OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MilQuu Fresh',
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.svg`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: PHONE,
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi', 'Marathi'],
  },
};

// ─── FAQ Schema Builder ──────────────────────────────────────────────────────
export const buildFAQSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
});

// ─── Product Schema Builder ──────────────────────────────────────────────────
export const buildProductSchema = ({ name, description, image, price, sku, rating = 4.9, reviewCount = 56 }) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name,
  description,
  image,
  sku,
  brand: { '@type': 'Brand', name: 'MilQuu Fresh' },
  offers: {
    '@type': 'Offer',
    url: `${BASE_URL}/products`,
    priceCurrency: 'INR',
    price,
    availability: 'https://schema.org/InStock',
    seller: { '@type': 'Organization', name: 'MilQuu Fresh' },
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: rating,
    reviewCount,
    bestRating: '5',
  },
});

// ─── Breadcrumb Schema Builder ───────────────────────────────────────────────
export const buildBreadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(({ name, url }, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name,
    item: `${BASE_URL}${url}`,
  })),
});

// ─── Article Schema Builder (Blog) ──────────────────────────────────────────
export const buildArticleSchema = ({ title, description, slug, datePublished, dateModified, image }) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  image: image || `${BASE_URL}/og-image.jpg`,
  datePublished,
  dateModified: dateModified || datePublished,
  author: {
    '@type': 'Organization',
    name: 'MilQuu Fresh Team',
    url: BASE_URL,
  },
  publisher: {
    '@type': 'Organization',
    name: 'MilQuu Fresh',
    logo: { '@type': 'ImageObject', url: `${BASE_URL}/favicon.svg` },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/blog/${slug}` },
});

// ─── Common FAQs (used on homepage and landing pages) ────────────────────────
export const commonFAQs = [
  {
    question: 'What areas does MilQuu Fresh deliver to?',
    answer: 'MilQuu Fresh delivers fresh dairy products to Panvel, New Panvel, Karanjade, Kharghar, Belapur, and Nerul in Navi Mumbai.',
  },
  {
    question: 'What time is milk delivered?',
    answer: 'We deliver fresh milk every morning between 5:00 AM and 8:00 AM so you have it ready for your morning tea, coffee, or breakfast.',
  },
  {
    question: 'How do I subscribe to daily milk delivery?',
    answer: 'Visit milquufresh.in/subscribe, choose your milk type and quantity, fill in your delivery address, and we will start delivery from the next morning.',
  },
  {
    question: 'Is the milk A2 certified?',
    answer: 'Yes. Our A2 cow milk comes from pure Gir breed cows raised on natural fodder. We do not mix A1 milk at any stage.',
  },
  {
    question: 'Can I pause or cancel my subscription?',
    answer: 'Yes. Log into your MilQuu Fresh account and manage your subscription anytime — pause, resume, or cancel with one click.',
  },
  {
    question: 'Do you offer buffalo milk delivery?',
    answer: 'Yes. We deliver premium fresh buffalo milk with high fat content, ideal for making tea, sweets, and traditional recipes.',
  },
];

export const PHONE_NUMBER = PHONE;
export const WHATSAPP_NUMBER = WHATSAPP;
export const SITE_URL = BASE_URL;
