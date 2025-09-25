import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingCart, User, LogOut, Shield, Store, Package } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            SmartStore
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Button
            variant={isActive('/') ? 'default' : 'ghost'}
            asChild
            size="sm"
          >
            <Link to="/">Home</Link>
          </Button>
          
          <Button
            variant={isActive('/products') ? 'default' : 'ghost'}
            asChild
            size="sm"
          >
            <Link to="/products">Products</Link>
          </Button>

          <Button
            variant={isActive('/store-dashboard') ? 'default' : 'ghost'}
            asChild
            size="sm"
          >
            <Link to="/store-dashboard">Store Info</Link>
          </Button>

          {isAuthenticated && !isAdmin && (
            <Button
              variant={isActive('/checkout') ? 'default' : 'ghost'}
              asChild
              size="sm"
            >
              <Link to="/checkout" className="relative">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
              </Link>
            </Button>
          )}

          {isAdmin && (
            <>
              <Button
                variant={isActive('/admin') ? 'default' : 'ghost'}
                asChild
                size="sm"
                className="text-admin"
              >
                <Link to="/admin">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
              <Button
                variant={isActive('/admin/products') ? 'default' : 'ghost'}
                asChild
                size="sm"
              >
                <Link to="/admin/products">
                  <Package className="h-4 w-4 mr-2" />
                  Manage
                </Link>
              </Button>
            </>
          )}
        </nav>

        {/* User Menu */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <User className="h-4 w-4 mr-2" />
                  {user?.username}
                  {isAdmin && (
                    <Badge className="ml-2 bg-admin text-admin-foreground">
                      Admin
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                
                {isAdmin ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/orders" className="cursor-pointer">
                        <Package className="h-4 w-4 mr-2" />
                        Orders
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/user-dashboard" className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        My Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/checkout" className="cursor-pointer">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        My Cart
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};