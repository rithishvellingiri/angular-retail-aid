declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentOptions {
  amount: number;
  currency: string;
  orderId?: string;
  customerInfo: {
    name: string;
    email: string;
    contact?: string;
  };
  onSuccess: (response: any) => void;
  onFailure?: (error: any) => void;
}

export class PaymentService {
  private static readonly RAZORPAY_KEY = 'rzp_test_9999999999999'; // Replace with your actual key
  private static readonly MERCHANT_NAME = 'Rithish Vellingiri Store';
  private static readonly MERCHANT_UPI = 'rithishvellingiri@oksbi';

  static async initializeRazorpay(): Promise<boolean> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  static async processPayment(options: PaymentOptions): Promise<void> {
    const razorpayLoaded = await this.initializeRazorpay();
    
    if (!razorpayLoaded) {
      throw new Error('Razorpay SDK failed to load');
    }

    const paymentOptions = {
      key: this.RAZORPAY_KEY,
      amount: options.amount * 100, // Amount in paise
      currency: options.currency,
      name: this.MERCHANT_NAME,
      description: 'Purchase from Departmental Store',
      image: '/placeholder.svg',
      order_id: options.orderId,
      handler: (response: any) => {
        // Payment successful - will be credited to merchant account
        options.onSuccess(response);
      },
      prefill: {
        name: options.customerInfo.name,
        email: options.customerInfo.email,
        contact: options.customerInfo.contact || '',
      },
      notes: {
        merchant_upi: this.MERCHANT_UPI,
        store_name: this.MERCHANT_NAME,
      },
      theme: {
        color: '#3B82F6',
      },
      modal: {
        ondismiss: () => {
          if (options.onFailure) {
            options.onFailure(new Error('Payment cancelled by user'));
          }
        },
      },
    };

    const razorpay = new window.Razorpay(paymentOptions);
    razorpay.open();
  }

  static generateOrderId(): string {
    return 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  static validatePaymentResponse(response: any): boolean {
    return !!(response.razorpay_payment_id && response.razorpay_order_id);
  }
}