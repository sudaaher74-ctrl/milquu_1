import axios from 'axios';
import { eventBus } from './eventBus';

const api = axios.create({
  // Use local backend if developing locally, else use render
  baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:5001' : 'https://milquu-backend.onrender.com'
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

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    let token = null;

    if (config.url.includes('/api/delivery')) {
      token = getToken('deliveryStaff');
    } else if (config.url.includes('/api/ai')) {
      token = getToken('chatbotToken');
    } else {
      token = getToken('adminToken') || getToken('userInfo') || getToken('deliveryStaff');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      console.warn('Unauthorized request - clearing token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('deliveryStaff');
      localStorage.removeItem('chatbotToken');
      localStorage.removeItem('userInfo');
      
      // Emit unauthorized event so the router can handle the redirect smoothly
      eventBus.emit('UNAUTHORIZED');
    }
    return Promise.reject(error);
  }
);

export default api;
