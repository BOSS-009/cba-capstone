import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, CartItem, Table, Order, MenuItem } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

interface CartState {
  items: CartItem[];
  selectedTable: Table | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setSelectedTable: (table: Table | null) => void;
  getTotal: () => number;
}

interface AppState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isVoiceListening: boolean;
  setVoiceListening: (listening: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  selectedTable: null,
  addItem: (item) =>
    set((state) => {
      const existingIndex = state.items.findIndex(
        (i) => i.menuItemId === item.menuItemId && 
               JSON.stringify(i.variants) === JSON.stringify(item.variants) &&
               JSON.stringify(i.addons) === JSON.stringify(item.addons)
      );
      if (existingIndex > -1) {
        const newItems = [...state.items];
        newItems[existingIndex].quantity += item.quantity;
        return { items: newItems };
      }
      return { items: [...state.items, item] };
    }),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    })),
  clearCart: () => set({ items: [], selectedTable: null }),
  setSelectedTable: (table) => set({ selectedTable: table }),
  getTotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  isVoiceListening: false,
  setVoiceListening: (listening) => set({ isVoiceListening: listening }),
}));
