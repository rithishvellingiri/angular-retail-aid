import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Bot, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { localStorageService } from '@/services/localStorageService';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "Hello! 👋 Welcome to SmartStore! I'm here to help you with any questions about our products, services, or feedback. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Check if user has purchased products for feedback-related queries
    const checkUserPurchases = () => {
      if (!user) return [];
      localStorageService.initialize();
      const orders = localStorageService.getOrders().filter(order => 
        order.userId === user.id && order.status === 'completed'
      );
      return orders;
    };

    // Product feedback and reviews
    if (message.includes('feedback') || message.includes('review') || message.includes('complaint') || message.includes('suggestion')) {
      const userOrders = checkUserPurchases();
      
      if (userOrders.length > 0) {
        // User has purchased products
        const recentOrder = userOrders[userOrders.length - 1];
        const productNames = recentOrder.items.map(item => item.productName).join(', ');
        
        return `Thank you for your valuable feedback! 🙏 I can see you recently purchased: ${productNames}. Your experience matters greatly to us!\n\n✅ Your feedback has been recorded and will be forwarded to our product team\n✅ We'll use your input to improve our products and services\n✅ Our customer success team will review your comments within 24 hours\n\nIs there anything specific about your recent purchase you'd like to highlight? We're always looking to enhance our customer experience!`;
      } else {
        return "Thank you for your feedback! We value all customer input as it helps us improve our services. Your comments have been noted, and our team will review them to enhance your shopping experience. Feel free to browse our products and share your thoughts after making a purchase!";
      }
    }

    // Product quality or satisfaction queries
    if ((message.includes('quality') || message.includes('satisfied') || message.includes('happy') || message.includes('disappointed') || message.includes('excellent') || message.includes('poor') || message.includes('good') || message.includes('bad')) && (message.includes('product') || message.includes('purchase') || message.includes('bought') || message.includes('order'))) {
      const userOrders = checkUserPurchases();
      
      if (userOrders.length > 0) {
        return "Thank you for sharing your experience with our products! 😊 Your satisfaction is our top priority.\n\n📝 Your feedback has been automatically logged\n📞 Our quality assurance team will follow up if needed\n🔄 If you're not satisfied, we offer hassle-free returns within 30 days\n⭐ Consider leaving a detailed review to help other customers\n\nWould you like assistance with an exchange, return, or have specific suggestions for improvement?";
      } else {
        return "We appreciate your interest in product quality! While I don't see any recent purchases from your account, we're always committed to providing the best products. Feel free to share any questions about our quality standards or browse our highly-rated products!";
      }
    }
    
    // Product-related queries
    if (message.includes('product') || message.includes('item') || message.includes('what do you sell')) {
      return "We offer a wide range of products including electronics, clothing, home goods, and more! You can browse our complete catalog on the Products page. Is there a specific category you're interested in?";
    }
    
    // Pricing queries
    if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
      return "Our products are competitively priced! You can view detailed pricing on each product page. We also offer regular discounts and promotions. Check our Products section for current prices and deals.";
    }
    
    // Shipping queries
    if (message.includes('shipping') || message.includes('delivery') || message.includes('when will i get')) {
      return "We offer fast and reliable shipping! Standard delivery takes 3-5 business days, and express delivery is available for urgent orders. Shipping costs are calculated at checkout based on your location.";
    }
    
    // Payment queries
    if (message.includes('payment') || message.includes('pay') || message.includes('checkout')) {
      return "We accept secure payments through Razorpay, including credit/debit cards, net banking, UPI, and digital wallets. All transactions are encrypted and secure.";
    }
    
    // Return/Exchange queries
    if (message.includes('return') || message.includes('exchange') || message.includes('refund')) {
      return "We have a 30-day return policy for most items. Products should be in original condition with tags attached. Refunds are processed within 5-7 business days after we receive the returned item.";
    }
    
    // Support queries
    if (message.includes('help') || message.includes('support') || message.includes('problem') || message.includes('issue')) {
      return "I'm here to help! You can ask me about products, orders, shipping, payments, or any other questions. For urgent issues, you can also contact our support team through the contact information on our website.";
    }
    
    // Store information
    if (message.includes('about') || message.includes('company') || message.includes('store') || message.includes('who are you')) {
      return "SmartStore is your trusted online shopping destination! We're committed to providing quality products at great prices with excellent customer service. Our goal is to make your shopping experience smooth and enjoyable.";
    }
    
    // Greetings
    if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
      return "Hello! Great to have you here at SmartStore! 😊 I'm your virtual assistant. Feel free to ask me anything about our products, services, or if you need help with your shopping experience.";
    }
    
    // Thank you
    if (message.includes('thank') || message.includes('thanks')) {
      return "You're very welcome! 😊 Is there anything else I can help you with today? I'm always here to assist with your SmartStore experience!";
    }
    
    // Default response
    return "I understand you're asking about that! While I try to help with most questions, I might need a bit more context. Could you tell me more about what you're looking for? I can help with product information, orders, shipping, payments, and general store inquiries.";
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = getBotResponse(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          size="sm"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[500px] max-w-[90vw] max-h-[80vh]"
          >
            <Card className="h-full flex flex-col shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-primary text-primary-foreground rounded-t-lg">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  SmartStore Assistant
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {message.sender === 'bot' && (
                              <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            )}
                            {message.sender === 'user' && (
                              <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm">{message.text}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
                
                {/* Input Area */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1"
                      disabled={isTyping}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!input.trim() || isTyping}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;