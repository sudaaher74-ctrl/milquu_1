import { create } from 'zustand';

export const useToastStore = create((set) => ({
  message: '',
  visible: false,
  show: (message) => {
    set({ message, visible: true });
    setTimeout(() => set({ visible: false }), 3200);
  },
}));
