// Local Storage Service for Inventory Management System

export interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string;
  price: number;
  stock: number;
  description: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  type: 'feedback' | 'enquiry';
  subject: string;
  message: string;
  productId?: string;
  productName?: string;
  reply?: string;
  status: 'pending' | 'replied';
  createdAt: string;
  repliedAt?: string;
}

export interface HistoryEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  type: 'purchase' | 'admin_action' | 'feedback' | 'payment';
  createdAt: string;
}

class LocalStorageService {
  private getKey(key: string): string {
    return `inventory_${key}`;
  }

  private get<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(this.getKey(key));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return [];
    }
  }

  private set<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(data));
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  }

  // Initialize with sample data
  initialize(): void {
    if (!localStorage.getItem(this.getKey('initialized'))) {
      this.initializeSampleData();
      localStorage.setItem(this.getKey('initialized'), 'true');
    }
  }

  private initializeSampleData(): void {
    // Sample categories
    const categories: Category[] = [
      { id: '1', name: 'Electronics', description: 'Electronic items and gadgets', createdAt: new Date().toISOString() },
      { id: '2', name: 'Groceries', description: 'Food and daily essentials', createdAt: new Date().toISOString() },
      { id: '3', name: 'Clothing', description: 'Apparel and accessories', createdAt: new Date().toISOString() },
      { id: '4', name: 'Books', description: 'Books and stationery', createdAt: new Date().toISOString() },
    ];

    // Sample suppliers
    const suppliers: Supplier[] = [
      { id: '1', name: 'TechCorp Ltd', email: 'contact@techcorp.com', phone: '+91-9876543210', address: 'Mumbai, Maharashtra', createdAt: new Date().toISOString() },
      { id: '2', name: 'FreshMart Suppliers', email: 'sales@freshmart.com', phone: '+91-9876543211', address: 'Delhi, NCR', createdAt: new Date().toISOString() },
      { id: '3', name: 'Fashion Hub', email: 'info@fashionhub.com', phone: '+91-9876543212', address: 'Bangalore, Karnataka', createdAt: new Date().toISOString() },
    ];

    // Sample products
    const products: Product[] = [
      {
        id: '1',
        name: 'Samsung Galaxy A54',
        category: 'Electronics',
        supplier: 'TechCorp Ltd',
        price: 35999,
        stock: 25,
        description: 'Latest Samsung smartphone with 128GB storage',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Basmati Rice 5kg',
        category: 'Groceries',
        supplier: 'FreshMart Suppliers',
        price: 899,
        stock: 50,
        description: 'Premium quality basmati rice',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Cotton T-Shirt',
        category: 'Clothing',
        supplier: 'Fashion Hub',
        price: 599,
        stock: 8,
        description: 'Comfortable cotton t-shirt',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Wireless Headphones',
        category: 'Electronics',
        supplier: 'TechCorp Ltd',
        price: 2999,
        stock: 15,
        description: 'Bluetooth wireless headphones with noise cancellation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    this.set('categories', categories);
    this.set('suppliers', suppliers);
    this.set('products', products);
  }

  // Products
  getProducts(): Product[] {
    return this.get<Product>('products');
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    this.set('products', products);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
    this.set('products', products);
    return products[index];
  }

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length !== products.length) {
      this.set('products', filtered);
      return true;
    }
    return false;
  }

  // Categories
  getCategories(): Category[] {
    return this.get<Category>('categories');
  }

  addCategory(category: Omit<Category, 'id' | 'createdAt'>): Category {
    const categories = this.getCategories();
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    categories.push(newCategory);
    this.set('categories', categories);
    return newCategory;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return null;

    categories[index] = { ...categories[index], ...updates };
    this.set('categories', categories);
    return categories[index];
  }

  deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    if (filtered.length !== categories.length) {
      this.set('categories', filtered);
      return true;
    }
    return false;
  }

  // Suppliers
  getSuppliers(): Supplier[] {
    return this.get<Supplier>('suppliers');
  }

  addSupplier(supplier: Omit<Supplier, 'id' | 'createdAt'>): Supplier {
    const suppliers = this.getSuppliers();
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    suppliers.push(newSupplier);
    this.set('suppliers', suppliers);
    return newSupplier;
  }

  updateSupplier(id: string, updates: Partial<Supplier>): Supplier | null {
    const suppliers = this.getSuppliers();
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) return null;

    suppliers[index] = { ...suppliers[index], ...updates };
    this.set('suppliers', suppliers);
    return suppliers[index];
  }

  deleteSupplier(id: string): boolean {
    const suppliers = this.getSuppliers();
    const filtered = suppliers.filter(s => s.id !== id);
    if (filtered.length !== suppliers.length) {
      this.set('suppliers', filtered);
      return true;
    }
    return false;
  }

  // Orders
  getOrders(): Order[] {
    return this.get<Order>('orders');
  }

  addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    this.set('orders', orders);
    return newOrder;
  }

  updateOrder(id: string, updates: Partial<Order>): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return null;

    orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
    this.set('orders', orders);
    return orders[index];
  }

  // Cart
  getCart(userId: string): CartItem[] {
    return this.get<CartItem>(`cart_${userId}`);
  }

  updateCart(userId: string, items: CartItem[]): void {
    this.set(`cart_${userId}`, items);
  }

  clearCart(userId: string): void {
    this.set(`cart_${userId}`, []);
  }

  // Feedback
  getFeedback(): Feedback[] {
    return this.get<Feedback>('feedback');
  }

  addFeedback(feedback: Omit<Feedback, 'id' | 'createdAt'>): Feedback {
    const feedbacks = this.getFeedback();
    const newFeedback: Feedback = {
      ...feedback,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    feedbacks.push(newFeedback);
    this.set('feedback', feedbacks);
    return newFeedback;
  }

  updateFeedback(id: string, updates: Partial<Feedback>): Feedback | null {
    const feedbacks = this.getFeedback();
    const index = feedbacks.findIndex(f => f.id === id);
    if (index === -1) return null;

    feedbacks[index] = { ...feedbacks[index], ...updates };
    if (updates.reply) {
      feedbacks[index].repliedAt = new Date().toISOString();
      feedbacks[index].status = 'replied';
    }
    this.set('feedback', feedbacks);
    return feedbacks[index];
  }

  // History
  getHistory(): HistoryEntry[] {
    return this.get<HistoryEntry>('history');
  }

  addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'createdAt'>): HistoryEntry {
    const history = this.getHistory();
    const newEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    history.unshift(newEntry); // Add to beginning for recent first
    this.set('history', history);
    return newEntry;
  }

  getUserHistory(userId: string): HistoryEntry[] {
    return this.getHistory().filter(entry => entry.userId === userId);
  }

  // Statistics
  getStats() {
    const products = this.getProducts();
    const categories = this.getCategories();
    const suppliers = this.getSuppliers();
    const orders = this.getOrders();
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const lowStockProducts = products.filter(product => product.stock < 10);

    return {
      products: products.length,
      categories: categories.length,
      suppliers: suppliers.length,
      orders: orders.length,
      users: users.length,
      totalStock,
      totalValue,
      lowStockProducts: lowStockProducts.length,
      lowStockItems: lowStockProducts,
    };
  }
}

export const localStorageService = new LocalStorageService();