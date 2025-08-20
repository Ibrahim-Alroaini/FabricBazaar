import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, Mail, Phone, MapPin, ShoppingCart } from "lucide-react";
import { useState } from "react";
import type { Customer, Order } from "@shared/schema";

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers']
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['/api/orders']
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCustomerOrders = (customerId: string) => {
    return orders.filter(order => order.customerEmail === customers.find(c => c.id === customerId)?.email);
  };

  const getCustomerTier = (totalSpent: string) => {
    const spent = parseFloat(totalSpent);
    if (spent >= 1000) return { label: "VIP", color: "bg-purple-500" };
    if (spent >= 500) return { label: "Gold", color: "bg-yellow-500" };
    if (spent >= 200) return { label: "Silver", color: "bg-gray-400" };
    return { label: "Bronze", color: "bg-orange-600" };
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: string) => {
    return `AED ${parseFloat(amount).toFixed(2)}`;
  };

  // Calculate customer stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => 
    c.lastOrderAt && new Date(c.lastOrderAt) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  ).length;
  const avgOrderValue = customers.length > 0 ? 
    customers.reduce((sum, c) => sum + (c.totalOrders > 0 ? parseFloat(c.totalSpent) / c.totalOrders : 0), 0) / customers.length 
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{totalCustomers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="w-5 h-5" />
              Active Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{activeCustomers}</p>
            <p className="text-sm text-gray-600">Last 90 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">AED {avgOrderValue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCustomers.map((customer) => {
          const tier = getCustomerTier(customer.totalSpent);
          const customerOrders = getCustomerOrders(customer.id);
          const lastOrder = customerOrders.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];

          return (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <p className="text-sm text-gray-600">Customer since {formatDate(customer.createdAt)}</p>
                  </div>
                  <Badge className={`${tier.color} text-white`}>
                    {tier.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{customer.address.city}, {customer.address.emirate}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{customer.totalOrders}</p>
                    <p className="text-xs text-gray-600">Total Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-xs text-gray-600">Total Spent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-purple-600">{formatDate(customer.lastOrderAt)}</p>
                    <p className="text-xs text-gray-600">Last Order</p>
                  </div>
                </div>

                {/* Last Order Details */}
                {lastOrder && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium">Latest Order</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-600">
                        {formatCurrency(lastOrder.totalAmount)}
                      </span>
                      <Badge 
                        variant={
                          lastOrder.status === 'completed' ? 'default' :
                          lastOrder.status === 'processing' ? 'secondary' :
                          'outline'
                        }
                      >
                        {lastOrder.status}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No customers found</h3>
            <p className="text-gray-500">
              {searchTerm ? "Try adjusting your search criteria" : "Customers will appear here once orders are placed"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}