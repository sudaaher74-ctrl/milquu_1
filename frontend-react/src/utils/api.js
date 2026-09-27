import axios from 'axios';
import { eventBus } from './eventBus';

const api = axios.create({
  // VITE_API_URL points a build at a different backend (set it in Vercel or
  // render.yaml); local development talks to the local backend.
  baseURL: import.meta.env.VITE_API_URL
    || (import.meta.env.MODE === 'development' ? 'http://localhost:5001' : 'https://milquu-backend.onrender.com')
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
  if (url.includes('/api/ai')) return ['chatbotToken'];
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
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
    return Promise.reject(error);
  }
);

export default api;
