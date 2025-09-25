import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { localStorageService, Product, CartItem } from '@/services/localStorageService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function Products() {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    localStorageService.initialize();
    setProducts(localStorageService.getProducts());
    const cats = localStorageService.getCategories();
    setCategories(cats.map(c => c.name));
    
    if (user) {
      setCart(localStorageService.getCart(user.id));
    }
  }, [user]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });

  const getCartQuantity = (productId: string) => {
    const item = cart.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const updateCartQuantity = (productId: string, change: number) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart.",
        variant: "destructive",
      });
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const currentQuantity = getCartQuantity(productId);
    const newQuantity = Math.max(0, Math.min(currentQuantity + change, product.stock));

    const updatedCart = cart.filter(item => item.productId !== productId);
    if (newQuantity > 0) {
      updatedCart.push({ productId, quantity: newQuantity });
    }

    setCart(updatedCart);
    localStorageService.updateCart(user.id, updatedCart);

    if (change > 0) {
      toast({
        title: "Added to Cart",
        description: `${product.name} added to cart.`,
      });
    }
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Our Products</h1>
            <p className="text-muted-foreground">Discover our amazing collection</p>
          </div>
          
          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <div className="bg-card rounded-lg px-4 py-2 shadow-sm border">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <span className="font-medium">{getTotalItems()} items</span>
                  <span className="text-primary font-bold">₹{getTotalPrice()}</span>
                </div>
              </div>
              <Button asChild>
                <a href="/checkout">Checkout</a>
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{product.supplier}</p>
              </CardHeader>
              
              <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                  <Badge variant={product.stock < 10 ? "destructive" : "secondary"}>
                    Stock: {product.stock}
                  </Badge>
                </div>
              </CardContent>
              
              <CardFooter className="pt-3">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartQuantity(product.id, -1)}
                        disabled={getCartQuantity(product.id) === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{getCartQuantity(product.id)}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartQuantity(product.id, 1)}
                        disabled={getCartQuantity(product.id) >= product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => updateCartQuantity(product.id, 1)}
                      disabled={product.stock === 0 || getCartQuantity(product.id) >= product.stock}
                    >
                      Add to Cart
                    </Button>
                  </div>
                ) : (
                  <div className="w-full text-center">
                    <p className="text-sm text-muted-foreground mb-2">Login to purchase</p>
                    <Button asChild className="w-full">
                      <a href="/login">Login</a>
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}