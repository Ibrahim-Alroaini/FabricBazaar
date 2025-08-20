import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Star, Heart, Plus, Minus, Barcode, ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ProductGallery from "@/components/product/product-gallery";
import ReviewSection from "@/components/review/review-section";
import { formatAED } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import type { Product, Review } from "@shared/schema";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ["/api/products", params?.id],
    enabled: !!params?.id,
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/products", params?.id, "reviews"],
    enabled: !!params?.id,
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive"
      });
      return;
    }
    
    if (!product) return;
    
    if (product.stock === 0) {
      toast({
        title: "Out of Stock",
        description: "This item is currently out of stock.",
        variant: "destructive"
      });
      return;
    }
    
    addToCart(product.id, quantity);
  };

  const averageRating = reviews?.length ? 
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  const ratingDistribution = reviews?.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>) || {};

  if (productLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Button onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button 
        variant="outline" 
        onClick={() => setLocation("/")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-inter font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(averageRating) ? "fill-current" : ""
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground ml-2">
                  ({reviews?.length || 0} reviews)
                </span>
              </div>
              <div className="text-muted-foreground">|</div>
              <div className="flex items-center text-green-600">
                <div className="h-2 w-2 bg-green-600 rounded-full mr-2"></div>
                <span className="text-sm">
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-4xl font-bold aed-price">
                {formatAED(parseFloat(product.price))}
              </span>
              <span className="text-muted-foreground">/meter</span>
              <Badge variant="secondary">PREMIUM</Badge>
            </div>

            {/* Barcode Display */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Product Code</h3>
                  <p className="text-muted-foreground text-sm">Scan for quick reorder</p>
                </div>
                <div className="text-right">
                  <div className="barcode-display">
                    <div className="font-mono text-xs">{product.barcode}</div>
                    <div className="text-xs text-center mt-1">#{product.id}</div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">{product.description}</p>

            {/* Product Specifications */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="bg-cream rounded-lg p-4">
                  <h4 className="font-semibold mb-2 capitalize">{key}</h4>
                  <p className="text-sm text-muted-foreground">{value}</p>
                </div>
              ))}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                <label className="text-sm font-medium mr-3">Quantity (meters):</label>
                <div className="flex items-center border border-gray-300 rounded">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-0 outline-none"
                    min="1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {!isAuthenticated 
                    ? "Sign In to Add to Cart" 
                    : product.stock === 0 
                    ? "Out of Stock" 
                    : "Add to Cart"}
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              
              {!isAuthenticated && (
                <p className="text-sm text-gray-600">
                  <Link to="/login" className="text-blue-600 hover:underline">
                    Sign in
                  </Link> or{' '}
                  <Link to="/signup" className="text-blue-600 hover:underline">
                    create an account
                  </Link> to add items to your cart.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reviews">Reviews ({reviews?.length || 0})</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="shipping">Shipping Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reviews" className="mt-8">
            <ReviewSection
              productId={product.id}
              reviews={reviews || []}
              averageRating={averageRating}
              ratingDistribution={ratingDistribution}
              isLoading={reviewsLoading}
            />
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-8">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Product Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b pb-2">
                    <span className="font-medium capitalize">{key}:</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Stock:</span>
                  <span className="text-muted-foreground">{product.stock} meters</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Product Code:</span>
                  <span className="text-muted-foreground">#{product.id}</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="shipping" className="mt-8">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Standard Delivery</h4>
                  <p className="text-muted-foreground text-sm">3-5 business days within UAE</p>
                  <p className="font-medium">Free for orders over AED 200</p>
                </div>
                <div>
                  <h4 className="font-medium">Express Delivery</h4>
                  <p className="text-muted-foreground text-sm">1-2 business days within UAE</p>
                  <p className="font-medium">AED 25 shipping fee</p>
                </div>
                <div>
                  <h4 className="font-medium">Returns</h4>
                  <p className="text-muted-foreground text-sm">30-day return policy for unused fabric</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
