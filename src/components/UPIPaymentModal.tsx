import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, CheckCircle, Copy, QrCode } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentSuccess: () => void;
}

export default function UPIPaymentModal({ 
  isOpen, 
  onClose, 
  amount, 
  onPaymentSuccess 
}: UPIPaymentModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const merchantUPI = 'rithishvellingiri@oksbi';
  const merchantName = 'Rithish Vellingiri Store';

  useEffect(() => {
    if (isOpen && !paymentConfirmed) {
      generateQRCode();
    }
  }, [isOpen, amount, paymentConfirmed]);

  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    try {
      // Generate UPI payment URL
      const upiUrl = `upi://pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Payment to ${merchantName}`)}`;
      
      const qrDataUrl = await QRCode.toDataURL(upiUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "QR Code Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const copyUPIId = () => {
    navigator.clipboard.writeText(merchantUPI);
    toast({
      title: "Copied!",
      description: "UPI ID copied to clipboard",
    });
  };

  const handlePaymentSuccess = () => {
    console.log('🟢 UPI Modal: User clicked "I\'ve Completed Payment"');
    setPaymentConfirmed(true);
    console.log('🟢 UPI Modal: Payment confirmed state set, waiting 2 seconds...');
    setTimeout(() => {
      console.log('🟢 UPI Modal: Calling onPaymentSuccess callback');
      onPaymentSuccess();
      console.log('🟢 UPI Modal: Closing modal');
      onClose();
      setPaymentConfirmed(false);
    }, 2000);
  };

  const handleClose = () => {
    setPaymentConfirmed(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {paymentConfirmed ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Payment Confirmed
              </>
            ) : (
              <>
                <QrCode className="h-5 w-5" />
                UPI Payment
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {paymentConfirmed ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 p-6 rounded-lg">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Payment Successful!
              </h3>
              <p className="text-green-600">
                ₹{amount.toLocaleString()} has been received successfully.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Amount */}
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                ₹{amount.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Amount to Pay</p>
            </div>
            
            {/* QR Code */}
            <div className="text-center space-y-4">
              <div className="bg-white p-4 rounded-lg border mx-auto inline-block">
                {isGeneratingQR ? (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="UPI Payment QR Code" 
                    className="w-64 h-64"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-muted-foreground">
                    Failed to generate QR code
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Scan with any UPI app</p>
                <p className="text-xs text-muted-foreground">
                  PhonePe, GPay, Paytm, BHIM, or any UPI app
                </p>
              </div>
            </div>
            
            {/* UPI ID */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Pay to UPI ID:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyUPIId}
                  className="h-auto p-1"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="font-mono text-sm bg-background p-2 rounded border">
                {merchantUPI}
              </p>
              <p className="text-xs text-muted-foreground">
                {merchantName}
              </p>
            </div>
            
            {/* Instructions */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-medium text-blue-800">Payment Instructions:</p>
                  <ol className="text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Scan the QR code with any UPI app</li>
                    <li>Verify the amount: ₹{amount.toLocaleString()}</li>
                    <li>Complete the payment</li>
                    <li>Click "I've Paid" below after payment</li>
                  </ol>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handlePaymentSuccess}
                className="w-full"
                size="lg"
              >
                I've Completed the Payment
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleClose} 
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  variant="outline" 
                  onClick={generateQRCode}
                  className="flex-1"
                  disabled={isGeneratingQR}
                >
                  Refresh QR
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}