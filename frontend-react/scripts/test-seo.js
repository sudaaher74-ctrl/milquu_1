import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSeoEntries, sitemapEntries, isPrivatePath } from '../src/data/seo-routes.js';
import { SERVED_AREAS, LOCATION_PAGES } from '../src/data/locations.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('\n========================================');
console.log(' MILQUUFRESH AUTOMATED SEO TEST SUITE');
console.log('========================================\n');

// TEST SUITE 1: Service Areas & Location Integrity
console.log('--- Suite 1: Service Areas & Location Verification ---');
const backendServiceAreasPath = path.resolve(ROOT_DIR, '..', 'backend', 'config', 'serviceAreas.js');
let backendAreas = [];
if (fs.existsSync(backendServiceAreasPath)) {
  const content = fs.readFileSync(backendServiceAreasPath, 'utf-8');
  // Extract area names from backend config
  const matches = [...content.matchAll(/name:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  backendAreas = matches;
}

assert(SERVED_AREAS.length === 8, `SERVED_AREAS has exactly 8 verified areas (found ${SERVED_AREAS.length})`);
assert(!SERVED_AREAS.some(a => a.name.toLowerCase() === 'vashi'), 'Vashi is NOT present in SERVED_AREAS (strictly unverified)');
assert(!LOCATION_PAGES.some(p => p.path.includes('vashi')), 'No landing page exists for Vashi');

if (backendAreas.length > 0) {
  const allMatch = SERVED_AREAS.every(a => backendAreas.some(b => b.toLowerCase() === a.name.toLowerCase()));
  assert(allMatch, 'All frontend served areas exist in backend/config/serviceAreas.js');
}

// TEST SUITE 2: SEO Route Registry & Metadata Integrity
console.log('\n--- Suite 2: Route Metadata, Titles & Descriptions ---');
const entries = buildSeoEntries();
assert(entries.length >= 25, `SEO Route Registry contains at least 25 entries (found ${entries.length})`);

const titles = new Set();
const canonicals = new Set();
let duplicateTitles = 0;
let duplicateCanonicals = 0;

for (const e of entries) {
  if (titles.has(e.title)) duplicateTitles++;
  titles.add(e.title);

  if (canonicals.has(e.canonical)) duplicateCanonicals++;
  canonicals.add(e.canonical);

  assert(e.canonical.startsWith('https://milquufresh.in'), `Canonical ${e.canonical} has valid domain`);
  assert(e.title && e.title.length >= 15 && e.title.length <= 80, `Title length acceptable (${e.title.length} chars) for ${e.path}`);
  assert(e.description && e.description.length >= 30 && e.description.length <= 180, `Description length acceptable (${e.description.length} chars) for ${e.path}`);
  assert(Boolean(e.h1), `Page has designated H1 for ${e.path}`);
}

assert(duplicateTitles === 0, `Zero duplicate titles across public routes (duplicates: ${duplicateTitles})`);
assert(duplicateCanonicals === 0, `Zero duplicate canonical URLs across public routes (duplicates: ${duplicateCanonicals})`);

// TEST SUITE 3: Structured Data Validation
console.log('\n--- Suite 3: Schema.org Structured Data Integrity ---');
for (const e of entries) {
  for (const s of (e.schema || [])) {
    assert(s['@context'] === 'https://schema.org', `Schema on ${e.path} has valid @context`);
    assert(Boolean(s['@type']), `Schema on ${e.path} has valid @type: ${s['@type']}`);
    assert(!JSON.stringify(s).includes('aggregateRating'), `Schema on ${e.path} has no fake aggregateRating`);
  }
}

// TEST SUITE 4: Sitemap & Robots.txt Integrity
console.log('\n--- Suite 4: Sitemap & Robots.txt Directives ---');
const sitemap = sitemapEntries();
assert(sitemap.length > 0, `Sitemap has ${sitemap.length} indexable entries`);
assert(!sitemap.some(s => isPrivatePath(s.path)), 'No private path (admin/app/cart/login) exists in sitemap');
assert(!sitemap.some(s => s.robots.includes('noindex')), 'No noindex page exists in sitemap');

const robotsPath = path.join(ROOT_DIR, 'public', 'robots.txt');
assert(fs.existsSync(robotsPath), 'public/robots.txt exists');
if (fs.existsSync(robotsPath)) {
  const robotsTxt = fs.readFileSync(robotsPath, 'utf-8');
  assert(robotsTxt.includes('Disallow: /admin/'), 'robots.txt disallows /admin/');
  assert(robotsTxt.includes('Disallow: /delivery/'), 'robots.txt disallows /delivery/');
  assert(robotsTxt.includes('Disallow: /api/'), 'robots.txt disallows /api/');
  assert(robotsTxt.includes('Sitemap: https://milquufresh.in/sitemap.xml'), 'robots.txt declares correct Sitemap URL');
}

const sitemapPath = path.join(ROOT_DIR, 'public', 'sitemap.xml');
assert(fs.existsSync(sitemapPath), 'public/sitemap.xml exists');
if (fs.existsSync(sitemapPath)) {
  const sitemapXml = fs.readFileSync(sitemapPath, 'utf-8');
  assert(sitemapXml.includes('<?xml version="1.0" encoding="UTF-8"?>'), 'sitemap.xml has valid XML declaration');
  assert(!sitemapXml.includes('<loc>https://milquufresh.in/cart</loc>'), 'sitemap.xml excludes /cart');
  assert(!sitemapXml.includes('<loc>https://milquufresh.in/login</loc>'), 'sitemap.xml excludes /login');
  assert(!sitemapXml.includes('<loc>https://milquufresh.in/register</loc>'), 'sitemap.xml excludes /register');
}

console.log('\n========================================');
console.log(` SEO TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('========================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL SEO QUALITY AUDIT CHECKS PASSED PERFECTLY!\n');
}
