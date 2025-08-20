import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertReviewSchema, insertOrderSchema, loginSchema, signupSchema, checkoutSchema } from "@shared/schema";
import multer from "multer";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (!sessionId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const session = await storage.getSessionById(sessionId);
      if (!session || new Date() > new Date(session.expiresAt)) {
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
  
  const requireAdmin = async (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Authentication endpoints
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Create user
      const user = await storage.createUser({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: "customer",
        isVerified: false,
        phone: userData.phone,
        address: userData.address
      });
      
      // Create customer record
      await storage.createCustomer({
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      });
      
      // Create session
      const sessionId = randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session
      
      await storage.createSession({
        id: sessionId,
        userId: user.id,
        expiresAt
      });
      
      // Return user data (without password) and session
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ 
        user: userWithoutPassword, 
        sessionId,
        message: "Account created successfully" 
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(400).json({ message: "Invalid signup data", error });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Create session
      const sessionId = randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session
      
      await storage.createSession({
        id: sessionId,
        userId: user.id,
        expiresAt
      });
      
      // Return user data (without password) and session
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword, 
        sessionId,
        message: "Login successful" 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: "Invalid login data", error });
    }
  });
  
  app.post("/api/auth/logout", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteSession(req.session.id);
      res.json({ message: "Logout successful" });
    } catch (error) {
      res.status(500).json({ message: "Logout failed" });
    }
  });
  
  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  });

  // Shopping cart endpoints
  app.get("/api/cart", requireAuth, async (req: any, res) => {
    try {
      const cart = await storage.getCartByUserId(req.user.id);
      res.json(cart || { items: [], total: 0 });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });
  
  app.post("/api/cart/add", requireAuth, async (req: any, res) => {
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
      console.error('Add to cart error:', error);
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });
  
  app.put("/api/cart/update/:itemId", requireAuth, async (req: any, res) => {
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
  
  app.delete("/api/cart/remove/:itemId", requireAuth, async (req: any, res) => {
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
  
  app.delete("/api/cart/clear", requireAuth, async (req: any, res) => {
    try {
      await storage.clearCart(req.user.id);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Checkout endpoint
  app.post("/api/checkout", requireAuth, async (req: any, res) => {
    try {
      const checkoutData = checkoutSchema.parse(req.body);
      
      // Get user's cart
      const cart = await storage.getCartByUserId(req.user.id);
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate totals
      const subtotal = cart.items.reduce((sum, item) => 
        sum + (parseFloat(item.priceAtTime) * item.quantity), 0
      );
      const tax = subtotal * 0.05; // 5% VAT
      const shipping = subtotal > 200 ? 0 : 25; // Free shipping over AED 200
      const total = subtotal + tax + shipping;
      
      // Create order
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
        items: cart.items.map(item => ({
          productId: item.productId,
          productName: item.productName || '',
          quantity: item.quantity,
          price: parseFloat(item.priceAtTime),
          total: parseFloat(item.priceAtTime) * item.quantity
        }))
      });
      
      // Update product stock
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
      
      // Clear cart
      await storage.clearCart(req.user.id);
      
      // Update customer stats
      const customer = await storage.getCustomerByEmail(req.user.email);
      if (customer) {
        await storage.updateCustomer(customer.id, {
          totalOrders: customer.totalOrders + 1,
          totalSpent: (parseFloat(customer.totalSpent) + total).toString(),
          lastOrderAt: new Date()
        });
      }
      
      res.status(201).json({ 
        order, 
        message: "Order placed successfully" 
      });
    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({ message: "Failed to process order", error });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search } = req.query;
      let products;
      
      if (search) {
        products = await storage.searchProducts(search as string);
      } else {
        products = await storage.getProducts(category as string);
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
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

  app.post("/api/products", upload.array('images', 5), async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      // In a real app, you'd upload images to a storage service
      // For now, we'll use placeholder URLs
      const imageUrls: string[] = [];
      const files = req.files as Express.Multer.File[];
      if (files && Array.isArray(files)) {
        files.forEach((file: Express.Multer.File, index: number) => {
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

  app.put("/api/products/:id", async (req, res) => {
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

  app.delete("/api/products/:id", async (req, res) => {
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

  // Reviews
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByProductId(req.params.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/products/:id/reviews", async (req, res) => {
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

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data", error });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
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

  // Enhanced Analytics endpoints
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const products = await storage.getProducts();
      const orders = await storage.getOrders();
      const customers = await storage.getCustomers();
      const lowStockProducts = await storage.getLowStockProducts(10);
      
      const totalProducts = products.length;
      const todayOrders = orders.filter(o => {
        const today = new Date();
        const orderDate = new Date(o.createdAt || new Date());
        return orderDate.toDateString() === today.toDateString();
      }).length;
      
      const totalRevenue = orders
        .filter(order => order.status === "completed")
        .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
      
      const pendingOrders = orders.filter(order => order.status === "pending").length;
      const processingOrders = orders.filter(order => order.status === "processing").length;
      const completedOrders = orders.filter(order => order.status === "completed").length;
      
      const monthlyRevenue = orders
        .filter(order => {
          const orderDate = new Date(order.createdAt);
          const now = new Date();
          return orderDate.getMonth() === now.getMonth() && 
                 orderDate.getFullYear() === now.getFullYear() &&
                 order.status === "completed";
        })
        .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

      res.json({
        totalProducts,
        lowStockProducts: lowStockProducts.length,
        totalOrders: orders.length,
        totalCustomers: customers.length,
        todayOrders,
        totalRevenue: totalRevenue.toFixed(2),
        monthlyRevenue: monthlyRevenue.toFixed(2),
        pendingOrders,
        processingOrders,
        completedOrders,
        recentOrders: orders.slice(-5).reverse(),
        lowStockItems: lowStockProducts.slice(0, 5)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Enhanced order management endpoints
  app.patch("/api/orders/:id/payment-status", async (req, res) => {
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

  app.patch("/api/orders/:id/tracking", async (req, res) => {
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

  // Customers endpoints
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
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

  // Inventory management endpoints
  app.get("/api/inventory/logs", async (req, res) => {
    try {
      const { productId } = req.query;
      const logs = await storage.getInventoryLogs(productId as string);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory logs" });
    }
  });

  app.get("/api/inventory/low-stock", async (req, res) => {
    try {
      const threshold = parseInt(req.query.threshold as string) || 10;
      const products = await storage.getLowStockProducts(threshold);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });

  app.post("/api/inventory/update-stock", async (req, res) => {
    try {
      const { productId, newStock, reason } = req.body;
      
      if (!productId || newStock === undefined) {
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

  const httpServer = createServer(app);
  return httpServer;
}
