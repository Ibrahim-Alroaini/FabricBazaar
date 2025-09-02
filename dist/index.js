var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  cartItems: () => cartItems,
  carts: () => carts,
  categories: () => categories,
  checkoutSchema: () => checkoutSchema,
  customers: () => customers,
  insertCartItemSchema: () => insertCartItemSchema,
  insertCartSchema: () => insertCartSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertInventoryLogSchema: () => insertInventoryLogSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertProductSchema: () => insertProductSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertSessionSchema: () => insertSessionSchema,
  insertUserSchema: () => insertUserSchema,
  inventoryLogs: () => inventoryLogs,
  loginSchema: () => loginSchema,
  orders: () => orders,
  products: () => products,
  reviews: () => reviews,
  sessions: () => sessions,
  signupSchema: () => signupSchema,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("customer"),
  // "customer" or "admin"
  isVerified: boolean("is_verified").notNull().default(false),
  phone: text("phone"),
  address: jsonb("address").$type(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var sessions = pgTable("sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var carts = pgTable("carts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: text("session_id"),
  // For guest users
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cartId: varchar("cart_id").notNull().references(() => carts.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  priceAtTime: decimal("price_at_time", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url")
});
var products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: varchar("category_id").notNull(),
  stock: integer("stock").notNull().default(0),
  images: jsonb("images").$type().notNull().default([]),
  specifications: jsonb("specifications").$type().notNull().default({}),
  barcode: text("barcode").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  customerId: varchar("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  shippingAddress: jsonb("shipping_address").$type().notNull(),
  billingAddress: jsonb("billing_address").$type(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull().default("0.00"),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  trackingNumber: text("tracking_number"),
  items: jsonb("items").$type().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: jsonb("address").$type(),
  totalOrders: integer("total_orders").notNull().default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  lastOrderAt: timestamp("last_order_at")
});
var inventoryLogs = pgTable("inventory_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  action: text("action").notNull(),
  // 'add', 'remove', 'sale', 'adjustment'
  quantity: integer("quantity").notNull(),
  previousStock: integer("previous_stock").notNull(),
  newStock: integer("new_stock").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertCategorySchema = createInsertSchema(categories).omit({
  id: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  barcode: true
});
var insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertSessionSchema = createInsertSchema(sessions).omit({
  createdAt: true
});
var insertCartSchema = createInsertSchema(carts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true
});
var insertInventoryLogSchema = createInsertSchema(inventoryLogs).omit({
  id: true,
  createdAt: true
});
var loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});
var signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    emirate: z.string().optional(),
    zipCode: z.string().optional()
  }).optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
