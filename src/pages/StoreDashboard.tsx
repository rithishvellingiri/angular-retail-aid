import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, DollarSign, AlertTriangle, Users, TrendingUp, Warehouse } from 'lucide-react';
import { localStorageService, Product, Supplier } from '@/services/localStorageService';

export default function StoreDashboard() {
  const [stats, setStats] = useState<any>({});
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    localStorageService.initialize();
    const storeStats = localStorageService.getStats();
    setStats(storeStats);
    setLowStockProducts(storeStats.lowStockItems);
    setSuppliers(localStorageService.getSuppliers());
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Store Dashboard</h1>
          <p className="text-muted-foreground">Monitor your store's inventory and performance</p>
        </div>

        {lowStockProducts.length > 0 && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Low Stock Alert!</strong> {lowStockProducts.length} products have low stock (less than 10 items).
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.products || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Warehouse className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalStock || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalValue || 0)}</p>
                  <p className="text-sm text-muted-foreground">Inventory Value</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.lowStockProducts || 0}</p>
                  <p className="text-sm text-muted-foreground">Low Stock Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.orders || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.suppliers || 0}</p>
                  <p className="text-sm text-muted-foreground">Active Suppliers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="lowstock" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lowstock">Low Stock Products</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          </TabsList>

          <TabsContent value="lowstock">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <span>Low Stock Products</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">All products have sufficient stock!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lowStockProducts.map(product => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                          <p className="text-sm text-muted-foreground">Supplier: {product.supplier}</p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={product.stock < 5 ? "destructive" : "secondary"}
                            className="mb-2"
                          >
                            {product.stock} left
                          </Badge>
                          <p className="text-lg font-bold text-primary">{formatCurrency(product.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers">
            <Card>
              <CardHeader>
                <CardTitle>Suppliers Directory</CardTitle>
              </CardHeader>
              <CardContent>
                {suppliers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No suppliers found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suppliers.map(supplier => (
                      <div key={supplier.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-2">{supplier.name}</h3>
                        <div className="space-y-1 text-sm">
                          <p><strong>Email:</strong> {supplier.email}</p>
                          <p><strong>Phone:</strong> {supplier.phone}</p>
                          <p><strong>Address:</strong> {supplier.address}</p>
                          <p className="text-muted-foreground">
                            Joined: {new Date(supplier.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}