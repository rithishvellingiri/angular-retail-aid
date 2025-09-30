import { Order } from './localStorageService';
import { toast } from '@/hooks/use-toast';

export interface SMSMessage {
  to: string;
  message: string;
  timestamp: Date;
}

class SMSService {
  private messages: SMSMessage[] = [];

  /**
   * Simulates sending an SMS message
   * In production, this would integrate with an SMS gateway
   */
  async sendOrderConfirmation(mobile: string, order: Order, customerName: string): Promise<boolean> {
    try {
      const message = this.formatOrderMessage(order, customerName);
      
      // Simulate SMS sending
      this.messages.push({
        to: mobile,
        message,
        timestamp: new Date(),
      });

      console.log('📱 SMS Sent to:', mobile);
      console.log('Message:', message);

      // Show confirmation toast
      toast({
        title: "Order Confirmation Sent",
        description: `Order details sent to ${mobile}`,
      });

      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  private formatOrderMessage(order: Order, customerName: string): string {
    const itemsList = order.items
      .map(item => `${item.productName} x${item.quantity}`)
      .join(', ');

    return `Hi ${customerName}! Your order #${order.id.slice(0, 8)} has been confirmed.
Items: ${itemsList}
Total: ₹${order.total.toFixed(2)}
Payment: ${order.paymentStatus}
Thank you for shopping with us!`;
  }

  /**
   * Get all sent messages (for debugging/testing)
   */
  getSentMessages(): SMSMessage[] {
    return this.messages;
  }
}

export const smsService = new SMSService();
