import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Card,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import { useNotifications } from '../../context/NotificationContext';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../../lib/auth';
import { Link, useLocation } from 'wouter';
import { TrialExpiredModal } from '../trial-expired-modal';

interface NotificationBellProps {
  count?: number;
}

const NotificationBell: React.FC<NotificationBellProps> = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const [, setLocation] = useLocation();

  // Get current user data
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: getCurrentUser,
  });
  
  const user = userData?.user;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle special notification types
    if (notification.type === 'trial_expired' || notification.type === 'payment_failed') {
      setShowPaymentModal(true);
      setIsOpen(false);
    }
  };

  const handleQuickPay = (notification: any) => {
    setShowPaymentModal(true);
    setIsOpen(false);
    markAsRead(notification.id);
  };

  const handleViewBilling = () => {
    setLocation('/billing');
    setIsOpen(false);
  };

  const connectWebSocket = useCallback(() => {
    if (!user || wsRef.current?.readyState === WebSocket.CONNECTING) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setWsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Send authentication
        wsRef.current?.send(JSON.stringify({
          type: 'auth',
          userId: user.id
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification') {
            // Handle notification through context instead of local state
            console.log('Received notification:', data.notification);
          } else if (data.type === 'payment_success') {
            // Handle payment success notification
            console.log('Payment success:', data);
          }
        } catch (error) {
          // Silently handle parse errors
        }
      };

      wsRef.current.onclose = () => {
        setWsConnected(false);

        // Only attempt reconnection if under max attempts
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);

          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        }
      };

      wsRef.current.onerror = () => {
        setWsConnected(false);
      };

    } catch (error) {
      setWsConnected(false);
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    // This will be handled by the NotificationContext
    // No need to fetch manually here
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Try WebSocket connection first
    connectWebSocket();

    // Fallback to API polling if WebSocket fails
    const pollInterval = setInterval(() => {
      if (!wsConnected) {
        fetchNotifications();
      }
    }, 15000);

    // Initial fetch
    fetchNotifications();

    return () => {
      clearInterval(pollInterval);

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user, connectWebSocket, fetchNotifications, wsConnected]);

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500"
                variant="secondary"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card>
          <CardContent className="p-0">
            <div className="p-3 border-b">
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="max-h-[300px] overflow-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                  <p className="text-xs mt-1">You'll see updates about visits, reviews, and system activity here</p>
                </div>
              ) : (
                notifications.slice(0, 5).map(notification => (
                  <div 
                    key={notification.id}
                    className={`p-3 border-b hover:bg-slate-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <span className="text-xs text-gray-500">{formatTimeAgo(notification.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    
                    {/* Payment action buttons for trial/billing notifications */}
                    {(notification.type === 'trial_expired' || notification.type === 'payment_failed') && (
                      <div className="flex gap-2 mt-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleQuickPay(notification)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <CreditCard className="h-3 w-3 mr-1" />
                          Quick Pay
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleViewBilling}
                          className="text-xs"
                        >
                          View Plans
                        </Button>
                      </div>
                    )}
                    
                    {/* Success indicator for payment notifications */}
                    {notification.type === 'payment_success' && (
                      <div className="flex items-center mt-2">
                        <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-xs text-green-700 font-medium">Payment Completed</span>
                      </div>
                    )}
                    
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t p-2 flex justify-center">
            <Link href="/notifications">
              <Button variant="ghost" size="sm" className="w-full text-sm" onClick={() => setIsOpen(false)}>
                View All
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>

    {/* Quick Payment Modal */}
    <TrialExpiredModal 
      isOpen={showPaymentModal}
      onClose={() => setShowPaymentModal(false)}
      trialEndDate={user?.companyId ? new Date().toISOString() : undefined}
    />
    </>
  );
};

export default NotificationBell;