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

interface PaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature?: string;
}

export class PaymentService {
  private static readonly RAZORPAY_KEY = 'rzp_test_1DP5mmOlF5G5ag'; // Valid test key
  private static readonly MERCHANT_NAME = 'Rithish Vellingiri Store';
  private static readonly MERCHANT_UPI = 'rithishvellingiri@oksbi';
  private static readonly TEST_MODE = true;

  static async initializeRazorpay(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('Razorpay SDK loaded successfully');
        resolve(true);
      };
      script.onerror = (error) => {
        console.error('Failed to load Razorpay SDK:', error);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  static async processPayment(options: PaymentOptions): Promise<void> {
    try {
      const razorpayLoaded = await this.initializeRazorpay();
      
      if (!razorpayLoaded) {
        throw new Error('Failed to load payment gateway. Please check your internet connection.');
      }

      if (!window.Razorpay) {
        throw new Error('Payment gateway not available. Please try again.');
      }

      // Validate amount
      if (options.amount <= 0) {
        throw new Error('Invalid payment amount');
      }

      // Generate order ID if not provided
      const orderId = options.orderId || this.generateOrderId();

      console.log('Initiating payment with amount:', options.amount, 'INR');

      const paymentOptions = {
        key: this.RAZORPAY_KEY,
        amount: Math.round(options.amount * 100), // Amount in paise, rounded to avoid decimal issues
        currency: options.currency || 'INR',
        name: this.MERCHANT_NAME,
        description: `Purchase from ${this.MERCHANT_NAME}`,
        image: '/placeholder.svg',
        order_id: orderId,
        handler: (response: PaymentResponse) => {
          console.log('Payment response received:', response);
          try {
            // Validate response before calling success
            if (this.validatePaymentResponse(response)) {
              console.log('Payment successful:', response.razorpay_payment_id);
              options.onSuccess(response);
            } else {
              console.error('Invalid payment response:', response);
              throw new Error('Invalid payment response received');
            }
          } catch (error) {
            console.error('Payment handler error:', error);
            if (options.onFailure) {
              options.onFailure(error);
            }
          }
        },
        prefill: {
          name: options.customerInfo.name || '',
          email: options.customerInfo.email || '',
          contact: options.customerInfo.contact || '',
        },
        notes: {
          merchant_upi: this.MERCHANT_UPI,
          store_name: this.MERCHANT_NAME,
          order_id: orderId,
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed by user');
            if (options.onFailure) {
              options.onFailure(new Error('Payment cancelled by user'));
            }
          },
          confirm_close: true,
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
      };

      const razorpay = new window.Razorpay(paymentOptions);
      
      // Add error handler for razorpay initialization
      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        if (options.onFailure) {
          options.onFailure(new Error(response.error.description || 'Payment failed'));
        }
      });

      razorpay.open();
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  static generateOrderId(): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    return `order_${timestamp}_${randomStr}`;
  }

  static validatePaymentResponse(response: PaymentResponse): boolean {
    return !!(
      response && 
      response.razorpay_payment_id && 
      response.razorpay_order_id &&
      typeof response.razorpay_payment_id === 'string' &&
      typeof response.razorpay_order_id === 'string' &&
      response.razorpay_payment_id.length > 0 &&
      response.razorpay_order_id.length > 0
    );
  }

  static formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  static getPaymentStatus(paymentId: string): 'completed' | 'pending' | 'failed' {
    // In a real app, this would make an API call to verify payment status
    // For demo purposes, we'll assume all payments with valid IDs are completed
    return paymentId && paymentId.startsWith('pay_') ? 'completed' : 'failed';
  }
}