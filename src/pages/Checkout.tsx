import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Trash2, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { localStorageService, Product, CartItem, Order } from '@/services/localStorageService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { PaymentService } from '@/services/paymentService';

export default function Checkout() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Wait for auth to load before redirecting
    if (authLoading) return;
    
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    localStorageService.initialize();
    setProducts(localStorageService.getProducts());
    if (user) {
      setCart(localStorageService.getCart(user.id));
    }
  }, [user, isAuthenticated, authLoading]);

  const getCartWithProducts = () => {
    return cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return { ...item, product };
    }).filter(item => item.product);
  };

  const getTotalPrice = () => {
    return getCartWithProducts().reduce((sum, item) => 
      sum + (item.product!.price * item.quantity), 0
    );
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter(item => item.productId !== productId);
    setCart(updatedCart);
    localStorageService.updateCart(user!.id, updatedCart);
    toast({
      title: "Item Removed",
      description: "Item removed from cart.",
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQuantity > product.stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock} items available.`,
        variant: "destructive",
      });
      return;
    }

    const updatedCart = cart.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorageService.updateCart(user!.id, updatedCart);
  };

  const handlePayment = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const totalAmount = getTotalPrice();
      const orderId = PaymentService.generateOrderId();
      
      await PaymentService.processPayment({
        amount: totalAmount,
        currency: 'INR',
        orderId,
        customerInfo: {
          name: user!.username,
          email: user!.email,
          contact: '',
        },
        onSuccess: (response) => {
          // Validate payment response
          if (!PaymentService.validatePaymentResponse(response)) {
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support.",
              variant: "destructive",
            });
            return;
          }

          // Payment successful - Process order
          const orderItems = getCartWithProducts().map(item => ({
            productId: item.productId,
            productName: item.product!.name,
            quantity: item.quantity,
            price: item.product!.price,
          }));

          const newOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
            userId: user!.id,
            items: orderItems,
            total: totalAmount,
            status: 'completed',
            paymentStatus: 'completed',
            paymentId: response.razorpay_payment_id,
          };

          const order = localStorageService.addOrder(newOrder);

          // Update stock
          orderItems.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
              localStorageService.updateProduct(item.productId, {
                stock: product.stock - item.quantity
              });
            }
          });

          // Add to history
          localStorageService.addHistoryEntry({
            userId: user!.id,
            userName: user!.username,
            action: 'Purchase Order',
            details: `Purchased ${orderItems.length} items for ₹${totalAmount} - Payment ID: ${response.razorpay_payment_id}`,
            type: 'purchase',
          });

          // Clear cart
          localStorageService.clearCart(user!.id);
          setCart([]);

          toast({
            title: "Payment Successful!",
            description: `Order #${order.id} has been placed. Payment credited to merchant account.`,
          });

          // Redirect to success page
          setTimeout(() => {
            window.location.href = '/user-dashboard';
          }, 2000);
        },
        onFailure: (error) => {
          toast({
            title: "Payment Failed",
            description: error.message || "Payment was not completed.",
            variant: "destructive",
          });
        }
      });
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cartWithProducts = getCartWithProducts();

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shopping Cart</CardTitle>
              </CardHeader>
              <CardContent>
                {cartWithProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Your cart is empty</p>
                    <Button asChild className="mt-4">
                      <a href="/products">Continue Shopping</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartWithProducts.map(item => (
                      <div key={item.productId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.product!.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.product!.category}</p>
                          <p className="text-lg font-bold text-primary">₹{item.product!.price}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                              className="w-16 text-center border rounded px-2 py-1"
                              min="1"
                              max={item.product!.stock}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= item.product!.stock}
                            >
                              +
                            </Button>
                          </div>
                          <div className="w-20 text-right">
                            <p className="font-semibold">₹{item.product!.price * item.quantity}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Items ({cartWithProducts.length})</span>
                    <span>₹{getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{getTotalPrice()}</span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handlePayment}
                    disabled={loading || cartWithProducts.length === 0}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {loading ? 'Processing...' : 'Pay Securely'}
                  </Button>
                  
                  <div className="space-y-2 pt-4">
                    <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      <span>Secure payment powered by Razorpay</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                      <CheckCircle className="h-3 w-3" />
                      <span>Payment credited to: rithishvellingiri@oksbi</span>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs">
                        SSL Encrypted
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}