/**
 * Notifications Hook with WebSocket Integration
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import * as notificationService from '../api/notification.service';
import type { Notification, WebSocketNotification } from '@/types/notification.types';
import { useAuthStore } from '../store/useAuthStore';

const WS_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '/ws') || 'http://localhost:8080/ws';

export const useNotifications = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState<Client | null>(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (page: number = 0) => {
    if (!user) return;

    // try {
    //   setLoading(true);
    //   const notificationsData = await notificationService.getNotifications(page, 20);

    //   // Ensure we have an array
    //   const notifications = Array.isArray(notificationsData) ? notificationsData : [];

    //   setNotifications(notifications);

    //   // Sync unread count with actual notifications to avoid mismatch
    //   const actualUnreadCount = notifications.filter(n => !n.isRead).length;
    //   console.log('[Notifications] Fetched:', {
    //     total: notifications.length,
    //     unread: actualUnreadCount,
    //     notifications
    //   });

    //   // Update unread count to match actual unread notifications
    //   setUnreadCount(actualUnreadCount);
    // } catch (error) {
    //   console.error('Failed to fetch notifications:', error);
    //   // Reset to empty state on error
    //   setNotifications([]);
    //   setUnreadCount(0);
    // } finally {
    //   setLoading(false);
    // }
  }, [user]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const count = await notificationService.getUnreadCount();
      console.log('[Notifications] Unread count from API:', count);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  // Handle incoming WebSocket notification
  const handleWebSocketMessage = useCallback((message: WebSocketNotification) => {
    console.log('WebSocket notification received:', message);

    // Add to notifications list if it has title/body
    if (message.title && message.body) {
      const newNotification: Notification = {
        id: `temp-${Date.now()}`,
        userId: user?.id || '',
        type: message.type as any,
        title: message.title,
        body: message.body,
        data: message,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(message.title, {
          body: message.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: message.type,
          data: message,
        });
      }
    }

    // Refresh both notifications and count from server to ensure sync
    fetchNotifications();
  }, [user, fetchNotifications]);

  // Connect to WebSocket
  // useEffect(() => {
  //   if (!user) return;

  //   const stompClient = new Client({
  //     webSocketFactory: () => new SockJS(WS_URL),
  //     reconnectDelay: 5000,
  //     heartbeatIncoming: 4000,
  //     heartbeatOutgoing: 4000,
  //     debug: (str) => {
  //       if (process.env.NODE_ENV === 'development') {
  //         console.log('[WebSocket]', str);
  //       }
  //     },
  //   });

  //   stompClient.onConnect = () => {
  //     console.log('WebSocket connected');
  //     setIsConnected(true);

  //     // Subscribe to user's notification queue
  //     stompClient.subscribe(`/user/queue/notifications`, (message) => {
  //       try {
  //         const notification = JSON.parse(message.body);
  //         handleWebSocketMessage(notification);
  //       } catch (error) {
  //         console.error('Failed to parse WebSocket message:', error);
  //       }
  //     });

  //     // Subscribe to broadcast notifications
  //     stompClient.subscribe('/topic/customer-notifications', (message) => {
  //       try {
  //         const notification = JSON.parse(message.body);
  //         handleWebSocketMessage(notification);
  //       } catch (error) {
  //         console.error('Failed to parse broadcast message:', error);
  //       }
  //     });
  //   };

  //   stompClient.onDisconnect = () => {
  //     console.log('WebSocket disconnected');
  //     setIsConnected(false);
  //   };

  //   stompClient.onStompError = (frame) => {
  //     console.error('WebSocket error:', frame);
  //     setIsConnected(false);
  //   };

  //   stompClient.activate();
  //   setClient(stompClient);

  //   // Cleanup on unmount
  //   return () => {
  //     if (stompClient) {
  //       stompClient.deactivate();
  //     }
  //   };
  // }, [user, handleWebSocketMessage]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      // Fetch notifications first - it will sync the unread count
      fetchNotifications();
      // Also fetch count from API for comparison (debugging)
      fetchUnreadCount();
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isConnected,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  };
};
