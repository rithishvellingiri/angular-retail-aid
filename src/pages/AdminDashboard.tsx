import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Users, ShoppingCart, AlertTriangle, Plus, Edit, Trash2, History } from 'lucide-react';
import { localStorageService, Product, Category, Supplier, HistoryEntry, Order } from '@/services/localStorageService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import ProductForm from '@/components/ProductForm';
import CategoryForm from '@/components/CategoryForm';
import SupplierForm from '@/components/SupplierForm';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();

  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/';
      return;
    }

    localStorageService.initialize();
    loadData();
  }, [isAdmin]);

  const loadData = () => {
    const storeStats = localStorageService.getStats();
    setStats(storeStats);
    setProducts(localStorageService.getProducts());
    setCategories(localStorageService.getCategories());
    setSuppliers(localStorageService.getSuppliers());
    setHistory(localStorageService.getHistory());
    setLowStockProducts(storeStats.lowStockItems);
    setOrders(localStorageService.getOrders());
  };

  const deleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      localStorageService.deleteProduct(id);
      loadData();
      toast({
        title: "Product Deleted",
        description: "Product has been removed successfully.",
      });
    }
  };

  const deleteCategory = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      localStorageService.deleteCategory(id);
      loadData();
      toast({
        title: "Category Deleted",
        description: "Category has been removed successfully.",
      });
    }
  };

  const deleteSupplier = (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      localStorageService.deleteSupplier(id);
      loadData();
      toast({
        title: "Supplier Deleted",
        description: "Supplier has been removed successfully.",
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowSupplierForm(true);
  };

  const handleCloseProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(undefined);
  };

  const handleCloseCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(undefined);
  };

  const handleCloseSupplierForm = () => {
    setShowSupplierForm(false);
    setEditingSupplier(undefined);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your store's inventory and monitor all activities</p>
        </div>

        {lowStockProducts.length > 0 && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>⚠ Stock Alert!</strong> {lowStockProducts.length} products have low stock (less than 10 items). Please update inventory.
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
                  <p className="text-sm text-muted-foreground">Products</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.orders || 0}</p>
                  <p className="text-sm text-muted-foreground">Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.users || 0}</p>
                  <p className="text-sm text-muted-foreground">Users</p>
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
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="history">All History</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  All Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map(order => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold">Order #{order.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              User ID: {order.userId} • {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">₹{order.total}</p>
                            <div className="flex space-x-2 mt-1">
                              <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                                {order.status}
                              </Badge>
                              <Badge variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                                {order.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.productName} × {item.quantity}</span>
                              <span>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        {order.paymentId && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Payment ID: {order.paymentId}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Products</CardTitle>
                <Button onClick={() => setShowProductForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category} • {product.supplier}</p>
                        <p className="text-lg font-bold text-primary">₹{product.price}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant={product.stock < 10 ? "destructive" : "secondary"}>
                          Stock: {product.stock}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Categories</CardTitle>
                <Button onClick={() => setShowCategoryForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditCategory(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Suppliers</CardTitle>
                <Button onClick={() => setShowSupplierForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suppliers.map(supplier => (
                    <div key={supplier.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{supplier.name}</h3>
                        <p className="text-sm text-muted-foreground">{supplier.email} • {supplier.phone}</p>
                        <p className="text-sm text-muted-foreground">{supplier.address}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditSupplier(supplier)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteSupplier(supplier.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>All User Activities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No activity history found</p>
                    </div>
                  ) : (
                    history.slice(0, 50).map(entry => (
                      <div key={entry.id} className="border-l-4 border-primary pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{entry.action}</h3>
                            <p className="text-sm text-muted-foreground">{entry.details}</p>
                            <p className="text-sm text-muted-foreground">User: {entry.userName}</p>
                          </div>
                          <Badge variant="outline">{entry.type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Form Dialogs */}
      <ProductForm
        isOpen={showProductForm}
        onClose={handleCloseProductForm}
        product={editingProduct}
        onSave={loadData}
      />
      
      <CategoryForm
        isOpen={showCategoryForm}
        onClose={handleCloseCategoryForm}
        category={editingCategory}
        onSave={loadData}
      />
      
      <SupplierForm
        isOpen={showSupplierForm}
        onClose={handleCloseSupplierForm}
        supplier={editingSupplier}
        onSave={loadData}
      />
    </div>
  );
}