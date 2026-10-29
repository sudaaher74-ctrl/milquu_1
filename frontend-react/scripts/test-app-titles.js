import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { appPageTitles, getAppPageTitle } from '../src/data/app-page-titles.js';
import { sitemapEntries } from '../src/data/seo-routes.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const affectedPaths = ['/app', '/app/account', '/app/cart', '/app/plan', '/app/shop', '/app/wallet', '/app/help', '/app/login'];

test('affected app pages have distinct descriptive titles', () => {
  const titles = affectedPaths.map(getAppPageTitle);
  assert.equal(new Set(titles).size, affectedPaths.length);
  for (const title of titles) assert.match(title, /^.+ \| MilQuuFresh$/);
  assert.equal(getAppPageTitle('/app/cart/?source=shop'), getAppPageTitle('/app/cart'));
});

test('every concrete app screen in the router has a title', () => {
  const router = fs.readFileSync(path.join(root, 'src/router.jsx'), 'utf8');
  const section = router.split('path: "app"')[1].split('{ path: "admin/login"')[0];
  const routes = [...section.matchAll(/\{\s*path:\s*"([^"]+)"/g)]
    .map(match => match[1]).filter(route => !route.includes(':') && !['*', 'refunds', 'support'].includes(route));
  assert.ok(routes.length >= 8);
  for (const route of routes) assert.ok(appPageTitles[`/app/${route}`], `Missing title for /app/${route}`);
});

test('app routes remain outside the public sitemap', () => {
  assert.ok(!sitemapEntries().some(entry => entry.path === '/app' || entry.path.startsWith('/app/')));
});

test('built HTML includes the same distinct app titles before JavaScript runs', () => {
  for (const [appPath, title] of Object.entries(appPageTitles)) {
    const html = fs.readFileSync(path.join(root, 'dist', appPath.slice(1), 'index.html'), 'utf8');
    const actual = html.match(/<title>(.*?)<\/title>/i)?.[1].replace(/&amp;/g, '&');
    assert.equal(actual, title, appPath);
  }
});
