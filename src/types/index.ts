export type UserRole = 'admin' | 'manager' | 'waiter' | 'kitchen' | 'cashier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type TableStatus = 'available' | 'occupied' | 'reserved';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
}

export interface MenuVariant {
  name: string;
  price: number;
}

export interface MenuAddon {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image_url: string;
  variants: MenuVariant[];
  addons: MenuAddon[];
  isAvailable: boolean;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'paid';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  variants?: string[];
  addons?: string[];
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  waiterId: string;
  waiterName: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  thresholdLevel: number;
}

export interface CartItem extends OrderItem {
  id: string;
}
