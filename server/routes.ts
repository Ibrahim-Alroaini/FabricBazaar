import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertReviewSchema, insertOrderSchema } from "@shared/schema";
import multer from "multer";

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
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
