import { 
  type Category, 
  type Product, 
  type Review, 
  type Order,
  type InsertCategory, 
  type InsertProduct, 
  type InsertReview, 
  type InsertOrder 
} from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export const storage = new MemStorage();
