import axios from 'axios';

const api = axios.create({
  // Use local backend if developing locally, else use render
  baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:5001' : 'https://milquu-backend.onrender.com'
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    // Check for admin token
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      const parsedToken = JSON.parse(adminToken);
      if (parsedToken.token) {
        config.headers.Authorization = `Bearer ${parsedToken.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
