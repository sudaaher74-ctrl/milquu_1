import axios from 'axios';

const api = axios.create({
  // Use local backend if developing locally, else use render
  baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:5001' : 'https://milquu-backend.onrender.com'
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    const deliveryStaff = localStorage.getItem('deliveryStaff');
    const chatbotToken = localStorage.getItem('chatbotToken');
    
    if (config.url.includes('/api/delivery') && deliveryStaff && deliveryStaff !== 'undefined') {
      try {
        const parsedStaff = JSON.parse(deliveryStaff);
        if (parsedStaff.token) {
          config.headers.Authorization = `Bearer ${parsedStaff.token}`;
        }
      } catch (e) { console.error(e); }
    } else if (config.url.includes('/api/ai') && chatbotToken && chatbotToken !== 'undefined') {
      try {
        const parsedToken = JSON.parse(chatbotToken);
        if (parsedToken.token) {
          console.log('[API DEBUG] Setting chatbot token:', parsedToken.token);
          config.headers.Authorization = `Bearer ${parsedToken.token}`;
        }
      } catch (e) { console.error(e); }
    } else if (adminToken && adminToken !== 'undefined') {
      try {
        const parsedToken = JSON.parse(adminToken);
        if (parsedToken.token) {
          console.log('[API DEBUG] Setting admin token:', parsedToken.token);
          config.headers.Authorization = `Bearer ${parsedToken.token}`;
        }
      } catch (e) { console.error(e); }
    } else if (deliveryStaff && deliveryStaff !== 'undefined') {
      try {
        const parsedStaff = JSON.parse(deliveryStaff);
        if (parsedStaff.token) {
          config.headers.Authorization = `Bearer ${parsedStaff.token}`;
        }
      } catch (e) { console.error(e); }
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
      // If we are in the browser, redirect to login
      if (typeof window !== 'undefined') {
        if (window.location.pathname.startsWith('/chatbot')) {
          window.location.href = '/chatbot/login';
        } else if (window.location.pathname.startsWith('/delivery')) {
          window.location.href = '/delivery/login';
        } else {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
