import { 
  type Category, 
  type Product, 
  type Review, 
  type Order,
  type Customer,
  type InventoryLog,
  type User,
  type Session,
  type Cart,
  type CartItem,
  type InsertCategory, 
  type InsertProduct, 
  type InsertReview, 
  type InsertOrder,
  type InsertCustomer,
  type InsertInventoryLog,
  type InsertUser,
  type InsertSession,
  type InsertCart,
  type InsertCartItem,
  categories,
  products,
  reviews,
  orders,
  customers,
  inventoryLogs,
  users,
  sessions,
  carts,
  cartItems
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, ilike, and, desc, sql, count } from "drizzle-orm";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Products
  getProducts(categoryId?: string): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Reviews
  getReviewsByProductId(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  updateOrderPaymentStatus(id: string, paymentStatus: string): Promise<Order | undefined>;
  updateOrderTracking(id: string, trackingNumber: string): Promise<Order | undefined>;
  
  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomerById(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  
  // Inventory
  getInventoryLogs(productId?: string): Promise<InventoryLog[]>;
  createInventoryLog(log: InsertInventoryLog): Promise<InventoryLog>;
  getLowStockProducts(threshold?: number): Promise<Product[]>;
  updateProductStock(id: string, newStock: number, reason?: string): Promise<boolean>;
  
  // Authentication
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  getSessionById(id: string): Promise<Session | undefined>;
  deleteSession(id: string): Promise<boolean>;
  
  // Shopping Cart
  getCartByUserId(userId: string): Promise<{ items: any[], total: number } | null>;
  addToCart(userId: string, item: { productId: string, quantity: number, priceAtTime: string }): Promise<CartItem>;
  updateCartItem(itemId: string, quantity: number, userId: string): Promise<CartItem | undefined>;
  removeFromCart(itemId: string, userId: string): Promise<boolean>;
  clearCart(userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async getProducts(categoryId?: string): Promise<Product[]> {
    if (categoryId) {
      return await db
        .select()
        .from(products)
        .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)))
        .orderBy(desc(products.createdAt));
    }
    return await db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.createdAt));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const barcode = this.generateBarcode();
    const productData = {
      name: insertProduct.name,
      description: insertProduct.description,
      price: insertProduct.price,
      categoryId: insertProduct.categoryId,
      stock: insertProduct.stock || 0,
      specifications: insertProduct.specifications || {},
      isActive: insertProduct.isActive !== undefined ? insertProduct.isActive : true,
      images: insertProduct.images || [],
      barcode
    } as any;
    
    const [product] = await db
      .insert(products)
      .values(productData)
      .returning();
    return product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const updateFields: any = {
      updatedAt: new Date()
    };
    
    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.price !== undefined) updateFields.price = updateData.price;
    if (updateData.categoryId !== undefined) updateFields.categoryId = updateData.categoryId;
    if (updateData.stock !== undefined) updateFields.stock = updateData.stock;
    if (updateData.specifications !== undefined) updateFields.specifications = updateData.specifications;
    if (updateData.isActive !== undefined) updateFields.isActive = updateData.isActive;
    if (updateData.images !== undefined) updateFields.images = updateData.images;
    
    const [product] = await db
      .update(products)
      .set(updateFields)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          ilike(products.name, `%${query}%`)
        )
      )
      .orderBy(desc(products.createdAt));
  }

  async getReviewsByProductId(productId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values({
        ...insertReview,
        isVerified: insertReview.isVerified || false
      })
      .returning();
    return review;
  }

  async getOrders(): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const orderData = {
      customerName: insertOrder.customerName,
      customerEmail: insertOrder.customerEmail,
      totalAmount: insertOrder.totalAmount,
      items: insertOrder.items,
      status: "pending"
    } as any;
    
    const [order] = await db
      .insert(orders)
      .values(orderData)
      .returning();
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async updateOrderPaymentStatus(id: string, paymentStatus: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ paymentStatus, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async updateOrderTracking(id: string, trackingNumber: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ trackingNumber, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async getCustomers(): Promise<Customer[]> {
    return await db
      .select()
      .from(customers)
      .orderBy(desc(customers.lastOrderAt));
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async updateCustomer(id: string, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await db
      .update(customers)
      .set(updateData)
      .where(eq(customers.id, id))
      .returning();
    return customer || undefined;
  }

  async getInventoryLogs(productId?: string): Promise<InventoryLog[]> {
    if (productId) {
      return await db
        .select()
        .from(inventoryLogs)
        .where(eq(inventoryLogs.productId, productId))
        .orderBy(desc(inventoryLogs.createdAt));
    }
    return await db
      .select()
      .from(inventoryLogs)
      .orderBy(desc(inventoryLogs.createdAt))
      .limit(100);
  }

  async createInventoryLog(insertLog: InsertInventoryLog): Promise<InventoryLog> {
    const [log] = await db
      .insert(inventoryLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.isActive, true), sql`${products.stock} <= ${threshold}`))
      .orderBy(products.stock);
  }

  async updateProductStock(id: string, newStock: number, reason?: string): Promise<boolean> {
    const product = await this.getProductById(id);
    if (!product) return false;

    const previousStock = product.stock;
    const quantity = newStock - previousStock;
    const action = quantity > 0 ? 'add' : quantity < 0 ? 'remove' : 'adjustment';

    // Update product stock
    const [updatedProduct] = await db
      .update(products)
      .set({ stock: newStock, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();

    // Log the inventory change
    if (updatedProduct) {
      await this.createInventoryLog({
        productId: id,
        action,
        quantity: Math.abs(quantity),
        previousStock,
        newStock,
        reason: reason || `Stock ${action}`
      });
      return true;
    }

    return false;
  }

  private generateBarcode(): string {
    const patterns = [
      "||||| |||| ||||",
      "|||| ||| |||||",
      "||| |||| ||||||",
      "|||| ||| |||| ||",
      "|| |||| ||||| |",
      "||| || ||| ||||",
      "|||| || ||| |||",
      "|| ||| |||| |||"
    ];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }
}

export class MemStorage implements IStorage {
  private categories: Map<string, Category>;
  private products: Map<string, Product>;
  private reviews: Map<string, Review>;
  private orders: Map<string, Order>;

  constructor() {
    this.categories = new Map();
    this.products = new Map();
    this.reviews = new Map();
    this.orders = new Map();
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize categories
    const categories = [
      { id: "silk", name: "Silk", description: "Premium silk fabrics", imageUrl: "https://pixabay.com/get/ge6f02ef2d6d0b2a6888dcc3c92fc13e4a90fa4323b9c8f3b08ce2ad81a5bcd45c94e93b6ce9ae47e68d91b94b7d62eccb259bfa0180c5211966e23b014e58157_1280.jpg" },
      { id: "cotton", name: "Cotton", description: "Natural cotton blends", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300" },
      { id: "wool", name: "Wool", description: "Cozy wool fabrics", imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300" },
      { id: "synthetic", name: "Synthetic", description: "Modern synthetic blends", imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300" }
    ];

    categories.forEach(cat => this.categories.set(cat.id, cat));

    // Initialize products
    const products = [
      {
        id: "BL001",
        name: "Premium Blue Silk",
        description: "Luxurious blue silk fabric perfect for formal wear and special occasions. Made from 100% natural silk with exceptional drape and sheen.",
        price: "45.00",
        categoryId: "silk",
        stock: 156,
        images: [
          "https://pixabay.com/get/gb4a5cd721e57314c48e6762a94258cc04b18b5df85aa7ee72626b9e34707e27e737aa8ae03c48bc637ccef16e953c1e7e8bd6ce76346437b009ad4b4e6d51b84_1280.jpg",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
          "https://pixabay.com/get/g007f71724ebc99f8a00038e29dc4380250fb2f84ebf66d7cc425c19088fe3d22ce5d1605619ef53e05777cb6608486eae410303eda0b8f31b63af68dce64c4ae_1280.jpg"
        ],
        specifications: {
          material: "100% Natural Silk",
          width: "150cm",
          weight: "120 GSM",
          care: "Dry Clean Only"
        },
        barcode: "||||| |||| ||||",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "CT002",
        name: "Organic Red Cotton",
        description: "Premium organic cotton fabric in rich red color. Perfect for casual wear and home textiles.",
        price: "32.00",
        categoryId: "cotton",
        stock: 8,
        images: [
          "https://pixabay.com/get/gfb069abbcd86e57751251522b7ce8e7b6c02c71d7e5c5efd06583ad38fe585eff18e908c974bef38971da3b67fe27924a9309881e9b483f0696fc80c56f4e479_1280.jpg"
        ],
        specifications: {
          material: "100% Organic Cotton",
          width: "140cm",
          weight: "200 GSM",
          care: "Machine Wash Cold"
        },
        barcode: "|||| ||| |||||",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "WL003",
        name: "Merino Green Wool",
        description: "Premium merino wool fabric in forest green. Excellent for winter clothing and accessories.",
        price: "58.00",
        categoryId: "wool",
        stock: 43,
        images: [
          "https://pixabay.com/get/g0434b8087bcb5db4eb1227e161e6b1338a5483715f7497aa185dca80c9e547502d2b18891332ff79cae26c8dab6dcba7e5f75d98fc07053c3be65806ea2146dc_1280.jpg"
        ],
        specifications: {
          material: "100% Merino Wool",
          width: "150cm",
          weight: "300 GSM",
          care: "Hand Wash Only"
        },
        barcode: "||| |||| ||||||",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "PL004",
        name: "Patterned Polyester",
        description: "Modern patterned polyester fabric with geometric designs. Great for contemporary fashion.",
        price: "28.00",
        categoryId: "synthetic",
        stock: 67,
        images: [
          "https://pixabay.com/get/g8644e058f79d6467cb7d5a0be4a94f215865f5d81034d004598f36eaa0661906601e7fd1f2d2d1c55c748c4b6313fd47edd1bc4b19ed76ff0cd421dfdc862494_1280.jpg"
        ],
        specifications: {
          material: "100% Polyester",
          width: "145cm",
          weight: "150 GSM",
          care: "Machine Wash Warm"
        },
        barcode: "|||| ||| |||| ||",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    products.forEach(product => this.products.set(product.id, product));

    // Initialize reviews
    const reviews = [
      {
        id: randomUUID(),
        productId: "BL001",
        userName: "Fatima Al-Zahra",
        rating: 5,
        comment: "Absolutely beautiful fabric! The quality is exceptional and the color is exactly as shown. Used it for my daughter's wedding dress and it was perfect. Fast delivery too.",
        isVerified: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: randomUUID(),
        productId: "BL001",
        userName: "Mohammed Hassan",
        rating: 5,
        comment: "Great quality silk. Bought this for tailoring traditional garments. The fabric handles very well and the finish is professional grade.",
        isVerified: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: randomUUID(),
        productId: "CT002",
        userName: "Sara Ahmed",
        rating: 4,
        comment: "Good quality organic cotton. The color is vibrant and the fabric feels nice. Would recommend for casual projects.",
        isVerified: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    reviews.forEach(review => this.reviews.set(review.id, review));
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { 
      ...insertCategory, 
      id,
      description: insertCategory.description || null,
      imageUrl: insertCategory.imageUrl || null
    };
    this.categories.set(id, category);
    return category;
  }

  async getProducts(categoryId?: string): Promise<Product[]> {
    const products = Array.from(this.products.values()).filter(p => p.isActive);
    if (categoryId) {
      return products.filter(p => p.categoryId === categoryId);
    }
    return products;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const barcode = this.generateBarcode();
    const product: Product = {
      ...insertProduct,
      id,
      barcode,
      stock: insertProduct.stock || 0,
      specifications: insertProduct.specifications || {},
      isActive: insertProduct.isActive !== undefined ? insertProduct.isActive : true,
      images: Array.isArray(insertProduct.images) ? insertProduct.images as string[] : [] as string[],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;

    const updated: Product = {
      ...existing,
      ...updateData,
      images: Array.isArray(updateData.images) ? updateData.images as string[] : existing.images as string[],
      updatedAt: new Date()
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(product =>
      product.isActive && (
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery)
      )
    );
  }

  async getReviewsByProductId(productId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.productId === productId);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      isVerified: insertReview.isVerified || false,
      createdAt: new Date()
    };
    this.reviews.set(id, review);
    return review;
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      status: insertOrder.status || "pending",
      items: Array.isArray(insertOrder.items) ? insertOrder.items as Array<{productId: string, quantity: number, price: number}> : [] as Array<{productId: string, quantity: number, price: number}>,
      createdAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;

    const updated: Order = { ...existing, status };
    this.orders.set(id, updated);
    return updated;
  }

  private generateBarcode(): string {
    const patterns = [
      "||||| |||| ||||",
      "|||| ||| |||||",
      "||| |||| ||||||",
      "|||| ||| |||| ||",
      "|| |||| ||||| |"
    ];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  // User authentication methods
  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Session management methods
  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getSessionById(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session || undefined;
  }

  async deleteSession(id: string): Promise<boolean> {
    const result = await db.delete(sessions).where(eq(sessions.id, id));
    return result.rowCount > 0;
  }

  // Shopping cart methods
  async getCartByUserId(userId: string): Promise<{ items: any[], total: number } | null> {
    // Get or create cart
    let [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    
    if (!cart) {
      [cart] = await db
        .insert(carts)
        .values({ userId })
        .returning();
    }

    // Get cart items with product details
    const items = await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        priceAtTime: cartItems.priceAtTime,
        productName: products.name,
        productImage: sql`${products.images}->0`,
        currentPrice: products.price,
        stock: products.stock
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cart.id));

    const total = items.reduce((sum, item) => 
      sum + (parseFloat(item.priceAtTime) * item.quantity), 0
    );

    return { items, total };
  }

  async addToCart(userId: string, item: { productId: string, quantity: number, priceAtTime: string }): Promise<CartItem> {
    // Get or create cart
    let [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    
    if (!cart) {
      [cart] = await db
        .insert(carts)
        .values({ userId })
        .returning();
    }

    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.cartId, cart.id),
        eq(cartItems.productId, item.productId)
      ));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ 
          quantity: existingItem.quantity + item.quantity,
          updatedAt: new Date()
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Add new item
      const [newItem] = await db
        .insert(cartItems)
        .values({
          cartId: cart.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtTime: item.priceAtTime
        })
        .returning();
      return newItem;
    }
  }

  async updateCartItem(itemId: string, quantity: number, userId: string): Promise<CartItem | undefined> {
    // Verify the item belongs to the user's cart
    const [item] = await db
      .select()
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .where(and(
        eq(cartItems.id, itemId),
        eq(carts.userId, userId)
      ));

    if (!item) return undefined;

    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, itemId))
      .returning();
    
    return updatedItem || undefined;
  }

  async removeFromCart(itemId: string, userId: string): Promise<boolean> {
    // Verify the item belongs to the user's cart
    const [item] = await db
      .select()
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .where(and(
        eq(cartItems.id, itemId),
        eq(carts.userId, userId)
      ));

    if (!item) return false;

    const result = await db.delete(cartItems).where(eq(cartItems.id, itemId));
    return result.rowCount > 0;
  }

  async clearCart(userId: string): Promise<boolean> {
    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    if (!cart) return true;

    const result = await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    return true;
  }
}

export const storage = new DatabaseStorage();
