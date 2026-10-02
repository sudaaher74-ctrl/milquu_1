// The browser origins the API (and the live-tracking socket) accept.
//
// A trailing slash in CORS_ORIGIN (easy to paste by accident) would silently
// never match a real Origin header, which never has one — so it's stripped
// on both sides before comparing.
const stripTrailingSlash = (value) => String(value).trim().replace(/\/+$/, '');

// Vercel mints a unique preview URL per deploy/branch
// (milquufresh-<hash>-<team>.vercel.app), so it can't be listed in
// CORS_ORIGIN by exact value — it's matched by pattern instead.
const VERCEL_PREVIEW_ORIGIN = /^https:\/\/milquufresh-[a-z0-9-]+\.vercel\.app$/;

// Read lazily: the env file is loaded by server.js after this module is imported.
export const allowedOrigins = () => {
  const list = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map(stripTrailingSlash)
    .filter(Boolean);
  if (process.env.NODE_ENV !== 'production') {
    list.push('http://localhost:5173', 'http://localhost:3000');
  }
  return list;
};

// Allow LAN/local development origins (e.g. mobile device testing on local WiFi)
const LAN_DEV_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/;

export const isAllowedOrigin = (origin) => {
  if (process.env.NODE_ENV !== 'production' && LAN_DEV_ORIGIN.test(origin)) {
    return true;
  }
  return allowedOrigins().includes(stripTrailingSlash(origin)) || VERCEL_PREVIEW_ORIGIN.test(origin);
};
