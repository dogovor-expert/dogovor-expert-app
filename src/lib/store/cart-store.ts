import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  total: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
            total: state.total + item.price,
          }));
        } else {
          set((state) => ({
            items: [...state.items, { ...item, quantity: 1 }],
            total: state.total + item.price,
          }));
        }
      },

      removeItem: (id) => {
        const item = get().items.find((i) => i.id === id);
        if (!item) return;
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
          total: state.total - item.price * item.quantity,
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        const item = get().items.find((i) => i.id === id);
        if (!item) return;
        const diff = quantity - item.quantity;
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
          total: state.total + diff * item.price,
        }));
      },

      clearCart: () => set({ items: [], total: 0 }),
    }),
    { name: 'cart-storage' }
  )
);