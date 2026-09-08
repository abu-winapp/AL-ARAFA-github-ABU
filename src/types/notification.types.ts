/**
 * Notification Types
 */

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export type NotificationType =
  | 'ORDER_STATUS'
  | 'ORDER_CANCELLED'
  | 'DELIVERY_TRACKING'
  | 'PAYMENT_CONFIRMED'
  | 'PROMOTION'
  | 'NEW_ITEM'
  | 'REMINDER'
  | 'BROADCAST';

export interface PushTokenRequest {
  token: string;
  platform: 'web' | 'ios' | 'android';
  deviceId: string;
}

export interface WebSocketNotification {
  type: string;
  title?: string;
  body?: string;
  timestamp: number;
  [key: string]: any;
}

export interface NotificationPermissionState {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
  supported: boolean;
}
