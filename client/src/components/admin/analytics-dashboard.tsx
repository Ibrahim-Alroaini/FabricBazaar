import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, Users, DollarSign } from "lucide-react";
import { formatAED } from "@/lib/currency";
import type { Product } from "@shared/schema";

export default function AnalyticsDashboard() {
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Calculate analytics data
  const totalValue = products?.reduce((sum, product) => {
    return sum + (parseFloat(product.price) * product.stock);
  }, 0) || 0;

  const averagePrice = products?.length 
    ? products.reduce((sum, product) => sum + parseFloat(product.price), 0) / products.length
    : 0;

  const categoryDistribution = products?.reduce((acc, product) => {
    acc[product.categoryId] = (acc[product.categoryId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const topSellingCategories = Object.entries(categoryDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Total Inventory Value</h3>
                <p className="text-3xl font-bold">{formatAED(totalValue)}</p>
                <p className="text-blue-100 text-sm">Current stock value</p>
              </div>
              <DollarSign className="h-12 w-12 text-blue-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Average Price</h3>
                <p className="text-3xl font-bold">{formatAED(averagePrice)}</p>
                <p className="text-green-100 text-sm">Per meter average</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Total Products</h3>
                <p className="text-3xl font-bold">{products?.length || 0}</p>
                <p className="text-purple-100 text-sm">Active products</p>
              </div>
              <Package className="h-12 w-12 text-purple-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Products by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellingCategories.map(([category, count]) => {
                const percentage = products?.length ? (count / products.length) * 100 : 0;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="capitalize font-medium">{category}</span>
                      <span className="text-muted-foreground">{count} products</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Levels</CardTitle>
            <CardDescription>Inventory status overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products?.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">#{product.id}</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-medium ${
                      product.stock < 10 ? "text-red-600" : "text-green-600"
                    }`}>
                      {product.stock} meters
                    </span>
                    {product.stock < 10 && (
                      <p className="text-xs text-red-500">Low Stock</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Key business metrics and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Inventory Health</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                  {products?.filter(p => p.stock >= 50).length || 0} products well-stocked
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></div>
                  {products?.filter(p => p.stock >= 10 && p.stock < 50).length || 0} products medium stock
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                  {products?.filter(p => p.stock < 10).length || 0} products need restocking
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Price Analysis</h4>
              <div className="space-y-2 text-sm">
                <p>Highest Price: {formatAED(Math.max(...(products?.map(p => parseFloat(p.price)) || [0])))}</p>
                <p>Lowest Price: {formatAED(Math.min(...(products?.map(p => parseFloat(p.price)) || [0])))}</p>
                <p>Price Range: Wide variety to serve different market segments</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
