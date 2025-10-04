import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { PaymentService } from '@/services/paymentService';
import PaymentSummary from '@/components/PaymentSummary';
import CartItemCard from '@/components/CartItemCard';
import PaymentModal from '@/components/PaymentModal';
import UPIPaymentModal from '@/components/UPIPaymentModal';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url?: string;
  description?: string;
  category_id?: string;
  supplier_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface CartItem {
  productId: string;
  quantity: number;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showUPIModal, setShowUPIModal] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadData();
  }, [user, isAuthenticated, authLoading, navigate]);

  const loadData = async () => {
    try {
      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');
      
      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Load cart
      if (user) {
        const { data: cartData, error: cartError } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id);
        
        if (cartError) throw cartError;
        setCart(cartData?.map(item => ({
          productId: item.product_id,
          quantity: item.quantity
        })) || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load cart data.",
        variant: "destructive",
      });
    }
  };

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

  const removeFromCart = async (productId: string) => {
    try {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user!.id)
        .eq('product_id', productId);
      
      const updatedCart = cart.filter(item => item.productId !== productId);
      setCart(updatedCart);
      
      toast({
        title: "Item Removed",
        description: "Item removed from cart.",
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
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

    try {
      await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('user_id', user!.id)
        .eq('product_id', productId);

      const updatedCart = cart.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      );
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity.",
        variant: "destructive",
      });
    }
  };

  const processOrder = async (paymentResponse: any) => {
    console.log('🔄 Processing order with payment response:', paymentResponse);
    try {
      const cartWithProducts = getCartWithProducts();
      const totalAmount = getTotalPrice();

      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user!.id,
          total: totalAmount,
          status: 'completed',
          payment_status: 'completed',
          payment_id: paymentResponse.razorpay_payment_id,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id
        })
        .select()
        .single();

      if (orderError) throw orderError;
      console.log('✅ Order created:', orderData);

      // Create order items
      const orderItems = cartWithProducts.map(item => ({
        order_id: orderData.id,
        product_id: item.productId,
        product_name: item.product!.name,
        quantity: item.quantity,
        price: item.product!.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;
      console.log('✅ Order items created');

      // Update stock for each product
      for (const item of cartWithProducts) {
        const product = item.product!;
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', item.productId);

        if (stockError) throw stockError;
      }
      console.log('✅ Stock updated');

      // Clear cart
      const { error: clearCartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user!.id);

      if (clearCartError) throw clearCartError;
      console.log('✅ Cart cleared');

      // Add to history
      const { error: historyError } = await supabase
        .from('history')
        .insert({
          user_id: user!.id,
          user_name: user!.username,
          action: 'Purchase Order',
          details: `Purchased ${orderItems.length} items for ${PaymentService.formatAmount(totalAmount)} - Payment ID: ${paymentResponse.razorpay_payment_id}`,
          type: 'purchase'
        });

      if (historyError) throw historyError;
      console.log('✅ History entry created');

      // Update local state
      setCart([]);
      await loadData(); // Reload products to show updated stock

      toast({
        title: "Order Completed!",
        description: "Your order has been placed successfully.",
      });

      setLoading(false);
    } catch (error) {
      console.error('Order processing error:', error);
      toast({
        title: "Order Processing Error",
        description: "Payment received but order processing failed. Please contact support.",
        variant: "destructive",
      });
      setLoading(false);
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
        onSuccess: async (response) => {
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
          try {
            await processOrder(response);
          } catch (error) {
            console.error('💰 Payment: Error in processOrder:', error);
            setLoading(false);
          }
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

  const handleUPIPaymentSuccess = async () => {
    console.log('🔵 Checkout: UPI payment success callback triggered');
    setShowUPIModal(false);
    setLoading(true);
    
    // Simulate successful UPI payment
    const mockResponse = {
      razorpay_payment_id: `upi_${Date.now()}`,
      razorpay_order_id: PaymentService.generateOrderId(),
    };
    
    console.log('🔵 Checkout: Mock payment response created:', mockResponse);
    console.log('🔵 Checkout: Calling processOrder...');
    
    try {
      await processOrder(mockResponse);
    } catch (error) {
      console.error('🔵 Checkout: Error in processOrder:', error);
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