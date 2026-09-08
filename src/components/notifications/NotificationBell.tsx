/**
 * Notification Bell Component
 * Shows unread notification count and opens notification panel
 */

'use client';

import { FC, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NotificationPanel } from './NotificationPanel';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { cn } from '@/lib/utils';

export const NotificationBell: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, isConnected } = useNotifications();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection indicator */}
        {isConnected && (
          <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 border border-white rounded-full" />
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 z-50">
            <NotificationPanel onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
};
