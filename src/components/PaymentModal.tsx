import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CreditCard, Smartphone, Wallet } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPayWithRazorpay: () => void;
  onPayWithUPI: () => void;
  loading: boolean;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  amount, 
  onPayWithRazorpay, 
  onPayWithUPI,
  loading 
}: PaymentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Amount */}
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              ₹{amount.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Total Amount</p>
          </div>
          
          {/* Payment Methods */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Choose Payment Method</h3>
            
            <Button
              onClick={onPayWithRazorpay}
              disabled={loading}
              className="w-full h-auto p-4 justify-start"
              variant="outline"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Credit/Debit Card</p>
                  <p className="text-xs text-muted-foreground">Via Razorpay</p>
                </div>
              </div>
            </Button>
            
            <Button
              onClick={onPayWithUPI}
              disabled={loading}
              className="w-full h-auto p-4 justify-start"
              variant="outline"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded">
                  <Smartphone className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">UPI / QR Code</p>
                  <p className="text-xs text-muted-foreground">PhonePe, GPay, Paytm</p>
                </div>
              </div>
            </Button>
            
            <Button
              onClick={onPayWithRazorpay}
              disabled={loading}
              className="w-full h-auto p-4 justify-start"
              variant="outline"
            >
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded">
                  <Wallet className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Net Banking</p>
                  <p className="text-xs text-muted-foreground">All major banks</p>
                </div>
              </div>
            </Button>
          </div>
          
          {/* Security note */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium">Secure Payment</p>
                <p className="text-muted-foreground">
                  Your payment will be processed securely by Razorpay. 
                  Amount will be credited to: rithishvellingiri@oksbi
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="w-full"
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}