var checkoutSchema = z.object({
  shippingAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    emirate: z.string().min(1, "Emirate is required"),
    zipCode: z.string().min(1, "ZIP code is required")
  }),
  billingAddress: z.object({
    street: z.string(),
    city: z.string(),
    emirate: z.string(),
    zipCode: z.string()
  }).optional(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  notes: z.string().optional()
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, ilike, and, desc, sql as sql2 } from "drizzle-orm";
var DatabaseStorage = class {
  async getCategories() {
    return await db.select().from(categories);
  }
  async getCategoryById(id) {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || void 0;
  }
  async createCategory(insertCategory) {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }
  async getProducts(categoryId) {
    if (categoryId) {
      return await db.select().from(products).where(and(eq(products.categoryId, categoryId), eq(products.isActive, true))).orderBy(desc(products.createdAt));
    }
    return await db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
  }
  async getProductById(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || void 0;
  }
  async createProduct(insertProduct) {
    const barcode = this.generateBarcode();
    const productData = {
      name: insertProduct.name,
      description: insertProduct.description,
      price: insertProduct.price,
      categoryId: insertProduct.categoryId,
      stock: insertProduct.stock || 0,
      specifications: insertProduct.specifications || {},
      isActive: insertProduct.isActive !== void 0 ? insertProduct.isActive : true,
      images: insertProduct.images || [],
      barcode
    };
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }
  async updateProduct(id, updateData) {
    const updateFields = {
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (updateData.name !== void 0) updateFields.name = updateData.name;
    if (updateData.description !== void 0) updateFields.description = updateData.description;
    if (updateData.price !== void 0) updateFields.price = updateData.price;
    if (updateData.categoryId !== void 0) updateFields.categoryId = updateData.categoryId;
    if (updateData.stock !== void 0) updateFields.stock = updateData.stock;
    if (updateData.specifications !== void 0) updateFields.specifications = updateData.specifications;
    if (updateData.isActive !== void 0) updateFields.isActive = updateData.isActive;
    if (updateData.images !== void 0) updateFields.images = updateData.images;
    const [product] = await db.update(products).set(updateFields).where(eq(products.id, id)).returning();
    return product || void 0;
  }
  async deleteProduct(id) {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
  }
  async searchProducts(query) {
    return await db.select().from(products).where(
      and(
        eq(products.isActive, true),
        ilike(products.name, `%${query}%`)
      )
    ).orderBy(desc(products.createdAt));
  }
  async getReviewsByProductId(productId) {
    return await db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
  }
  async createReview(insertReview) {
    const [review] = await db.insert(reviews).values({
      ...insertReview,
      isVerified: insertReview.isVerified || false
    }).returning();
    return review;
  }
  async getOrders() {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }
  async getOrderById(id) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || void 0;
  }
  async createOrder(insertOrder) {
    const orderData = {
      customerName: insertOrder.customerName,
      customerEmail: insertOrder.customerEmail,
      totalAmount: insertOrder.totalAmount,
      items: insertOrder.items,
      status: "pending"
    };
    const [order] = await db.insert(orders).values(orderData).returning();
    return order;
  }
  async updateOrderStatus(id, status) {
    const [order] = await db.update(orders).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id)).returning();
    return order || void 0;
  }
  async updateOrderPaymentStatus(id, paymentStatus) {
    const [order] = await db.update(orders).set({ paymentStatus, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id)).returning();
    return order || void 0;
  }
  async updateOrderTracking(id, trackingNumber) {
    const [order] = await db.update(orders).set({ trackingNumber, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id)).returning();
    return order || void 0;
  }
  async getCustomers() {
    return await db.select().from(customers).orderBy(desc(customers.lastOrderAt));
  }
  async getCustomerById(id) {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || void 0;
  }
  async getCustomerByEmail(email) {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer || void 0;
  }
  async createCustomer(insertCustomer) {
    const [customer] = await db.insert(customers).values(insertCustomer).returning();
    return customer;
  }
  async updateCustomer(id, updateData) {
    const [customer] = await db.update(customers).set(updateData).where(eq(customers.id, id)).returning();
    return customer || void 0;
  }
  async getInventoryLogs(productId) {
    if (productId) {
      return await db.select().from(inventoryLogs).where(eq(inventoryLogs.productId, productId)).orderBy(desc(inventoryLogs.createdAt));
    }
    return await db.select().from(inventoryLogs).orderBy(desc(inventoryLogs.createdAt)).limit(100);
  }
  async createInventoryLog(insertLog) {
    const [log2] = await db.insert(inventoryLogs).values(insertLog).returning();
    return log2;
  }
  async getLowStockProducts(threshold = 10) {
    return await db.select().from(products).where(and(eq(products.isActive, true), sql2`${products.stock} <= ${threshold}`)).orderBy(products.stock);
  }
  async updateProductStock(id, newStock, reason) {
    const product = await this.getProductById(id);
    if (!product) return false;
    const previousStock = product.stock;
    const quantity = newStock - previousStock;
    const action = quantity > 0 ? "add" : quantity < 0 ? "remove" : "adjustment";
    const [updatedProduct] = await db.update(products).set({ stock: newStock, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, id)).returning();
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
  // Authentication methods
  async getUserById(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, updateData) {
    const [user] = await db.update(users).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  // Session methods
  async createSession(insertSession) {
    const [session] = await db.insert(sessions).values(insertSession).returning();
    return session;
  }
  async getSessionById(id) {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session || void 0;
  }
  async deleteSession(id) {
    const result = await db.delete(sessions).where(eq(sessions.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // Shopping cart methods
  async getCartByUserId(userId) {
    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    if (!cart) return null;
    const items = await db.select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      priceAtTime: cartItems.priceAtTime,
      productName: products.name,
      productImage: sql2`${products.images}[1]`.as("productImage"),
      stock: products.stock
    }).from(cartItems).leftJoin(products, eq(cartItems.productId, products.id)).where(eq(cartItems.cartId, cart.id));
    const total = items.reduce((sum, item) => sum + parseFloat(item.priceAtTime) * item.quantity, 0);
    return { items, total };
  }
  async addToCart(userId, item) {
    let [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    if (!cart) {
      [cart] = await db.insert(carts).values({ userId }).returning();
    }
    const [existingItem] = await db.select().from(cartItems).where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, item.productId)));
    if (existingItem) {
      const [updatedItem] = await db.update(cartItems).set({
        quantity: existingItem.quantity + item.quantity,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(cartItems.id, existingItem.id)).returning();
      return updatedItem;
    } else {
      const [newItem] = await db.insert(cartItems).values({
        cartId: cart.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtTime: item.priceAtTime
      }).returning();
      return newItem;
    }
  }
  async updateCartItem(itemId, quantity, userId) {
    const [cartItem] = await db.select({ cartItem: cartItems, cart: carts }).from(cartItems).leftJoin(carts, eq(cartItems.cartId, carts.id)).where(and(eq(cartItems.id, itemId), eq(carts.userId, userId)));
    if (!cartItem) return void 0;
    const [updatedItem] = await db.update(cartItems).set({ quantity, updatedAt: /* @__PURE__ */ new Date() }).where(eq(cartItems.id, itemId)).returning();
    return updatedItem || void 0;
  }
  async removeFromCart(itemId, userId) {
    const [cartItem] = await db.select({ cartItem: cartItems, cart: carts }).from(cartItems).leftJoin(carts, eq(cartItems.cartId, carts.id)).where(and(eq(cartItems.id, itemId), eq(carts.userId, userId)));
    if (!cartItem) return false;
    const result = await db.delete(cartItems).where(eq(cartItems.id, itemId));
    return (result.rowCount ?? 0) > 0;
  }
  async clearCart(userId) {
    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    if (!cart) return true;
    const result = await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    return true;
  }
  generateBarcode() {
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
};
var storage = new DatabaseStorage();

// server/routes.ts
import multer from "multer";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
var upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
  // 5MB limit
});
async function registerRoutes(app2) {
  const requireAuth = async (req, res, next) => {
    const sessionId = req.headers.authorization?.replace("Bearer ", "");
    if (!sessionId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    try {
      const session = await storage.getSessionById(sessionId);
      if (!session || /* @__PURE__ */ new Date() > new Date(session.expiresAt)) {
        return res.status(401).json({ message: "Invalid or expired session" });
      }
      const user = await storage.getUserById(session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = user;
      req.session = session;
      next();
    } catch (error) {
      res.status(401).json({ message: "Authentication failed" });
    }
  };
  const requireAdmin = async (req, res, next) => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = signupSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await storage.createUser({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: "customer",
        isVerified: false,
        phone: userData.phone,
        address: userData.address
      });
      await storage.createCustomer({
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        address: user.address ? {
          street: user.address.street || "",
          city: user.address.city || "",
          emirate: user.address.emirate || "",
          zipCode: user.address.zipCode || ""
        } : null
      });
      const sessionId = randomUUID();
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      await storage.createSession({
        id: sessionId,
        userId: user.id,
        expiresAt
      });
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({
        user: userWithoutPassword,
        sessionId,
        message: "Account created successfully"
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(400).json({ message: "Invalid signup data", error });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const sessionId = randomUUID();
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      await storage.createSession({
        id: sessionId,
        userId: user.id,
        expiresAt
      });
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        sessionId,
        message: "Login successful"
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid login data", error });
    }
  });
  app2.post("/api/auth/logout", requireAuth, async (req, res) => {
    try {
      await storage.deleteSession(req.session.id);
      res.json({ message: "Logout successful" });
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
    }
  });
  app2.get("/api/auth/me", requireAuth, async (req, res) => {
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  });
  app2.get("/api/cart", requireAuth, async (req, res) => {
    try {
      const cart = await storage.getCartByUserId(req.user.id);
      res.json(cart || { items: [], total: 0 });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });
  app2.post("/api/cart/add", requireAuth, async (req, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (product.stock < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
      const cartItem = await storage.addToCart(req.user.id, {
        productId,
        quantity,
        priceAtTime: product.price
      });
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });
  app2.put("/api/cart/update/:itemId", requireAuth, async (req, res) => {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;
      if (quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }
      const updatedItem = await storage.updateCartItem(itemId, quantity, req.user.id);
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  app2.delete("/api/cart/remove/:itemId", requireAuth, async (req, res) => {
    try {
      const { itemId } = req.params;
      const success = await storage.removeFromCart(itemId, req.user.id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });
  app2.delete("/api/cart/clear", requireAuth, async (req, res) => {
    try {
      await storage.clearCart(req.user.id);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });
  app2.post("/api/checkout", requireAuth, async (req, res) => {
    try {
      const checkoutData = checkoutSchema.parse(req.body);
      const cart = await storage.getCartByUserId(req.user.id);
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      const subtotal = cart.items.reduce(
        (sum, item) => sum + parseFloat(item.priceAtTime) * item.quantity,
        0
      );
      const tax = subtotal * 0.05;
      const shipping = subtotal > 200 ? 0 : 25;
      const total = subtotal + tax + shipping;
      const order = await storage.createOrder({
        userId: req.user.id,
        customerName: req.user.name,
        customerEmail: req.user.email,
        customerPhone: req.user.phone,
        shippingAddress: checkoutData.shippingAddress,
        billingAddress: checkoutData.billingAddress || checkoutData.shippingAddress,
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        shipping: shipping.toString(),
        totalAmount: total.toString(),
        paymentMethod: checkoutData.paymentMethod,
        notes: checkoutData.notes,
        items: cart.items.map((item) => ({
          productId: item.productId,
          productName: item.productName || "",
          quantity: item.quantity,
          price: parseFloat(item.priceAtTime),
          total: parseFloat(item.priceAtTime) * item.quantity
        }))
      });
      for (const item of cart.items) {
        const product = await storage.getProductById(item.productId);
        if (product) {
          await storage.updateProductStock(
            item.productId,
            product.stock - item.quantity,
            `Order ${order.id}`
          );
        }
      }
      await storage.clearCart(req.user.id);
      const customer = await storage.getCustomerByEmail(req.user.email);
      if (customer) {
        await storage.updateCustomer(customer.id, {
          totalOrders: customer.totalOrders + 1,
          totalSpent: (parseFloat(customer.totalSpent) + total).toString(),
          lastOrderAt: /* @__PURE__ */ new Date()
        });
      }
      res.status(201).json({
        order,
        message: "Order placed successfully"
      });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ message: "Failed to process order", error });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      res.json(categories2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const { category, search } = req.query;
      let products2;
      if (search) {
        products2 = await storage.searchProducts(search);
      } else {
        products2 = await storage.getProducts(category);
      }
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  app2.post("/api/products", upload.array("images", 5), async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const imageUrls = [];
      const files = req.files;
      if (files && Array.isArray(files)) {
        files.forEach((file, index) => {
          imageUrls.push(`/uploads/${Date.now()}-${index}-${file.originalname}`);
        });
      }
      const product = await storage.createProduct({
        ...productData,
        images: imageUrls.length > 0 ? imageUrls : ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300"]
      });
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });
  app2.put("/api/products/:id", async (req, res) => {
    try {
      const updateData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, updateData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });
  app2.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  app2.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const reviews2 = await storage.getReviewsByProductId(req.params.id);
      res.json(reviews2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  app2.post("/api/products/:id/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        productId: req.params.id
      });
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data", error });
    }
  });
  app2.get("/api/orders", async (req, res) => {
    try {
      const orders2 = await storage.getOrders();
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data", error });
    }
  });
  app2.put("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  app2.get("/api/analytics/stats", async (req, res) => {
    try {
      const products2 = await storage.getProducts();
      const orders2 = await storage.getOrders();
      const customers2 = await storage.getCustomers();
      const lowStockProducts = await storage.getLowStockProducts(10);
      const totalProducts = products2.length;
      const todayOrders = orders2.filter((o) => {
        const today = /* @__PURE__ */ new Date();
        const orderDate = new Date(o.createdAt || /* @__PURE__ */ new Date());
        return orderDate.toDateString() === today.toDateString();
      }).length;
      const totalRevenue = orders2.filter((order) => order.status === "completed").reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
      const pendingOrders = orders2.filter((order) => order.status === "pending").length;
      const processingOrders = orders2.filter((order) => order.status === "processing").length;
      const completedOrders = orders2.filter((order) => order.status === "completed").length;
      const monthlyRevenue = orders2.filter((order) => {
        const orderDate = new Date(order.createdAt || /* @__PURE__ */ new Date());
        const now = /* @__PURE__ */ new Date();
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear() && order.status === "completed";
      }).reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
      res.json({
        totalProducts,
        lowStockProducts: lowStockProducts.length,
        totalOrders: orders2.length,
        totalCustomers: customers2.length,
        todayOrders,
        totalRevenue: totalRevenue.toFixed(2),
        monthlyRevenue: monthlyRevenue.toFixed(2),
        pendingOrders,
        processingOrders,
        completedOrders,
        recentOrders: orders2.slice(-5).reverse(),
        lowStockItems: lowStockProducts.slice(0, 5)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  app2.patch("/api/orders/:id/payment-status", async (req, res) => {
    try {
      const { paymentStatus } = req.body;
      if (!paymentStatus) {
        return res.status(400).json({ message: "Payment status is required" });
      }
      const order = await storage.updateOrderPaymentStatus(req.params.id, paymentStatus);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });
  app2.patch("/api/orders/:id/tracking", async (req, res) => {
    try {
      const { trackingNumber } = req.body;
      if (!trackingNumber) {
        return res.status(400).json({ message: "Tracking number is required" });
      }
      const order = await storage.updateOrderTracking(req.params.id, trackingNumber);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update tracking number" });
    }
  });
  app2.get("/api/customers", async (req, res) => {
    try {
      const customers2 = await storage.getCustomers();
      res.json(customers2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });
  app2.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomerById(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });
  app2.get("/api/inventory/logs", async (req, res) => {
    try {
      const { productId } = req.query;
      const logs = await storage.getInventoryLogs(productId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory logs" });
    }
  });
  app2.get("/api/inventory/low-stock", async (req, res) => {
    try {
      const threshold = parseInt(req.query.threshold) || 10;
      const products2 = await storage.getLowStockProducts(threshold);
      res.json(products2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });
  app2.post("/api/inventory/update-stock", async (req, res) => {
    try {
      const { productId, newStock, reason } = req.body;
      if (!productId || newStock === void 0) {
        return res.status(400).json({ message: "Product ID and new stock are required" });
      }
      const success = await storage.updateProductStock(productId, parseInt(newStock), reason);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Stock updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update stock" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/seed.ts
async function seedDatabase() {
  console.log("Starting database seeding...");
  try {
    await db.delete(reviews);
    await db.delete(products);
    await db.delete(categories);
    const categoriesData = [
      {
        id: "silk",
        name: "Silk",
        description: "Premium silk fabrics",
        imageUrl: "https://images.unsplash.com/photo-1582582621959-48d27397dc69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300"
      },
      {
        id: "cotton",
        name: "Cotton",
        description: "Natural cotton blends",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
      },
      {
        id: "wool",
        name: "Wool",
        description: "Cozy wool fabrics",
        imageUrl: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
      },
      {
        id: "synthetic",
        name: "Synthetic",
        description: "Modern synthetic blends",
        imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
      }
    ];
    await db.insert(categories).values(categoriesData);
    console.log("Categories inserted successfully");
    const productsData = [
      {
        id: "BL001",
        name: "Premium Blue Silk",
        description: "Luxurious blue silk fabric perfect for formal wear and special occasions. Made from 100% natural silk with exceptional drape and sheen.",
        price: "45.00",
        categoryId: "silk",
        stock: 156,
        images: [
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
          "https://images.unsplash.com/photo-1582582621959-48d27397dc69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=800"
        ],
        specifications: {
          material: "100% Natural Silk",
          width: "150cm",
          weight: "120 GSM",
          care: "Dry Clean Only"
        },
        barcode: "||||| |||| ||||",
        isActive: true
      },
      {
        id: "CT002",
        name: "Organic Red Cotton",
        description: "Premium organic cotton fabric in rich red color. Perfect for casual wear and home textiles.",
        price: "32.00",
        categoryId: "cotton",
        stock: 8,
        images: [
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800"
        ],
        specifications: {
          material: "100% Organic Cotton",
          width: "140cm",
          weight: "200 GSM",
          care: "Machine Wash Cold"
        },
        barcode: "|||| ||| |||||",
        isActive: true
      },
      {
        id: "WL003",
        name: "Merino Green Wool",
        description: "Premium merino wool fabric in forest green. Excellent for winter clothing and accessories.",
        price: "58.00",
        categoryId: "wool",
        stock: 43,
        images: [
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800"
        ],
        specifications: {
          material: "100% Merino Wool",
          width: "150cm",
          weight: "300 GSM",
          care: "Hand Wash Only"
        },
        barcode: "||| |||| ||||||",
        isActive: true
      },
      {
        id: "PL004",
        name: "Patterned Polyester",
        description: "Modern patterned polyester fabric with geometric designs. Great for contemporary fashion.",
        price: "28.00",
        categoryId: "synthetic",
        stock: 67,
        images: [
          "https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800"
        ],
        specifications: {
          material: "100% Polyester",
          width: "145cm",
          weight: "150 GSM",
          care: "Machine Wash Warm"
        },
        barcode: "|||| ||| |||| ||",
        isActive: true
      },
      {
        id: "SL005",
        name: "Golden Silk Dupioni",
        description: "Elegant golden silk dupioni with natural texture variations. Perfect for traditional and formal wear.",
        price: "65.00",
        categoryId: "silk",
        stock: 25,
        images: [
          "https://images.unsplash.com/photo-1582582621959-48d27397dc69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=800"
        ],
        specifications: {
          material: "100% Silk Dupioni",
          width: "140cm",
          weight: "140 GSM",
          care: "Dry Clean Only"
        },
        barcode: "||| || ||| ||||",
        isActive: true
      },
      {
        id: "CT006",
        name: "Egyptian Cotton White",
        description: "Premium Egyptian cotton in pure white. Superior quality and softness for luxury projects.",
        price: "42.00",
        categoryId: "cotton",
        stock: 85,
        images: [
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800"
        ],
        specifications: {
          material: "100% Egyptian Cotton",
          width: "150cm",
          weight: "180 GSM",
          care: "Machine Wash Cold"
        },
        barcode: "|||| || ||| |||",
        isActive: true
      }
    ];
    await db.insert(products).values(productsData);
    console.log("Products inserted successfully");
    const reviewsData = [
      {
        productId: "BL001",
        userName: "Fatima Al-Zahra",
        rating: 5,
        comment: "Absolutely beautiful fabric! The quality is exceptional and the color is exactly as shown. Used it for my daughter's wedding dress and it was perfect.",
        isVerified: true
      },
      {
        productId: "BL001",
        userName: "Mohammed Hassan",
        rating: 5,
        comment: "Great quality silk. Bought this for tailoring traditional garments. The fabric handles very well and the finish is professional grade.",
        isVerified: true
      },
      {
        productId: "CT002",
        userName: "Sara Ahmed",
        rating: 4,
        comment: "Good quality organic cotton. The color is vibrant and the fabric feels nice. Would recommend for casual projects.",
        isVerified: false
      },
      {
        productId: "WL003",
        userName: "Ahmed Al-Mansouri",
        rating: 5,
        comment: "Excellent merino wool! Perfect for winter garments. The green color is rich and beautiful.",
        isVerified: true
      },
      {
        productId: "SL005",
        userName: "Layla Rashid",
        rating: 5,
        comment: "This golden silk dupioni is absolutely stunning! Used it for a traditional dress and received so many compliments.",
        isVerified: true
      }
    ];
    await db.insert(reviews).values(reviewsData);
    console.log("Reviews inserted successfully");
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    await seedDatabase();
  } catch (error) {
    console.log("Database already seeded or error seeding:", error);
  }
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
