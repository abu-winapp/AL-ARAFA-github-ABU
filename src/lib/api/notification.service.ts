/**
 * Notification API Service
 */

import apiClient, { apiRequest } from './client';
import type { Notification, PushTokenRequest } from '@/types/notification.types';

interface NotificationResponse {
  content: Notification[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

interface UnreadCountResponse {
  count: number;
}

/**
 * Get user's Notification with pagination
 */
export const getNotification = async (page: number = 0, size: number = 20): Promise<Notification[]> => {
  const response = await apiRequest<NotificationResponse>('GET', `/Notification?page=${page}&size=${size}`);
  return response.content || [];
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await apiRequest<UnreadCountResponse>('GET', '/Notification/unread');
  return response.count;
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId: string): Promise<void> => {
  await apiRequest('PUT', `/Notification/${notificationId}/read`);
};

/**
 * Mark all Notification as read
 */
export const markAllAsRead = async (): Promise<void> => {
  await apiRequest('PUT', '/Notification/read-all');
};

/**
 * Register push notification token
 */
export const registerPushToken = async (request: PushTokenRequest): Promise<void> => {
  await apiClient.post('/Notification/push-token', request);
};

/**
 * Remove push notification token
 */
export const removePushToken = async (deviceId: string): Promise<void> => {
  await apiClient.delete('/Notification/push-token', {
    data: { deviceId }
  });
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    throw new Error('Notification not supported');
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
};

/**
 * Check if Notification are supported
 */
export const isNotificationupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

export default {
  getNotification,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  registerPushToken,
  removePushToken,
  requestNotificationPermission,
  isNotificationupported,
};
