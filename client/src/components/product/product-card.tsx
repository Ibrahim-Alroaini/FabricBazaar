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
        return "bg-accent text-accent-foreground";
      case "cotton":
        return "bg-green-500 text-white";
      case "wool":
        return "bg-blue-500 text-white";
      case "synthetic":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="fabric-card">
      <Link href={`/product/${product.id}`}>
        <div className="relative overflow-hidden rounded-t-xl cursor-pointer">
          <img
            src={product.images[0] || ""}
            alt={product.name}
            className="fabric-card-image"
          />
          <div className="absolute top-3 right-3 bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="h-4 w-4 text-muted hover:text-red-500 cursor-pointer" />
          </div>
          <div className={`absolute top-3 left-3 text-white text-xs font-semibold px-2 py-1 rounded ${getBadgeColor(product.categoryId)}`}>
            {getBadgeVariant(product.categoryId)}
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 cursor-pointer hover:text-accent">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-current" />
            ))}
          </div>
          <span className="text-muted text-sm ml-2">(24 reviews)</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold aed-price">
              {formatAED(parseFloat(product.price))}
            </span>
            <span className="text-sm text-muted">/meter</span>
          </div>
          <div className="text-xs text-muted">
            <span className="font-mono">#{product.id}</span>
          </div>
        </div>
        
        <Button className="w-full bg-primary hover:bg-primary/90">
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
