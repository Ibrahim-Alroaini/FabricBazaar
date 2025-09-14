import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Filter, ShoppingCart, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category, Product } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState("name");

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);
      
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const sortedProducts = products?.sort((a, b) => {
    switch (sortBy) {
      case "price":
        return parseFloat(a.price) - parseFloat(b.price);
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen fabric-texture-bg">
      {/* Hero Section */}
      <section className="relative text-white">
        <div className="hero-overlay"></div>
        <div 
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&h=800')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
          className="h-[20rem] sm:h-[24rem] lg:h-[28rem] flex items-center relative"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-inter font-bold mb-4 sm:mb-6 leading-tight">
                Premium Fabrics Collection
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 lg:mb-10 text-gray-100 leading-relaxed">
                Discover luxury textiles crafted with excellence for your creative vision
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button size="lg" className="premium-button text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 touch-manipulation">
                  Explore Collection
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-luxury-navy bg-transparent text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 touch-manipulation">
                  View Catalog
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-card dark:bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-inter font-bold text-foreground mb-3 sm:mb-4 px-4">Browse by Category</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Explore our curated collection of premium fabrics, each category offering unique textures and qualities
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categoriesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))
            ) : (
              categories?.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id === selectedCategory ? "all" : category.id)}
                  className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
                >
                  <div className="fabric-card-premium relative overflow-hidden h-64">
                    <img
                      src={category.imageUrl || ""}
                      alt={category.name}
                      className="fabric-card-image h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy/80 via-luxury-navy/30 to-transparent group-hover:from-luxury-copper/80 transition-all duration-300"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                      <span className="category-badge mb-2 block w-fit">Premium</span>
                      <h3 className="text-2xl font-inter font-bold mb-2">{category.name}</h3>
                      <p className="text-sm text-gray-200 leading-relaxed">{category.description}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-background dark:bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 sm:mb-16 gap-6">
            <div className="px-4 lg:px-0">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-inter font-bold text-foreground mb-3 sm:mb-4">Featured Products</h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Handpicked selection of our finest fabrics
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto px-4 lg:px-0">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search luxury fabrics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-luxury-gold/30 focus:border-luxury-copper bg-input text-foreground touch-manipulation"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48 h-12 border-luxury-gold/30 focus:border-luxury-copper touch-manipulation">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48 h-12 border-luxury-gold/30 focus:border-luxury-copper touch-manipulation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="price">Sort by Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productsLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="fabric-card">
                  <Skeleton className="h-48 rounded-t-xl" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))
            ) : sortedProducts?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              </div>
            ) : (
              sortedProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
