/**
 * Notification Item Component
 * Individual notification card in the list
 */

'use client';

import { FC } from 'react';
import {
  Package,
  XCircle,
  Truck,
  CreditCard,
  Tag,
  Utensils,
  Bell,
  Clock,
} from 'lucide-react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import type { Notification, NotificationType } from '@/types/notification.types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
}

const getNotificationIcon = (type: NotificationType) => {
  const iconClass = "h-5 w-5";

  switch (type) {
    case 'ORDER_STATUS':
      return <Package className={cn(iconClass, "text-blue-500")} />;
    case 'ORDER_CANCELLED':
      return <XCircle className={cn(iconClass, "text-red-500")} />;
    case 'DELIVERY_TRACKING':
      return <Truck className={cn(iconClass, "text-green-500")} />;
    case 'PAYMENT_CONFIRMED':
      return <CreditCard className={cn(iconClass, "text-emerald-500")} />;
    case 'PROMOTION':
      return <Tag className={cn(iconClass, "text-orange-500")} />;
    case 'NEW_ITEM':
      return <Utensils className={cn(iconClass, "text-purple-500")} />;
    case 'REMINDER':
      return <Clock className={cn(iconClass, "text-amber-500")} />;
    default:
      return <Bell className={cn(iconClass, "text-gray-500")} />;
  }
};

const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case 'ORDER_STATUS':
      return 'bg-blue-50 dark:bg-blue-900/10';
    case 'ORDER_CANCELLED':
      return 'bg-red-50 dark:bg-red-900/10';
    case 'DELIVERY_TRACKING':
      return 'bg-green-50 dark:bg-green-900/10';
    case 'PAYMENT_CONFIRMED':
      return 'bg-emerald-50 dark:bg-emerald-900/10';
    case 'PROMOTION':
      return 'bg-orange-50 dark:bg-orange-900/10';
    case 'NEW_ITEM':
      return 'bg-purple-50 dark:bg-purple-900/10';
    case 'REMINDER':
      return 'bg-amber-50 dark:bg-amber-900/10';
    default:
      return 'bg-gray-50 dark:bg-gray-900/10';
  }
};

export const NotificationItem: FC<NotificationItemProps> = ({ notification }) => {
  const { markAsRead } = useNotifications();

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Handle navigation based on type
    if (notification.data?.orderNumber) {
      // Could navigate to order details
      console.log('Navigate to order:', notification.data.orderNumber);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50",
        !notification.isRead && "bg-blue-50/50 dark:bg-blue-900/20"
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
          getNotificationColor(notification.type)
        )}>
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className={cn(
              "text-sm font-medium text-gray-900 dark:text-white",
              !notification.isRead && "font-semibold"
            )}>
              {notification.title}
            </p>
            {!notification.isRead && (
              <span className="flex-shrink-0 h-2 w-2 bg-blue-500 rounded-full mt-1" />
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {notification.body}
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-500">
            {timeAgo}
          </p>
        </div>
      </div>
    </div>
  );
};
