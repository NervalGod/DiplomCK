import { Injectable } from '@angular/core';

export interface Pharmacy {
  id_Phar: number;
  name: string;
  contact_info: string;
  adress: string;
  dir_fullname: string;
}

export interface Product {
  id_product: number;
  id_Phar: number;
  name: string;
}

export interface Pricelist {
  id_Phar: number;
  id_product: number;
  cost: number;
  payment_method: 'Наличный' | 'Безналичный';
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private pharmacies: Pharmacy[] = [];
  private products: Product[] = [];
  private pricelist: Pricelist[] = [];

  private STORAGE_KEYS = {
    PHARMACIES: 'pharmacies',
    PRODUCTS: 'products',
    PRICELIST: 'pricelist'
  };

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    try {
      // Load pharmacies
      const pharmaciesData = localStorage.getItem(this.STORAGE_KEYS.PHARMACIES);
      if (pharmaciesData) {
        this.pharmacies = JSON.parse(pharmaciesData).map((p: any) => ({
          ...p,
          id_Phar: Number(p.id_Phar)
        }));
      }

      // Load products
      const productsData = localStorage.getItem(this.STORAGE_KEYS.PRODUCTS);
      if (productsData) {
        this.products = JSON.parse(productsData).map((p: any) => ({
          ...p,
          id_product: Number(p.id_product),
          id_Phar: Number(p.id_Phar)
        }));
      }

      // Load pricelist
      const pricelistData = localStorage.getItem(this.STORAGE_KEYS.PRICELIST);
      if (pricelistData) {
        this.pricelist = JSON.parse(pricelistData).map((p: any) => ({
          ...p,
          id_Phar: Number(p.id_Phar),
          id_product: Number(p.id_product),
          cost: Number(p.cost)
        }));
      }

      console.log('Loaded from localStorage:', {
        pharmacies: this.pharmacies,
        products: this.products,
        pricelist: this.pricelist
      });
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.PHARMACIES, JSON.stringify(this.pharmacies));
      localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
      localStorage.setItem(this.STORAGE_KEYS.PRICELIST, JSON.stringify(this.pricelist));
      console.log('Saved to localStorage:', {
        pharmacies: this.pharmacies,
        products: this.products,
        pricelist: this.pricelist
      });
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }

  async getAllPharmacy(): Promise<Pharmacy[]> {
    return this.pharmacies;
  }

  async addPharmacy(pharmacy: Omit<Pharmacy, 'id_Phar'>): Promise<void> {
    const id = this.pharmacies.length ? Math.max(...this.pharmacies.map(p => p.id_Phar)) + 1 : 1;
    this.pharmacies.push({ ...pharmacy, id_Phar: id });
    this.saveToLocalStorage();
    console.log('Added pharmacy:', { ...pharmacy, id_Phar: id });
  }

  async updatePharmacy(id: number, pharmacy: Pharmacy): Promise<void> {
    const index = this.pharmacies.findIndex(p => p.id_Phar === id);
    if (index !== -1) {
      this.pharmacies[index] = { ...pharmacy, id_Phar: Number(id) };
      this.saveToLocalStorage();
      console.log('Updated pharmacy:', this.pharmacies[index]);
    }
  }

  async deletePharmacy(id: number): Promise<void> {
    this.pharmacies = this.pharmacies.filter(p => p.id_Phar !== id);
    this.saveToLocalStorage();
    console.log('Deleted pharmacy with id:', id);
  }

  async getAllProducts(): Promise<Product[]> {
    return this.products;
  }

  async addProduct(product: Product): Promise<void> {
    this.products.push({
      ...product,
      id_Phar: Number(product.id_Phar),
      id_product: Number(product.id_product)
    });
    this.saveToLocalStorage();
    console.log('Added product:', this.products[this.products.length - 1]);
  }

  async updateProduct(id: number, product: Product): Promise<void> {
    const index = this.products.findIndex(p => p.id_product === id);
    if (index !== -1) {
      this.products[index] = {
        ...product,
        id_Phar: Number(product.id_Phar),
        id_product: Number(id)
      };
      this.saveToLocalStorage();
      console.log('Updated product:', this.products[index]);
    }
  }

  async deleteProduct(id: number): Promise<void> {
    this.products = this.products.filter(p => p.id_product !== id);
    this.saveToLocalStorage();
    console.log('Deleted product with id:', id);
  }

  async getAllPricelist(): Promise<Pricelist[]> {
    return this.pricelist;
  }

  async addPricelist(pricelist: Pricelist): Promise<void> {
    const exists = this.pricelist.some(
      p => p.id_Phar === Number(pricelist.id_Phar) && p.id_product === Number(pricelist.id_product)
    );
    if (!exists) {
      this.pricelist.push({
        ...pricelist,
        id_Phar: Number(pricelist.id_Phar),
        id_product: Number(pricelist.id_product),
        cost: Number(pricelist.cost)
      });
      this.saveToLocalStorage();
      console.log('Added pricelist:', this.pricelist[this.pricelist.length - 1]);
    } else {
      throw new Error('Pricelist with this id_Phar and id_product already exists');
    }
  }

  async updatePricelist(id_Phar: number, id_product: number, pricelist: Pricelist): Promise<void> {
    const index = this.pricelist.findIndex(
      p => p.id_Phar === Number(id_Phar) && p.id_product === Number(id_product)
    );
    if (index !== -1) {
      this.pricelist[index] = {
        ...pricelist,
        id_Phar: Number(pricelist.id_Phar),
        id_product: Number(pricelist.id_product),
        cost: Number(pricelist.cost)
      };
      this.saveToLocalStorage();
      console.log('Updated pricelist:', this.pricelist[index]);
    }
  }

  async deletePricelist(id_Phar: number, id_product: number): Promise<void> {
    this.pricelist = this.pricelist.filter(
      p => !(p.id_Phar === Number(id_Phar) && p.id_product === Number(id_product))
    );
    this.saveToLocalStorage();
    console.log('Deleted pricelist with id_Phar:', id_Phar, 'id_product:', id_product);
  }
}

export const db = new DatabaseService();