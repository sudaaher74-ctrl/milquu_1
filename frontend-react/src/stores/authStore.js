import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../config/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      admin: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const res = await api.post('/admin/login', { email, password });
        const { token, admin } = res.data;
        set({ token, admin, isAuthenticated: true });
        return admin;
      },

      register: async (email, password) => {
        const name = email.split('@')[0] || 'Admin';
        const res = await api.post('/admin/register', { name, email, password, role: 'super_admin' });
        const { token, admin } = res.data;
        set({ token, admin, isAuthenticated: true });
        return admin;
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) return false;
        try {
          const res = await api.get('/admin/me');
          set({ admin: res.data.admin, isAuthenticated: true });
          return true;
        } catch {
          set({ token: null, admin: null, isAuthenticated: false });
          return false;
        }
      },

      logout: () => set({ token: null, admin: null, isAuthenticated: false }),
    }),
    {
      name: 'mq_admin_auth', // sessionStorage key
      storage: {
        getItem: (k) => { try { return JSON.parse(sessionStorage.getItem(k)); } catch { return null; } },
        setItem: (k, v) => sessionStorage.setItem(k, JSON.stringify(v)),
        removeItem: (k) => sessionStorage.removeItem(k),
      },
      partialize: (state) => ({ token: state.token, admin: state.admin, isAuthenticated: state.isAuthenticated }),
    }
  )
);
