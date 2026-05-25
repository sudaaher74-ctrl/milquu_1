import { create } from 'zustand';
import { fetchProducts } from '../services/api';

export const useProductStore = create((set, get) => ({
  products: [],
  loaded: false,
  loading: false,

  load: async (scope = '') => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const products = await fetchProducts(scope);
      set({ products, loaded: true });
    } finally {
      set({ loading: false });
    }
  },
}));
