import { Link } from "wouter";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatAED } from "@/lib/currency";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const getBadgeVariant = (categoryId: string) => {
    switch (categoryId) {
      case "silk":
        return "PREMIUM";
      case "cotton":
        return "ORGANIC";
      case "wool":
        return "BESTSELLER";
      case "synthetic":
        return "NEW";
      default:
        return "FEATURED";
    }
  };

  const getBadgeColor = (categoryId: string) => {
    switch (categoryId) {
      case "silk":
        return "luxury-gradient";
      case "cotton":
        return "emerald-gradient";
      case "wool":
        return "bg-luxury-royal text-white";
      case "synthetic":
        return "bg-luxury-navy text-white";
      default:
        return "bg-luxury-copper text-white";
    }
  };

  return (
    <div className="fabric-card group">
      <Link href={`/product/${product.id}`}>
        <div className="relative overflow-hidden rounded-t-xl cursor-pointer">
          <img
            src={product.images[0] || ""}
            alt={product.name}
            className="fabric-card-image"
          />
          <div className="absolute top-4 right-4 bg-card dark:bg-card/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
            <Heart className="h-5 w-5 text-muted-foreground hover:text-luxury-copper cursor-pointer transition-colors" />
          </div>
          <div className={`absolute top-4 left-4 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg ${getBadgeColor(product.categoryId)}`}>
            {getBadgeVariant(product.categoryId)}
          </div>
        </div>
      </Link>
      
      <div className="p-6">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-inter font-bold text-xl mb-3 cursor-pointer hover:text-luxury-copper transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center mb-4">
          <div className="flex text-luxury-gold text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current review-star" />
            ))}
          </div>
          <span className="text-muted-foreground text-sm ml-2 font-medium">(24 reviews)</span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-3xl font-inter font-bold aed-price">
              {formatAED(parseFloat(product.price))}
            </span>
            <span className="text-sm text-muted-foreground font-medium">per meter</span>
          </div>
          <div className="text-xs text-muted-foreground bg-muted/20 px-2 py-1 rounded">
            <span className="font-mono">#{product.id}</span>
          </div>
        </div>
        
        <Button className="w-full premium-button font-semibold text-base py-3">
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
