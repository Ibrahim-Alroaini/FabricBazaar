import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, ShoppingCart, DollarSign, AlertTriangle, Plus, Download, Edit, Trash2, Eye, Users, TrendingUp, Activity } from "lucide-react";
import ProductForm from "@/components/admin/product-form";
import AnalyticsDashboard from "@/components/admin/analytics-dashboard";
import { useToast } from "@/hooks/use-toast";
import { formatAED } from "@/lib/currency";
import type { Product, Order, Customer } from "@shared/schema";

interface AnalyticsStats {
  totalProducts: number;
  lowStockProducts: number;
  totalOrders: number;
  totalCustomers: number;
  todayOrders: number;
  totalRevenue: string;
  monthlyRevenue: string;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  recentOrders: Order[];
  lowStockItems: Product[];
}

export default function Admin() {
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [orderStatusUpdate, setOrderStatusUpdate] = useState({ orderId: "", status: "" });
  const { toast } = useToast();

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<AnalyticsStats>({
    queryKey: ["/api/analytics/stats"],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update order status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      toast({ title: "Success", description: "Order status updated successfully" });
      setOrderStatusUpdate({ orderId: "", status: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update order status", variant: "destructive" });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      toast({ title: "Success", description: "Product deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    }
  });

  return (
    <div className="min-h-screen fabric-texture-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Admin Header */}
        <Card className="mb-10 border-2 border-luxury-gold/30 shadow-xl">
          <CardContent className="pt-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-inter font-bold text-luxury-copper mb-2">Admin Dashboard</h1>
                <p className="text-lg text-muted-foreground">Manage your luxury Alreef Fabric store</p>
              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={() => setShowProductForm(true)}
                  className="premium-button"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Product
                </Button>
                <Button variant="outline" className="border-luxury-gold text-luxury-copper hover:bg-luxury-gold/10">
                  <Download className="h-5 w-5 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-10">
          <Card className="admin-stats-card border-luxury-gold/30">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-4 luxury-gradient rounded-xl shadow-lg">
                  <Package className="h-7 w-7 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-3xl font-inter font-bold text-luxury-copper">
                    {statsLoading ? "..." : stats?.totalProducts || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="admin-stats-card border-luxury-emerald/30">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-4 emerald-gradient rounded-xl shadow-lg">
                  <ShoppingCart className="h-7 w-7 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-3xl font-inter font-bold text-luxury-emerald">
                    {statsLoading ? "..." : stats?.totalOrders || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="admin-stats-card border-luxury-royal/30">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-4 bg-luxury-royal rounded-xl shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Customers</p>
                  <p className="text-3xl font-inter font-bold text-luxury-royal">
                    {statsLoading ? "..." : stats?.totalCustomers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary">
                    {statsLoading ? "..." : formatAED(parseFloat(stats?.totalRevenue || "0"))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-primary">
                    {statsLoading ? "..." : formatAED(parseFloat(stats?.monthlyRevenue || "0"))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-primary">
                    {statsLoading ? "..." : stats?.lowStockProducts || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Card>
          <Tabs defaultValue="products" className="w-full">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">
                  <Activity className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="products">
                  <Package className="h-4 w-4 mr-2" />
                  Products
                </TabsTrigger>
                <TabsTrigger value="orders">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Orders
                </TabsTrigger>
                <TabsTrigger value="customers">
                  <Users className="h-4 w-4 mr-2" />
                  Customers
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="overview" className="space-y-6">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Order Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Pending</span>
                          <Badge variant="outline">{stats?.pendingOrders || 0}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Processing</span>
                          <Badge className="bg-yellow-500">{stats?.processingOrders || 0}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Completed</span>
                          <Badge className="bg-green-500">{stats?.completedOrders || 0}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Low Stock Alert</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {stats?.lowStockItems?.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex justify-between items-center">
                            <span className="text-sm truncate">{item.name}</span>
                            <Badge variant="destructive">{item.stock}</Badge>
                          </div>
                        )) || <p className="text-sm text-gray-500">All products in stock</p>}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {stats?.recentOrders?.slice(0, 3).map((order) => (
                          <div key={order.id} className="flex justify-between items-center">
                            <span className="text-sm">#{order.id.slice(0, 6)}</span>
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatAED(parseFloat(order.totalAmount))}</p>
                              <Badge 
                                variant={order.status === 'completed' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        )) || <p className="text-sm text-gray-500">No recent orders</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="products" className="space-y-6">
                {showProductForm && (
                  <ProductForm onClose={() => setShowProductForm(false)} />
                )}

                {/* Products Table */}
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Barcode
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products?.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={product.images[0] || ""}
                                alt={product.name}
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500">ID: {product.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {product.categoryId}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatAED(parseFloat(product.price))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={product.stock < 10 ? "text-red-600" : "text-gray-900"}>
                              {product.stock} meters
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="barcode-display">
                              {product.barcode}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>{product.name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <img 
                                        src={product.images[0] || ""} 
                                        alt={product.name}
                                        className="w-full h-48 object-cover rounded-lg"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <p><strong>Description:</strong> {product.description}</p>
                                      <p><strong>Price:</strong> {formatAED(parseFloat(product.price))}</p>
                                      <p><strong>Stock:</strong> {product.stock} meters</p>
                                      <p><strong>Category:</strong> {product.categoryId}</p>
                                      <p><strong>Barcode:</strong> {product.barcode}</p>
                                      <div><strong>Specifications:</strong>
                                        <ul className="text-sm text-gray-600 mt-1">
                                          {Object.entries(product.specifications).map(([key, value]) => (
                                            <li key={key}>{key}: {value}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setEditingProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this product?')) {
                                    deleteProductMutation.mutate(product.id);
                                  }
                                }}
                                disabled={deleteProductMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <AnalyticsDashboard />
              </TabsContent>

              <TabsContent value="orders" className="space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-inter font-bold text-luxury-copper">Order Management</h3>
                    <p className="text-muted-foreground mt-1">Monitor and manage customer orders</p>
                  </div>
                  <div className="flex space-x-3">
                    <Button variant="outline" className="border-luxury-gold text-luxury-copper hover:bg-luxury-gold/10">
                      <Download className="h-4 w-4 mr-2" />
                      Export Orders
                    </Button>
                    <Button className="premium-button">
                      <Activity className="h-4 w-4 mr-2" />
                      Live Orders
                    </Button>
                  </div>
                </div>
                
                <Card className="border-luxury-gold/20 shadow-lg">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-luxury-gold/10 to-luxury-copper/10">
                          <tr className="border-b border-luxury-gold/20">
                            <th className="px-6 py-4 text-left text-sm font-bold text-luxury-copper uppercase tracking-wider">
                              Order Details
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-luxury-copper uppercase tracking-wider">
                              Customer Info
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-luxury-copper uppercase tracking-wider">
                              Items & Amount
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-luxury-copper uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-luxury-copper uppercase tracking-wider">
                              Payment
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-luxury-copper uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-luxury-gold/10">
                          {orders?.map((order) => (
                            <tr key={order.id} className="hover:bg-luxury-gold/5 transition-colors">
                              <td className="px-6 py-6">
                                <div className="flex flex-col">
                                  <span className="text-lg font-inter font-bold text-luxury-copper">
                                    #{order.id.slice(0, 8)}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-AE') : 'N/A'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-6">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-foreground">{order.customerName}</span>
                                  <span className="text-sm text-muted-foreground">{order.customerEmail}</span>
                                  <span className="text-xs text-muted-foreground mt-1">
                                    {typeof order.shippingAddress === 'object' 
                                      ? `${order.shippingAddress.city}, ${order.shippingAddress.emirate}`
                                      : order.shippingAddress
                                    }
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-6">
                                <div className="flex flex-col">
                                  <span className="text-xs text-muted-foreground mb-1">
                                    {order.items ? `${order.items.length} items` : '0 items'}
                                  </span>
                                  <span className="text-xl font-inter font-bold aed-price">
                                    {formatAED(parseFloat(order.totalAmount))}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-6">
                                <Select 
                                  value={orderStatusUpdate.orderId === order.id ? orderStatusUpdate.status : order.status}
                                  onValueChange={(value) => {
                                    setOrderStatusUpdate({ orderId: order.id, status: value });
                                    updateOrderStatusMutation.mutate({ orderId: order.id, status: value });
                                  }}
                                >
                                  <SelectTrigger className="w-40 border-luxury-gold/30">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-6 py-6">
                                <Badge 
                                  className={`px-3 py-1 font-semibold ${
                                    order.paymentStatus === 'paid' 
                                      ? 'bg-luxury-emerald text-white' 
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {order.paymentStatus || 'pending'}
                                </Badge>
                              </td>
                              <td className="px-6 py-6 text-center">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="border-luxury-gold text-luxury-copper hover:bg-luxury-gold/10"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                </Button>
                              </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader className="border-b border-luxury-gold/20 pb-4">
                                      <DialogTitle className="text-2xl font-inter font-bold text-luxury-copper">
                                        Order #{order.id.slice(0, 8)}
                                      </DialogTitle>
                                    </DialogHeader>
                                    
                                    <div className="space-y-6 py-6">
                                      {/* Order Status Banner */}
                                      <div className="bg-gradient-to-r from-luxury-gold/10 to-luxury-copper/10 rounded-lg p-4 border border-luxury-gold/20">
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <p className="text-sm text-muted-foreground">Order Status</p>
                                            <p className="text-xl font-bold text-luxury-copper capitalize">{order.status}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm text-muted-foreground">Payment Status</p>
                                            <Badge className={`px-3 py-1 font-semibold ${order.paymentStatus === 'paid' ? 'bg-luxury-emerald text-white' : 'bg-muted text-muted-foreground'}`}>
                                              {order.paymentStatus || 'pending'}
                                            </Badge>
                                          </div>
                                          <div>
                                            <p className="text-sm text-muted-foreground">Total Amount</p>
                                            <p className="text-xl font-bold aed-price">{formatAED(parseFloat(order.totalAmount))}</p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Customer & Shipping Info */}
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <Card className="border-luxury-gold/30">
                                          <CardHeader>
                                            <CardTitle className="text-luxury-copper">Customer Information</CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-3">
                                            <div>
                                              <p className="text-sm text-muted-foreground">Name</p>
                                              <p className="font-semibold">{order.customerName}</p>
                                            </div>
                                            <div>
                                              <p className="text-sm text-muted-foreground">Email</p>
                                              <p className="font-mono text-sm">{order.customerEmail}</p>
                                            </div>
                                          </CardContent>
                                        </Card>

                                        <Card className="border-luxury-gold/30">
                                          <CardHeader>
                                            <CardTitle className="text-luxury-copper">Shipping Address</CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="text-sm leading-relaxed">
                                              {typeof order.shippingAddress === 'object' ? (
                                                <div className="space-y-1">
                                                  <p className="font-semibold">{order.shippingAddress.street}</p>
                                                  <p>{order.shippingAddress.city}, {order.shippingAddress.emirate}</p>
                                                  <p>{order.shippingAddress.zipCode}</p>
                                                </div>
                                              ) : (
                                                <p>{order.shippingAddress}</p>
                                              )}
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </div>

                                      {/* Order Items */}
                                      <Card className="border-luxury-gold/30">
                                        <CardHeader>
                                          <CardTitle className="text-luxury-copper">Order Items</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-3">
                                            {order.items?.map((item: any, index: number) => (
                                              <div key={index} className="flex justify-between items-center p-4 bg-luxury-gold/5 rounded-lg border border-luxury-gold/20">
                                                <div className="flex-1">
                                                  <p className="font-semibold text-foreground">{item.productId}</p>
                                                  <p className="text-sm text-muted-foreground">Product ID: {item.productId}</p>
                                                </div>
                                                <div className="text-center px-4">
                                                  <p className="text-sm text-muted-foreground">Quantity</p>
                                                  <p className="font-bold text-lg">{item.quantity || 1}</p>
                                                </div>
                                                <div className="text-right">
                                                  <p className="text-sm text-muted-foreground">Price</p>
                                                  <p className="font-bold aed-price">{formatAED(parseFloat(item.price || '0'))}</p>
                                                </div>
                                              </div>
                                            )) || (
                                              <p className="text-muted-foreground text-center py-4">No items found</p>
                                            )}
                                          </div>
                                        </CardContent>
                                      </Card>

                                      {/* Order Timeline */}
                                      {order.trackingNumber && (
                                        <Card className="border-luxury-gold/30">
                                          <CardHeader>
                                            <CardTitle className="text-luxury-copper">Tracking Information</CardTitle>
                                          </CardHeader>
                                          <CardContent>
                                            <div className="bg-luxury-gold/10 p-3 rounded-lg">
                                              <p className="font-mono text-lg font-bold text-luxury-copper">{order.trackingNumber}</p>
                                              <p className="text-sm text-muted-foreground">Tracking Number</p>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="customers" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Customer Management</h3>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Customers
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customers?.map((customer) => (
                    <Card key={customer.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{customer.name}</CardTitle>
                        <CardDescription>{customer.email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Orders:</span>
                            <span className="font-medium">{customer.totalOrders}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Spent:</span>
                            <span className="font-medium">{formatAED(parseFloat(customer.totalSpent))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Last Order:</span>
                            <span className="text-sm">
                              {customer.lastOrderAt ? new Date(customer.lastOrderAt).toLocaleDateString('en-AE') : 'Never'}
                            </span>
                          </div>
                          {customer.address && (
                            <div>
                              <span className="text-sm text-gray-600">Location:</span>
                              <p className="text-sm">{customer.address?.city}, {customer.address?.emirate}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )) || <p className="text-gray-500">No customers found</p>}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
        
        {/* Edit Product Dialog */}
        {editingProduct && (
          <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
              </DialogHeader>
              <ProductForm 
                product={editingProduct}
                onClose={() => setEditingProduct(null)} 
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
