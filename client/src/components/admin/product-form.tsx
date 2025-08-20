import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Category, InsertProduct } from "@shared/schema";

interface ProductFormProps {
  onClose: () => void;
}

export default function ProductForm({ onClose }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stock: "",
    specifications: {
      material: "",
      width: "",
      weight: "",
      care: ""
    }
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const createProductMutation = useMutation({
    mutationFn: (productData: InsertProduct) =>
      apiRequest("POST", "/api/products", productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      toast({
        title: "Product Created",
        description: "Product has been created successfully with a unique barcode",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price || !formData.categoryId || !formData.stock) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate({
      name: formData.name,
      description: formData.description,
      price: formData.price,
      categoryId: formData.categoryId,
      stock: parseInt(formData.stock),
      specifications: formData.specifications,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300"], // Default image
      isActive: true,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Add New Product</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Price (AED) *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                placeholder="0"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Product Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter product description"
              rows={3}
              required
            />
          </div>

          {/* Specifications */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Material</label>
                <Input
                  value={formData.specifications.material}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specifications: { ...prev.specifications, material: e.target.value }
                  }))}
                  placeholder="e.g., 100% Cotton"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Width</label>
                <Input
                  value={formData.specifications.width}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specifications: { ...prev.specifications, width: e.target.value }
                  }))}
                  placeholder="e.g., 150cm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Weight</label>
                <Input
                  value={formData.specifications.weight}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specifications: { ...prev.specifications, weight: e.target.value }
                  }))}
                  placeholder="e.g., 200 GSM"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Care Instructions</label>
                <Input
                  value={formData.specifications.care}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    specifications: { ...prev.specifications, care: e.target.value }
                  }))}
                  placeholder="e.g., Machine Wash Cold"
                />
              </div>
            </div>
          </div>

          {/* Image Upload Placeholder */}
          <div>
            <label className="block text-sm font-medium mb-2">Product Images</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Drag and drop images here, or click to browse</p>
              <p className="text-sm text-gray-400 mt-1">A default image will be used for now</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProductMutation.isPending}
              className="bg-accent hover:bg-accent/90"
            >
              {createProductMutation.isPending ? "Creating..." : "Generate Barcode & Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
