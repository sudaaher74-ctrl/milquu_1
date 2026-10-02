import axios from 'axios';
import { eventBus } from './eventBus';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.MODE === 'development') {
    // In browser development, relative URL allows Vite proxy to forward to local backend (port 5001)
    // smoothly across both desktop localhost and mobile devices on local WiFi LAN
    return '';
  }
  return 'https://milquu-backend.onrender.com';
};

const api = axios.create({
  baseURL: getBaseURL()
});

// Helper to safely parse token from localStorage
const getToken = (key) => {
  const item = localStorage.getItem(key);
  if (item && item !== 'undefined') {
    try {
      const parsed = JSON.parse(item);
      return parsed.token;
    } catch (e) {
      console.error(`Failed to parse ${key}`, e);
    }
  }
  return null;
};

// Customer-facing endpoints. On a shared device (the shop counter runs the
// admin POS) the customer's own session must win here, or a storefront order
// would be placed as the admin.
const CUSTOMER_PATHS = ['/api/users', '/api/orders', '/api/payment'];

/** Which stored session a request should carry, in order of preference. */
const sessionKeysFor = (url = '') => {
  if (url.includes('/api/delivery')) return ['deliveryStaff'];
  if (url.includes('/api/ai')) return ['chatbotToken', 'adminToken'];
  if (CUSTOMER_PATHS.some((p) => url.includes(p))) return ['userInfo'];
  return ['adminToken', 'userInfo', 'deliveryStaff'];
};

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    for (const key of sessionKeysFor(config.url)) {
      const token = getToken(key);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        config.authKey = key;
        break;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ── Offline queue: endpoints safe to defer and replay later ─────────────────
// Only admin write operations are queued. Never queue login, payment, or
// customer-facing requests — those need immediate feedback.
const QUEUEABLE_PATHS = ['/api/erp/', '/api/admin/', '/api/products', '/api/subscriptions', '/api/free-sample/'];
const isQueueable = (config) => {
  const method = (config.method || '').toLowerCase();
  if (!['post', 'put', 'patch', 'delete'].includes(method)) return false;
  // Never re-queue a replayed request
  if (config._fromSync) return false;
  // Never queue login calls
  if (config.url?.includes('/login')) return false;
  return QUEUEABLE_PATHS.some((p) => config.url?.includes(p));
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Only the session that was refused is signed out — a customer's
      // expired token must not also log the admin out of the POS.
      const key = error.config?.authKey;
      if (key) {
        console.warn(`Unauthorized request - clearing ${key}`);
        localStorage.removeItem(key);
        // Emit unauthorized event so the router can handle the redirect smoothly
        eventBus.emit('UNAUTHORIZED', { key });
      }
    }

    // ── Offline queue: catch network failures on write requests ────────
    const isNetworkError = !error.response && (error.code === 'ERR_NETWORK' || !navigator.onLine);
    if (isNetworkError && error.config && isQueueable(error.config)) {
      try {
        const { enqueue } = await import('./offlineQueue.js');
        await enqueue(error.config);
        console.info('[Offline Queue] Queued for sync:', error.config.method, error.config.url);
        // Return a synthetic success so the calling UI doesn't crash.
        // The data field contains a flag so page code can show "queued" feedback.
        return {
          data: { _queued: true, message: 'Saved offline — will sync when reconnected' },
          status: 202,
          statusText: 'Queued',
          headers: {},
          config: error.config,
        };
      } catch (queueErr) {
        console.error('[Offline Queue] Failed to enqueue', queueErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

