/**
 * Al-Arafa Restaurant - Order Status Component
 */

'use client';

import { FC } from 'react';
import type { OrderStatus as OrderStatusType } from '@/types';
import clsx from 'clsx';

interface OrderStatusProps {
  status: OrderStatusType;
  vertical?: boolean;
  fulfillmentType?: 'delivery' | 'pickup';
}

const statusConfig = {
  pending: {
    label: 'Order Placed',
    color: 'text-status-pending',
    bg: 'bg-status-pending',
    icon: '📝',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-status-confirmed',
    bg: 'bg-status-confirmed',
    icon: '✅',
  },
  preparing: {
    label: 'Preparing',
    color: 'text-status-preparing',
    bg: 'bg-status-preparing',
    icon: '👨‍🍳',
  },
  ready: {
    label: 'Ready',
    color: 'text-status-ready',
    bg: 'bg-status-ready',
    icon: '🎯',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'text-status-out-for-delivery',
    bg: 'bg-status-out-for-delivery',
    icon: '🚗',
  },
  delivered: {
    label: 'Delivered',
    color: 'text-status-delivered',
    bg: 'bg-status-delivered',
    icon: '✨',
  },
  picked_up: {
    label: 'Picked Up',
    color: 'text-status-delivered',
    bg: 'bg-status-delivered',
    icon: '✨',
  },
  completed: {
    label: 'Completed',
    color: 'text-status-delivered',
    bg: 'bg-status-delivered',
    icon: '✅',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-status-cancelled',
    bg: 'bg-status-cancelled',
    icon: '❌',
  },
};

export const OrderStatus: FC<OrderStatusProps> = ({ status, vertical = false, fulfillmentType = 'delivery' }) => {
  const config = statusConfig[status];

  if (vertical) {
    // Define status flow based on fulfillment type
    const deliveryStatuses: OrderStatusType[] = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
    const pickupStatuses: OrderStatusType[] = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up'];

    // Use appropriate status flow
    const statuses = fulfillmentType === 'pickup' ? pickupStatuses : deliveryStatuses;

    // Handle cancelled and completed statuses
    let currentIndex = statuses.indexOf(status);

    // If status is 'completed', map it to the last status in the flow
    if (status === 'completed') {
      currentIndex = statuses.length - 1;
    }

    // If status is 'cancelled', show it separately
    if (status === 'cancelled') {
      return (
        <div className="space-y-4">
          {statuses.map((s, index) => {
            const sConfig = statusConfig[s];
            return (
              <div key={s} className="flex items-center gap-4 opacity-30">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-background-gray">
                  <span className="text-text-light text-xl">○</span>
                </div>
                <div className="flex-1">
                  <div className="text-base text-text-tertiary">
                    {sConfig.label}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-status-cancelled ring-4 ring-status-cancelled/20">
              {statusConfig.cancelled.icon}
            </div>
            <div className="flex-1 font-bold">
              <div className="text-base text-status-cancelled">
                {statusConfig.cancelled.label}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {statuses.map((s, index) => {
          const sConfig = statusConfig[s];
          const isCompleted = index <= currentIndex;
          const isCurrent = s === status || (status === 'completed' && index === statuses.length - 1);

          return (
            <div key={s} className="flex items-center gap-4">
              <div
                className={clsx(
                  'w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all',
                  isCompleted ? sConfig.bg : 'bg-background-gray',
                  isCurrent && 'ring-4 ring-primary/20 scale-110'
                )}
              >
                {isCompleted ? (
                  sConfig.icon
                ) : (
                  <span className="text-text-light text-xl">○</span>
                )}
              </div>
              <div className={clsx('flex-1', isCurrent ? 'font-bold' : 'opacity-50')}>
                <div className={clsx('text-base', isCompleted ? sConfig.color : 'text-text-tertiary')}>
                  {sConfig.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={clsx('inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold text-sm', config.bg)}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
};
