import React from 'react';
import { Helmet } from 'react-helmet-async';
import { getSeoEntry } from '../../data/seo-routes.js';
import { SITE_URL, DEFAULT_OG_IMAGE } from '../../data/schemas.js';
import { safeJsonLd } from '../../utils/seo.js';

const FALLBACK_TITLE = 'MilQuuFresh | Fresh Milk Delivery in Navi Mumbai';
const FALLBACK_DESCRIPTION =
  'Fresh cow milk, A2 Gir cow milk, buffalo milk, desi ghee and paneer from MilQuuFresh, delivered across Navi Mumbai.';

// Optional Google Search Console "HTML tag" verification token (env-configured,
// never hard-coded). Domain-property DNS verification is preferred — see
// docs/seo/GOOGLE_SEARCH_CONSOLE_SETUP.md.
const GSC_VERIFICATION = import.meta.env.VITE_GSC_VERIFICATION;

/**
 * Per-page head tags.
 *
 * Pass `path` (e.g. "/about-us") to pull title, description, canonical, robots,
 * OG image and structured data from the central registry in
 * src/data/seo-routes.js — the same registry the sitemap and the build-time
 * prerender use, so the tags can't drift between runtime and the static HTML.
 * Any explicit prop overrides the registry value.
 *
 * These tags are also written into the static HTML at build time
 * (scripts/prerender-seo.js), so crawlers get them without running JavaScript.
 */
const SEOHead = ({
  path,
  title,
  description,
  canonical,
  ogImage,
  ogType,
  robots,
  schema,
}) => {
  const entry = path ? getSeoEntry(path) : null;

  const finalTitle = title ?? entry?.title ?? FALLBACK_TITLE;
  const fullTitle = finalTitle.includes('MilQuu') ? finalTitle : `${finalTitle} | MilQuuFresh`;
  const finalDescription = description ?? entry?.description ?? FALLBACK_DESCRIPTION;
  const finalCanonical = canonical ?? entry?.canonical ?? null;
  const finalImage = ogImage ?? entry?.ogImage ?? DEFAULT_OG_IMAGE;
  const finalType = ogType ?? entry?.ogType ?? 'website';
  const finalRobots = robots ?? entry?.robots ?? 'index, follow';
  const schemaList = [].concat(schema ?? entry?.schema ?? []).filter(Boolean);

  const twitterCard = finalImage === DEFAULT_OG_IMAGE ? 'summary' : 'summary_large_image';
  const ogUrl = finalCanonical || SITE_URL;

  return (
    <Helmet>
      {/* Primary Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      {finalCanonical && <link rel="canonical" href={finalCanonical} />}
      <meta name="robots" content={finalRobots} />
      {GSC_VERIFICATION && <meta name="google-site-verification" content={GSC_VERIFICATION} />}

      {/* Open Graph */}
      <meta property="og:type" content={finalType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:site_name" content="MilQuuFresh" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter / X */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* Region hint */}
      <meta name="geo.region" content="IN-MH" />
      <meta name="geo.placename" content="Navi Mumbai" />

      {/* JSON-LD (escaped so dynamic text can't break out of the script tag) */}
      {schemaList.length > 0 && (
        <script type="application/ld+json">
          {safeJsonLd(schemaList.length === 1 ? schemaList[0] : schemaList)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
