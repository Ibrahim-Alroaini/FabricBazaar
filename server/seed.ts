import { db } from "./db";
import { categories, products, reviews } from "@shared/schema";

export async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    // Clear existing data
    await db.delete(reviews);
    await db.delete(products);
    await db.delete(categories);

    // Insert categories
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

    // Insert products
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

    // Insert reviews
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