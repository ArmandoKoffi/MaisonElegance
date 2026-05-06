import Dexie, { type Table } from 'dexie';

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

export class MarketplaceDB extends Dexie {
  products!: Table<Product>;
  categories!: Table<Category>;

  constructor() {
    super('MarketplaceDB');
    this.version(1).stores({
      products: '++id, name, category, gender, price',
      categories: '++id, name, slug'
    });
  }
}

export const db = new MarketplaceDB();
