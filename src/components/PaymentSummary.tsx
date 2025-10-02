import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, CheckCircle, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface CartItem {
  productId: string;
  quantity: number;
}

interface PaymentSummaryProps {
  items: (CartItem & { product: Product })[];
  total: number;
  onPay: () => void;
  loading: boolean;
}

export default function PaymentSummary({ items, total, onPay, loading }: PaymentSummaryProps) {
  const itemCount = items.length;
  const shippingCost = 0; // Free shipping
  const finalTotal = total + shippingCost;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Items breakdown */}
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.product.name} × {item.quantity}
                </span>
                <span>₹{(item.product.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          
          <Separator />
          
          {/* Summary totals */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal ({itemCount} items)</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes & Fees</span>
              <span>₹0</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>₹{finalTotal.toLocaleString()}</span>
          </div>
          
          {/* Payment button */}
          <Button
            className="w-full"
            onClick={onPay}
            disabled={loading || itemCount === 0}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Pay ₹{finalTotal.toLocaleString()}
              </>
            )}
          </Button>
          
          {/* Security indicators */}
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
                SSL Encrypted & PCI Compliant
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}