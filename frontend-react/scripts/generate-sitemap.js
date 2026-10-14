import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sitemapEntries } from '../src/data/seo-routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_SITEMAP = path.join(ROOT_DIR, 'public', 'sitemap.xml');

const calculatePriority = (path) => {
  if (path === '/') return '1.0';
  if (['/products', '/milk-delivery-navi-mumbai', '/glass-bottle-milk-delivery', '/subscribe'].includes(path)) return '0.9';
  if (path.startsWith('/product/')) return '0.85';
  if (path.includes('delivery') || path.includes('panvel') || path.includes('kharghar') || path.includes('belapur') || path.includes('nerul') || path.includes('karanjade')) return '0.85';
  if (path.startsWith('/blog/')) return '0.7';
  return '0.7';
};

const calculateChangeFreq = (path) => {
  if (path === '/' || path === '/products') return 'daily';
  if (path.startsWith('/product/')) return 'weekly';
  if (path.startsWith('/blog/')) return 'monthly';
  return 'weekly';
};

const entries = sitemapEntries();

const xmlUrls = entries.map((entry) => {
  const priority = calculatePriority(entry.path);
  const changefreq = calculateChangeFreq(entry.path);
  const lastmod = entry.lastmod || '2026-10-12';

  return `  <url>
    <loc>${entry.canonical}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('\n');

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>
`;

fs.writeFileSync(PUBLIC_SITEMAP, sitemapXml, 'utf-8');
console.log(`✅ Generated valid sitemap with ${entries.length} indexable URLs at: ${PUBLIC_SITEMAP}`);
