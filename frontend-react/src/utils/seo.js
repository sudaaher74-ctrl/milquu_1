// SEO helpers shared by the browser (SEOHead) and the build-time prerender.
// Plain ESM, no dependencies.

/**
 * Serialise structured data for embedding in a <script type="application/ld+json">.
 * Escapes characters that could terminate the script element or be mis-parsed
 * (</script>, HTML comments, U+2028/9), so dynamic content can never inject
 * markup through JSON-LD.
 */
export const safeJsonLd = (data) =>
  JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape text for use in HTML text nodes and attribute values. */
export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

/**
 * Known search / social crawlers. Used to render the full marketing homepage
 * to them instead of redirecting phone-sized viewports into the logged-in
 * mobile app (see MobileHomeGate / Home).
 */
const CRAWLER_RE =
  /googlebot|google-inspectiontool|adsbot-google|mediapartners-google|bingbot|bingpreview|duckduckbot|yandex(bot)?|baiduspider|slurp|applebot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|pinterest|petalbot|ahrefsbot|semrushbot|lighthouse|chrome-lighthouse|headlesschrome/i;

export const isCrawlerUserAgent = (ua) => CRAWLER_RE.test(ua || '');

export const isCrawler = () =>
  typeof navigator !== 'undefined' && isCrawlerUserAgent(navigator.userAgent);
