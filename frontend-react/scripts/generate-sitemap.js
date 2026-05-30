import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://milquufresh.in';

const staticRoutes = [
  '/',
  '/products',
  '/contact',
  '/subscribe',
  '/login',
  '/register',
  '/about-us',
  '/our-farm',
  '/our-process',
  '/quality-assurance',
  '/milk-delivery-navi-mumbai',
  '/milk-delivery-panvel',
  '/milk-delivery-new-panvel',
  '/milk-delivery-karanjade',
  '/organic-milk-kharghar',
  '/fresh-cow-milk-belapur',
  '/farm-fresh-milk-nerul',
  '/product/farm-fresh-cow-milk',
  '/product/pure-buffalo-milk',
  '/product/desi-cow-ghee',
  '/product/fresh-paneer',
  '/blog',
  '/blog/benefits-of-farm-fresh-milk',
  '/blog/a2-milk-vs-regular-milk',
  '/blog/why-fresh-dairy-matters',
  '/blog/best-milk-delivery-navi-mumbai',
  '/blog/health-benefits-desi-cow-ghee',
  '/blog/how-to-choose-pure-milk',
  '/blog/cow-vs-buffalo-milk'
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(route => `  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${route === '/' ? '1.0' : route.startsWith('/product') || route.includes('delivery') ? '0.9' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
fs.writeFileSync(outputPath, sitemap);
console.log(`✅ Sitemap generated at ${outputPath}`);
