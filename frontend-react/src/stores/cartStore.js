import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product) => {
        const items = get().items;
        const existing = items.find((i) => i.id === product.id);
        if (existing) {
          set({ items: items.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) });
        } else {
          set({ items: [...items, { ...product, qty: 1 }] });
        }
      },

      removeFromCart: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQty: (id, delta) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      // Sync cart items with live product catalog prices/names
      syncWithCatalog: (products) => {
        const productMap = new Map();
        products.forEach((p) => {
          if (p.productId) productMap.set(p.productId, p);
          if (p.id) productMap.set(p.id, p);
        });

        const synced = get().items.flatMap((item) => {
          const live = productMap.get(item.productId) || productMap.get(item.id);
          if (!live) return [];
          return [{ ...item, id: live.id, productId: live.productId, name: live.name, price: live.price, e: live.e, unit: live.unit }];
        });
        set({ items: synced });
      },

      get totalItems() {
        return get().items.reduce((sum, i) => sum + i.qty, 0);
      },

      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.qty, 0);
      },
    }),
    {
      name: 'mq_cart', // localStorage key — matches old `mq_cart`
      partialize: (state) => ({ items: state.items }),
    }
  )
);
