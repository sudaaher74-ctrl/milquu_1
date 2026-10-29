import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSeoEntries } from '../src/data/seo-routes.js';
import { appPageTitles } from '../src/data/app-page-titles.js';
import { safeJsonLd, escapeHtml } from '../src/utils/seo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const BASE_HTML_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(BASE_HTML_PATH)) {
  console.error(`❌ dist/index.html not found. Run "npm run build" before prerendering.`);
  process.exit(1);
}

const baseTemplate = fs.readFileSync(BASE_HTML_PATH, 'utf-8');
const entries = buildSeoEntries();

console.log(`Starting SEO prerender for ${entries.length} pages...`);

for (const entry of entries) {
  let html = baseTemplate;

  // 1. Title replacement
  const titleTag = `<title>${escapeHtml(entry.title)}</title>`;
  html = html.replace(/<title>.*?<\/title>/i, titleTag);

  // 2. Head tags construction
  const metaTags = [
    `<meta name="description" content="${escapeHtml(entry.description)}" />`,
    `<meta name="robots" content="${escapeHtml(entry.robots || 'index, follow')}" />`,
    `<link rel="canonical" href="${escapeHtml(entry.canonical)}" />`,
    `<meta property="og:title" content="${escapeHtml(entry.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(entry.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(entry.canonical)}" />`,
    `<meta property="og:type" content="${escapeHtml(entry.ogType || 'website')}" />`,
    `<meta property="og:site_name" content="MilQuuFresh" />`,
    entry.ogImage ? `<meta property="og:image" content="${escapeHtml(entry.ogImage)}" />` : '',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(entry.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(entry.description)}" />`,
    entry.ogImage ? `<meta name="twitter:image" content="${escapeHtml(entry.ogImage)}" />` : '',
    `<meta name="geo.region" content="IN-MH" />`,
    `<meta name="geo.placename" content="Navi Mumbai" />`,
  ].filter(Boolean);

  // Schema tags
  const schemaTags = (entry.schema || [])
    .map((s) => `<script type="application/ld+json">${safeJsonLd(s)}</script>`)
    .join('\n    ');

  const headInject = `\n    ${metaTags.join('\n    ')}\n    ${schemaTags}\n  </head>`;
  html = html.replace('</head>', headInject);

  // 3. Fallback semantic content inside #root for search engines and no-JS visitors
  const linksList = (entry.links || [])
    .map((l) => `<li><a href="${escapeHtml(l.href)}">${escapeHtml(l.text)}</a></li>`)
    .join('\n        ');

  const fallbackContent = `
    <header>
      <h1>${escapeHtml(entry.h1 || entry.title)}</h1>
      <p>${escapeHtml(entry.summary || entry.description)}</p>
    </header>
    ${linksList ? `<nav aria-label="Page navigation"><ul>${linksList}</ul></nav>` : ''}
  `;

  html = html.replace('<div id="root"></div>', `<div id="root">${fallbackContent}</div>`);

  // 4. Output target
  const targetDir = entry.path === '/' ? DIST_DIR : path.join(DIST_DIR, entry.path.replace(/^\//, ''));
  fs.mkdirSync(targetDir, { recursive: true });
  const targetFile = path.join(targetDir, 'index.html');
  fs.writeFileSync(targetFile, html, 'utf-8');
}

console.log(`✅ SEO Prerender complete: ${entries.length} pages generated in dist/`);

// App routes need distinct titles in the initial response as well as after
// hydration. They stay outside the public SEO registry and sitemap.
for (const [appPath, title] of Object.entries(appPageTitles)) {
  const html = baseTemplate.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  const targetDir = path.join(DIST_DIR, appPath.slice(1));
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8');
}
console.log(`✅ App titles generated for ${Object.keys(appPageTitles).length} routes.`);
