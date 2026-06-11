import Dexie, { type Table } from 'dexie';

// ============================================================
// INTERFACES
// ============================================================

export interface Product {
  id?: number;
  name: string;
  price: number;
  category: string;
  gender: 'Homme' | 'Femme' | 'Enfant';
  image: string;
  images: string[];
  description: string;
  longDescription: string;
  stock: 'available' | 'low' | 'out';
  stockCount: number;
  badge?: string;
  createdAt: number;
}

export interface Category {
  id?: number;
  name: string;
  slug: string;
  image: string;
}

export interface User {
  id?: number;
  role: 'client' | 'admin';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  // Password stored as a simple hash (for a client-side app)
  passwordHash: string;
  createdAt: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Order {
  id?: number;
  orderNumber: string; // Ex: CMD-20240611-001
  userId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Visit {
  id?: number;
  page: string;
  referrer?: string;
  timestamp: number;
  sessionId: string;
}

// ============================================================
// DATABASE CLASS
// ============================================================

export class MarketplaceDB extends Dexie {
  products!: Table<Product>;
  categories!: Table<Category>;
  users!: Table<User>;
  orders!: Table<Order>;
  visits!: Table<Visit>;

  constructor() {
    super('MarketplaceDB');
    this.version(2).stores({
      products: '++id, name, category, gender, price, createdAt',
      categories: '++id, name, slug',
      users: '++id, email, role, createdAt',
      orders: '++id, orderNumber, userId, status, createdAt',
      visits: '++id, page, timestamp, sessionId',
    });
  }
}

export const db = new MarketplaceDB();

// ============================================================
// ADMIN INITIALIZATION
// ============================================================

// Simple hash function (for client-side use only)
export function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Generate a unique order number
export function generateOrderNumber(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `CMD-${date}-${random}`;
}

// Initialize admin account if it doesn't exist
export async function initializeAdmin(): Promise<void> {
  const existingAdmin = await db.users.where('role').equals('admin').first();
  if (!existingAdmin) {
    await db.users.add({
      role: 'admin',
      firstName: 'Admin',
      lastName: 'MimiÉlégance',
      email: 'admin@mimielegance.ci',
      phone: '+225 0556126199',
      passwordHash: simpleHash('Admin2024!'),
      createdAt: Date.now(),
    });
  }
}
