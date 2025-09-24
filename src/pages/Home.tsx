import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageService } from '@/services/localStorageService';
import { 
  Store, 
  ShoppingBag, 
  Shield, 
  Zap, 
  Users, 
  Package, 
  Star,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';

export const Home: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const stats = localStorageService.getStats();
  const products = localStorageService.getProducts();
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-background/10" />
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-white">
              <Store className="mr-2 h-4 w-4" />
              Modern Inventory Management
            </div>
            
            <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl lg:text-7xl">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                SmartStore
              </span>
            </h1>
            
            <p className="mb-8 text-xl text-white/90 md:text-2xl">
              Your trusted departmental store for quality products at the best prices. 
              Experience seamless shopping with our modern inventory system.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              {!isAuthenticated ? (
                <>
                  <Button size="lg" variant="secondary" asChild className="group">
                    <Link to="/products">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Browse Products
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
                    <Link to="/register">
                      Get Started
                    </Link>
                  </Button>
                </>
              ) : isAdmin ? (
                <Button size="lg" variant="secondary" asChild className="group">
                  <Link to="/admin">
                    <Shield className="mr-2 h-5 w-5" />
                    Admin Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" variant="secondary" asChild className="group">
                  <Link to="/products">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Start Shopping
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Package className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">{stats.products}</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-success text-success-foreground">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">{stats.totalStock}</div>
                <div className="text-sm text-muted-foreground">Items in Stock</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-admin text-admin-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">{stats.users}</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-warning text-warning-foreground">
                  <Award className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">₹{Math.round(stats.totalValue / 1000)}K</div>
                <div className="text-sm text-muted-foreground">Inventory Value</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Featured Products</h2>
            <p className="text-lg text-muted-foreground">
              Discover our top-selling products with great quality and prices
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{product.category}</Badge>
                    <div className="flex items-center text-warning">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm">4.8</span>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-price">₹{product.price.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">
                        {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Limited Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <Button size="sm" asChild>
                      <Link to="/products">
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button size="lg" asChild>
              <Link to="/products">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-4 text-3xl font-bold">About SmartStore</h2>
              <p className="mb-6 text-lg text-muted-foreground">
                We are your neighborhood departmental store, committed to providing quality products 
                at competitive prices. With our modern inventory management system, we ensure that 
                you always find what you need.
              </p>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Fast Service</h3>
                    <p className="text-sm text-muted-foreground">Quick checkout and delivery</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success text-success-foreground">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Quality Products</h3>
                    <p className="text-sm text-muted-foreground">Carefully selected items</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Why Choose Us?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm">Competitive Prices</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-sm">Quality Assurance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-warning" />
                    <span className="text-sm">Customer Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-admin" />
                    <span className="text-sm">Secure Payments</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Our Promise</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We guarantee fresh products, fair prices, and exceptional customer service. 
                    Your satisfaction is our top priority.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};