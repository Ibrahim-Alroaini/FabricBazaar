import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Package, TrendingDown, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product, InventoryLog } from "@shared/schema";

export default function InventoryPage() {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [stockUpdate, setStockUpdate] = useState({
    newStock: "",
    reason: ""
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products']
  });

  const { data: lowStockProducts = [] } = useQuery<Product[]>({
    queryKey: ['/api/inventory/low-stock']
  });

  const { data: inventoryLogs = [] } = useQuery<InventoryLog[]>({
    queryKey: ['/api/inventory/logs'],
    refetchInterval: 5000 // Auto-refresh every 5 seconds
  });

  const updateStockMutation = useMutation({
    mutationFn: async (data: { productId: string; newStock: number; reason: string }) => {
      const res = await fetch('/api/inventory/update-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update stock');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/stats'] });
      toast({ 
        title: "Success", 
        description: "Stock updated successfully" 
      });
      setStockUpdate({ newStock: "", reason: "" });
      setSelectedProduct("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive"
      });
    }
  });

  const handleUpdateStock = () => {
    if (!selectedProduct || !stockUpdate.newStock) {
      toast({
        title: "Error", 
        description: "Please select a product and enter stock quantity",
        variant: "destructive"
      });
      return;
    }

    updateStockMutation.mutate({
      productId: selectedProduct,
      newStock: parseInt(stockUpdate.newStock),
      reason: stockUpdate.reason || "Manual stock adjustment"
    });
  };

  const quickAdjustStock = (productId: string, currentStock: number, adjustment: number) => {
    const newStock = Math.max(0, currentStock + adjustment);
    updateStockMutation.mutate({
      productId,
      newStock,
      reason: adjustment > 0 ? `Added ${adjustment} units` : `Removed ${Math.abs(adjustment)} units`
    });
  };

  const getStockStatusBadge = (stock: number) => {
    if (stock <= 5) return <Badge variant="destructive">Critical</Badge>;
    if (stock <= 10) return <Badge variant="destructive">Low</Badge>;
    if (stock <= 20) return <Badge className="bg-yellow-500">Medium</Badge>;
    return <Badge className="bg-green-500">Good</Badge>;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
      </div>

      {/* Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Alert ({lowStockProducts.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm">{product.name}</h4>
                    <Badge variant="destructive">{product.stock} left</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{product.barcode}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => quickAdjustStock(product.id, product.stock, 10)}
                      disabled={updateStockMutation.isPending}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      +10
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => quickAdjustStock(product.id, product.stock, 25)}
                      disabled={updateStockMutation.isPending}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      +25
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stock Update Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Update Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - Current: {product.stock} units
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>New Stock Quantity</Label>
              <Input
                type="number"
                min="0"
                value={stockUpdate.newStock}
                onChange={(e) => setStockUpdate(prev => ({ ...prev, newStock: e.target.value }))}
                placeholder="Enter new stock quantity"
              />
            </div>

            <div>
              <Label>Reason (Optional)</Label>
              <Textarea
                value={stockUpdate.reason}
                onChange={(e) => setStockUpdate(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Reason for stock change..."
                rows={3}
              />
            </div>

            <Button 
              onClick={handleUpdateStock}
              disabled={updateStockMutation.isPending}
              className="w-full"
            >
              {updateStockMutation.isPending ? "Updating..." : "Update Stock"}
            </Button>
          </CardContent>
        </Card>

        {/* Current Stock Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Stock Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    <p className="text-xs text-gray-600">{product.barcode}</p>
                    <p className="text-xs text-gray-500">AED {product.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">{product.stock}</p>
                      <p className="text-xs text-gray-600">units</p>
                    </div>
                    {getStockStatusBadge(product.stock)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Inventory Changes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Inventory Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Product</th>
                  <th className="text-left p-2">Action</th>
                  <th className="text-left p-2">Quantity</th>
                  <th className="text-left p-2">Before</th>
                  <th className="text-left p-2">After</th>
                  <th className="text-left p-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {inventoryLogs.slice(0, 10).map((log) => {
                  const product = products.find(p => p.id === log.productId);
                  return (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{formatDate(log.createdAt || new Date())}</td>
                      <td className="p-2">{product?.name || log.productId}</td>
                      <td className="p-2">
                        <Badge 
                          variant={log.action === 'add' ? 'default' : log.action === 'remove' ? 'destructive' : 'secondary'}
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="p-2">{log.quantity}</td>
                      <td className="p-2">{log.previousStock}</td>
                      <td className="p-2">{log.newStock}</td>
                      <td className="p-2 max-w-xs truncate">{log.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {inventoryLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No inventory changes recorded yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}