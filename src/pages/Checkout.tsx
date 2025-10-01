import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { localStorageService, Product, CartItem, Order } from '@/services/localStorageService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { PaymentService } from '@/services/paymentService';
import { smsService } from '@/services/smsService';
import PaymentSummary from '@/components/PaymentSummary';
import CartItemCard from '@/components/CartItemCard';
import PaymentModal from '@/components/PaymentModal';
import UPIPaymentModal from '@/components/UPIPaymentModal';
import OrderSuccess from '@/components/OrderSuccess';

export default function Checkout() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Auto redirect to user dashboard after order completion
  useEffect(() => {
    if (completedOrder) {
      console.log('⏰ Starting 3 second countdown for redirect...', completedOrder);
      const timer = setTimeout(() => {
        console.log('🚀 Redirecting to user dashboard...');
        window.location.href = '/user-dashboard';
      }, 3000);
      
      return () => {
        console.log('⏹️ Clearing redirect timer');
        clearTimeout(timer);
      };
    }
  }, [completedOrder]);

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

  const processOrder = (paymentResponse: any) => {
    console.log('🔄 Processing order with payment response:', paymentResponse);
    try {
      const orderItems = getCartWithProducts().map(item => ({
        productId: item.productId,
        productName: item.product!.name,
        quantity: item.quantity,
        price: item.product!.price,
      }));

      const totalAmount = getTotalPrice();
      const newOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user!.id,
        items: orderItems,
        total: totalAmount,
        status: 'completed',
        paymentStatus: 'completed',
        paymentId: paymentResponse.razorpay_payment_id,
      };

      const order = localStorageService.addOrder(newOrder);

      // Update stock
      orderItems.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product && product.stock >= item.quantity) {
          localStorageService.updateProduct(item.productId, {
            stock: product.stock - item.quantity
          });
        }
      });

      // Update products state to reflect new stock levels
      setProducts(localStorageService.getProducts());

      // Add to history
      localStorageService.addHistoryEntry({
        userId: user!.id,
        userName: user!.username,
        action: 'Purchase Order',
        details: `Purchased ${orderItems.length} items for ${PaymentService.formatAmount(totalAmount)} - Payment ID: ${paymentResponse.razorpay_payment_id}`,
        type: 'purchase',
      });

      // Clear cart
      localStorageService.clearCart(user!.id);
      setCart([]);

      // Send SMS confirmation if mobile number is available
      if (user!.mobile) {
        smsService.sendOrderConfirmation(user!.mobile, order, user!.username);
      }

      // Show order success page instead of toast
      console.log('✅ Order completed successfully:', order);
      setCompletedOrder(order);
      console.log('📍 Completed order state set, should trigger redirect');
      setLoading(false);
    } catch (error) {
      console.error('Order processing error:', error);
      toast({
        title: "Order Processing Error",
        description: "Payment received but order processing failed. Please contact support.",
        variant: "destructive",
      });
    }
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

    // Validate stock before payment
    const cartWithProducts = getCartWithProducts();
    const stockIssues = cartWithProducts.filter(item => 
      item.quantity > item.product!.stock
    );

    if (stockIssues.length > 0) {
      const issueItems = stockIssues.map(item => item.product!.name).join(', ');
      toast({
        title: "Stock Issue",
        description: `Insufficient stock for: ${issueItems}. Please update quantities.`,
        variant: "destructive",
      });
      return;
    }

    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    setLoading(true);
    setShowPaymentModal(false);
    
    try {
      const totalAmount = getTotalPrice();
      const orderId = PaymentService.generateOrderId();
      
      console.log('Processing payment for amount:', totalAmount);
      
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
          console.log('💰 Payment success callback triggered:', response);
          if (!PaymentService.validatePaymentResponse(response)) {
            console.error('❌ Payment validation failed:', response);
            toast({
              title: "Payment Verification Failed",
              description: "Invalid payment response. Please contact support.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          processOrder(response);
        },
        onFailure: (error) => {
          console.error('Payment failure callback triggered:', error);
          toast({
            title: "Payment Failed",
            description: error.message || "Payment was not completed. Please try again.",
            variant: "destructive",
          });
          setLoading(false);
        }
      });
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment gateway. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleUPIPayment = () => {
    setShowPaymentModal(false);
    setShowUPIModal(true);
  };

  const handleUPIPaymentSuccess = () => {
    // Simulate successful UPI payment
    const mockResponse = {
      razorpay_payment_id: `upi_${Date.now()}`,
      razorpay_order_id: PaymentService.generateOrderId(),
    };
    
    processOrder(mockResponse);
    setShowUPIModal(false);
    setLoading(false);
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

  // Show order success page if order is completed
  if (completedOrder) {
    return (
      <OrderSuccess
        order={completedOrder}
        onContinueShopping={() => {
          setCompletedOrder(null);
          window.location.href = '/products';
        }}
        onViewDashboard={() => {
          setCompletedOrder(null);
          window.location.href = '/user-dashboard';
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.history.back()}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-foreground">Checkout</h1>
            <p className="text-muted-foreground">Review your items and complete your purchase</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Shopping Cart
                  {cartWithProducts.length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({cartWithProducts.length} items)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cartWithProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                    <p className="text-muted-foreground mb-4">
                      Looks like you haven't added any items to your cart yet.
                    </p>
                    <Button asChild>
                      <a href="/products">Browse Products</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartWithProducts.map(item => (
                      <CartItemCard
                        key={item.productId}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div>
            <PaymentSummary
              items={cartWithProducts}
              total={getTotalPrice()}
              onPay={handlePayment}
              loading={loading}
            />
          </div>
        </div>
        
        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={getTotalPrice()}
          onPayWithRazorpay={processPayment}
          onPayWithUPI={handleUPIPayment}
          loading={loading}
        />
        
        {/* UPI Payment Modal */}
        <UPIPaymentModal
          isOpen={showUPIModal}
          onClose={() => setShowUPIModal(false)}
          amount={getTotalPrice()}
          onPaymentSuccess={handleUPIPaymentSuccess}
        />
      </div>
    </div>
  );
}