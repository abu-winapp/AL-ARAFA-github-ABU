/**
 * Notification Panel Component
 * Displays list of notifications in a dropdown panel
 */

'use client';

import { FC } from 'react';
import { Bell, CheckCheck, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { cn } from '@/lib/utils';

interface NotificationPanelProps {
  onClose: () => void;
}

export const NotificationPanel: FC<NotificationPanelProps> = ({ onClose }) => {
  const {
    notifications,
    unreadCount,
    loading,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  // Calculate actual unread from notifications array
  const actualUnread = notifications?.filter(n => !n.isRead).length || 0;

  // Log mismatch if detected
  if (actualUnread !== unreadCount && notifications && notifications.length > 0) {
    console.warn('[NotificationPanel] Count mismatch:', {
      displayedCount: unreadCount,
      actualUnread,
      notifications
    });
  }

  return (
    <div className="w-[400px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchNotifications()}
            className="h-8 w-8"
            title="Refresh notifications"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMarkAllRead}
              className="h-8 w-8"
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-sm text-gray-500">Loading notifications...</div>
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 px-4 text-center">
            <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              No notifications yet
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              We'll notify you when something important happens
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications?.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications && notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            className="w-full text-sm text-primary hover:text-primary/80"
            onClick={onClose}
          >
            View all notifications
          </Button>
        </div>
      )}
    </div>
  );
};
