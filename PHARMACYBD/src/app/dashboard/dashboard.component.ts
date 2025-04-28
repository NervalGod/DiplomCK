import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { db, Pharmacy, Product, Pricelist } from '../services/database.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  selectedView: string = 'all';
  pharmacy: Pharmacy[] = [];
  products: Product[] = [];
  pricelist: Pricelist[] = [];

  newPharmacy = { id_Phar: '', name: '', contact_info: '', adress: '', dir_fullname: '' };
  newProduct = { id_product: '', id_Phar: 0, name: '' }; 
  newPricelist = { id_Phar: 0, id_product: '', cost: '', payment_method: 'Наличный' as 'Наличный' | 'Безналичный' };

  editingPharmacy: Pharmacy | null = null;
  editingProduct: Product | null = null;
  editingPricelist: Pricelist | null = null;

  errors: { [key: string]: string } = {};

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  async loadAllData() {
    this.pharmacy = await db.getAllPharmacy();
    this.products = await db.getAllProducts();
    this.pricelist = await db.getAllPricelist();
  }

  validateName(name: string): boolean {
    const lettersOnly = /^[A-Za-zА-Яа-я\s]+$/;
    return lettersOnly.test(name);
  }

  validatePhone(phone: string): boolean {
    const phoneRegex = /^(\+7|8)\d{10}$/;
    return phoneRegex.test(phone);
  }

  validateNumberInput(value: string): boolean {
    return /^\d+$/.test(value);
  }

  validatePositiveNumber(value: string): number | null {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return null;
    return num;
  }

  getPharmacyName(id_Phar: number): string {
    const phar = this.pharmacy.find(s => s.id_Phar === id_Phar);
    return phar ? phar.name : 'Неизвестная аптека';
  }

  getProductName(id_product: number): string {
    const product = this.products.find(p => p.id_product === id_product);
    return product ? product.name : 'Неизвестный товар';
  }

  getPharmacyDetails(id_Phar: number): Partial<Pharmacy> {
    const phar = this.pharmacy.find(p => p.id_Phar === id_Phar);
    return phar ? phar : { contact_info: 'N/A', adress: 'N/A', dir_fullname: 'N/A' };
  }

  async addPharmacy() {
    this.errors = {};
    if (!this.newPharmacy.name) {
      this.errors['pharmacy_name'] = 'Имя аптеки обязательно';
      return;
    }
    if (!this.validateName(this.newPharmacy.name)) {
      this.errors['pharmacy_name'] = 'Название аптеки должно содержать только буквы';
      return;
    }
    if (!this.newPharmacy.contact_info) {
      this.errors['pharmacy_contact'] = 'Контактная информация обязательна';
      return;
    }
    if (!this.validateName(this.newPharmacy.dir_fullname)) {
      this.errors['pharmacy_dir_fullname'] = 'ФИО директора должно содержать только буквы';
      return;
    }
    if (!this.validatePhone(this.newPharmacy.contact_info)) {
      this.errors['pharmacy_contact'] = 'Введите корректный номер телефона (+7 или 8, затем 10 цифр)';
      return;
    }
    await db.addPharmacy({
      name: this.newPharmacy.name,
      contact_info: this.newPharmacy.contact_info,
      adress: this.newPharmacy.adress,
      dir_fullname: this.newPharmacy.dir_fullname
    });
    this.newPharmacy = { name: '', contact_info: '', adress: '', dir_fullname: '', id_Phar: '' };
    this.loadAllData();
  }

  editPharmacy(pharmacy: Pharmacy) {
    this.editingPharmacy = { ...pharmacy };
  }

  async updatePharmacy() {
    if (!this.editingPharmacy) return;
    this.errors = {};
    if (!this.editingPharmacy.name) {
      this.errors['pharmacy_name_edit'] = 'Имя аптеки обязательно';
      return;
    }
    if (!this.validateName(this.editingPharmacy.name)) {
      this.errors['pharmacy_name_edit'] = 'Имя аптеки должно содержать только буквы';
      return;
    }
    if (!this.validateName(this.editingPharmacy.dir_fullname)) {
      this.errors['pharmacy_dir_fullname_edit'] = 'Имя директора должно содержать только буквы';
      return;
    }
    if (!this.editingPharmacy.contact_info) {
      this.errors['pharmacy_contact_edit'] = 'Контактная информация обязательна';
      return;
    }
    if (!this.validatePhone(this.editingPharmacy.contact_info)) {
      this.errors['pharmacy_contact_edit'] = 'Введите корректный номер телефона';
      return;
    }
    await db.updatePharmacy(this.editingPharmacy.id_Phar, this.editingPharmacy);
    this.editingPharmacy = null;
    this.loadAllData();
  }

  cancelEditPharmacy() {
    this.editingPharmacy = null;
    this.errors = {};
  }

  async deletePharmacy(id: number) {
    await db.deletePharmacy(id);
    this.loadAllData();
  }

  async addProduct() {
    this.errors = {};
    if (!this.newProduct.id_Phar) {
      this.errors['product_id_pharmacy'] = 'Выберите аптеку';
      return;
    }
    if (!this.newProduct.name) {
      this.errors['product_name'] = 'Название товара обязательно';
      return;
    }
    if (!this.newProduct.id_product) {
      this.errors['product_id'] = 'ID товара обязателен';
      return;
    }
    const id_product = this.validatePositiveNumber(this.newProduct.id_product);
    if (id_product === null) {
      this.errors['product_id'] = 'ID должен быть положительным числом';
      return;
    }
    await db.addProduct({
      id_Phar: this.newProduct.id_Phar,
      name: this.newProduct.name,
      id_product: id_product
    });
    this.newProduct = { id_Phar: 0, name: '', id_product: '' };
    this.loadAllData();
  }

  editProduct(product: Product) {
    this.editingProduct = { ...product };
  }

  async updateProduct() {
    if (!this.editingProduct) return;
    this.errors = {};
    if (!this.editingProduct.id_Phar) {
      this.errors['product_id_pharmacy_edit'] = 'Выберите аптеку';
      return;
    }
    if (!this.editingProduct.name) {
      this.errors['product_name_edit'] = 'Название товара обязательно';
      return;
    }
    if (!this.editingProduct.id_product) {
      this.errors['product_id_edit'] = 'ID товара обязателен';
      return;
    }
    await db.updateProduct(this.editingProduct.id_product, this.editingProduct);
    this.editingProduct = null;
    this.loadAllData();
  }

  cancelEditProduct() {
    this.editingProduct = null;
    this.errors = {};
  }

  async deleteProduct(id: number) {
    await db.deleteProduct(id);
    this.loadAllData();
  }

  async addPricelist() {
    this.errors = {};
    if (!this.newPricelist.id_Phar) {
      this.errors['id_phar'] = 'Выберите аптеку';
      return;
    }
    if (!this.newPricelist.id_product) {
      this.errors['id_product'] = 'Выберите продукт';
      return;
    }
    if (!this.newPricelist.cost) {
      this.errors['cost'] = 'Цена товара обязательна';
      return;
    }
    const cost = this.validatePositiveNumber(this.newPricelist.cost);
    if (!cost) {
      this.errors['cost'] = 'Цена должна быть положительным числом';
      return;
    }
    try {
      await db.addPricelist({
        id_Phar: this.newPricelist.id_Phar,
        id_product: parseInt(this.newPricelist.id_product),
        cost: cost,
        payment_method: this.newPricelist.payment_method
      });
      this.newPricelist = { id_Phar: 0, id_product: '', cost: '', payment_method: 'Наличный' };
      this.loadAllData();
    } catch (error) {
      this.errors['pricelist_duplicate'] = 'Запись с такой аптекой и продуктом уже существует';
    }
  }

  editPricelist(pricelist: Pricelist) {
    this.editingPricelist = { ...pricelist };
  }

  async updatePricelist() {
    if (!this.editingPricelist) return;
    this.errors = {};
    if (!this.editingPricelist.id_Phar) {
      this.errors['id_phar_edit'] = 'Выберите аптеку';
      return;
    }
    if (!this.editingPricelist.id_product) {
      this.errors['id_product_edit'] = 'Выберите продукт';
      return;
    }
    if (!this.editingPricelist.cost) {
      this.errors['cost_edit'] = 'Цена обязательна';
      return;
    }
    const cost = this.validatePositiveNumber(this.editingPricelist.cost.toString());
    if (!cost) {
      this.errors['cost_edit'] = 'Цена должна быть положительным числом';
      return;
    }
    await db.updatePricelist(this.editingPricelist.id_Phar, this.editingPricelist.id_product, {
      id_Phar: this.editingPricelist.id_Phar,
      id_product: this.editingPricelist.id_product,
      cost: cost,
      payment_method: this.editingPricelist.payment_method
    });
    this.editingPricelist = null;
    this.loadAllData();
  }

  cancelEditPricelist() {
    this.editingPricelist = null;
    this.errors = {};
  }

  async deletePricelist(id_Phar: number, id_product: number) {
    await db.deletePricelist(id_Phar, id_product);
    this.loadAllData();
  }
}