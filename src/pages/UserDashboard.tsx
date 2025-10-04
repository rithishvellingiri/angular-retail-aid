import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Package, CreditCard, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  total: number;
  status: string;
  payment_status: string;
  payment_id?: string;
  created_at: string;
}

interface HistoryEntry {
  id: string;
  action: string;
  details: string;
  type: string;
  created_at: string;
}

interface Feedback {
  id: string;
  message: string;
  status: string;
  admin_response?: string;
  created_at: string;
}

export default function UserDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    loadData();
  }, [user, isAuthenticated]);

  const loadData = async () => {
    if (!user) return;

    try {
      // Load orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Load order items for each order
      if (ordersData && ordersData.length > 0) {
        const orderIds = ordersData.map(o => o.id);
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);
        
        if (itemsError) throw itemsError;
        
        // Group items by order_id
        const itemsByOrder: Record<string, OrderItem[]> = {};
        itemsData?.forEach(item => {
          if (!itemsByOrder[item.order_id]) {
            itemsByOrder[item.order_id] = [];
          }
          itemsByOrder[item.order_id].push(item);
        });
        setOrderItems(itemsByOrder);
      }

      // Load history
      const { data: historyData, error: historyError } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (historyError) throw historyError;
      setHistory(historyData || []);

      // Load feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (feedbackError) throw feedbackError;
      setFeedback(feedbackData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'pending': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome, {user!.username}</h1>
          <p className="text-muted-foreground">Manage your orders and track your purchase history</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">
                    ₹{orders.reduce((sum, order) => sum + order.total, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{feedback.length}</p>
                  <p className="text-sm text-muted-foreground">Feedback Given</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{history.length}</p>
                  <p className="text-sm text-muted-foreground">Activities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="feedback">My Feedback</TabsTrigger>
            <TabsTrigger value="history">Activity History</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold">Order #{order.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">₹{order.total}</p>
                            <div className="flex space-x-2 mt-1">
                              <Badge variant={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                              <Badge variant={getPaymentStatusColor(order.payment_status)}>
                                {order.payment_status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {(orderItems[order.id] || []).map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.product_name} × {item.quantity}</span>
                              <span>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        {order.payment_id && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Payment ID: {order.payment_id}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>My Feedback & Enquiries</CardTitle>
              </CardHeader>
              <CardContent>
                {feedback.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No feedback submitted yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedback.map(item => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant={item.status === 'replied' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.message}</p>
                        {item.admin_response && (
                          <div className="bg-muted p-3 rounded mt-3">
                            <p className="text-sm font-medium">Reply:</p>
                            <p className="text-sm">{item.admin_response}</p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No activity history found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map(entry => (
                      <div key={entry.id} className="border-l-4 border-primary pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{entry.action}</h3>
                            <p className="text-sm text-muted-foreground">{entry.details}</p>
                          </div>
                          <Badge variant="outline">{entry.type}</Badge>
                        </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(entry.created_at).toLocaleString()}
                          </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}