/**
 * Al-Arafa Restaurant - Admin Order Detail Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { ChevronLeft } from 'lucide-react';
import type { Order, OrderStatus as OrderStatusType } from '@/types';
import * as adminService from '@/lib/api/admin.service';
import { useAuthStore } from '@/lib/store/useAuthStore';

const validTransitions: Record<OrderStatusType, OrderStatusType[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['out_for_delivery', 'picked_up'],
  out_for_delivery: ['delivered'],
  delivered: [],
  picked_up: [],
  completed: [],
  cancelled: [],
};

const getValidNextStatuses = (order: Order): OrderStatusType[] => {
  let validNext = validTransitions[order.status] || [];
  if (order.fulfillmentType === 'pickup') {
    validNext = validNext.filter((s) => s !== 'out_for_delivery');
  } else {
    validNext = validNext.filter((s) => s !== 'picked_up');
  }
  return validNext;
};

const getStatusConfig = (status: OrderStatusType) => {
  const configs: Record<OrderStatusType, { label: string; color: string; icon: string }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '📝' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: '✅' },
    preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-800', icon: '👨‍🍳' },
    ready: { label: 'Ready', color: 'bg-purple-100 text-purple-800', icon: '🎯' },
    out_for_delivery: { label: 'Out for Delivery', color: 'bg-indigo-100 text-indigo-800', icon: '🚗' },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: '✅' },
    picked_up: { label: 'Picked Up', color: 'bg-green-100 text-green-800', icon: '✅' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: '✅' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' },
  };
  return configs[status] || configs.pending;
};

const actionLabels: Record<string, string> = {
  confirmed: 'Confirm Order',
  preparing: 'Start Preparing',
  ready: 'Mark as Ready',
  out_for_delivery: 'Send Out for Delivery',
  delivered: 'Mark as Delivered',
  picked_up: 'Mark as Picked Up',
  cancelled: 'Cancel Order',
};

const formatStatusLabel = (status: string): string =>
  actionLabels[status] ??
  status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, user, isInitialized } = useAuthStore();

  const loadOrder = async () => {
    try {
      const data = await adminService.getAdminOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError('Failed to load order.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated || user?.userType !== 'admin') {
      router.push('/admin/login');
      return;
    }
    loadOrder();
  }, [isAuthenticated, user, isInitialized, orderId]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;
    try {
      setIsUpdating(true);
      const updated = await adminService.updateOrderStatus(order.id, newStatus);
      setOrder(updated);
      toast.success(`Order status updated to ${formatStatusLabel(newStatus)}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/admin/orders" className="inline-flex items-center text-text-secondary hover:text-primary mb-6">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Orders
        </Link>
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-error text-lg">{error || 'Order not found.'}</p>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const nextStatuses = getValidNextStatuses(order);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back */}
      <Link href="/admin/orders" className="inline-flex items-center text-text-secondary hover:text-primary mb-6">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Orders
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Order #{order.orderNumber}</h1>
            <p className="text-text-tertiary text-sm mt-1">
              {format(new Date(order.createdAt), 'MMM dd, yyyy h:mm a')}
            </p>
          </div>
          <Badge variant="secondary" className={`${statusConfig.color} text-sm font-medium px-3 py-1`}>
            <span className="mr-1">{statusConfig.icon}</span>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Status Actions */}
        {nextStatuses.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium text-text-secondary mb-1">What would you like to do with this order?</p>
            <p className="text-xs text-text-tertiary mb-3">Updating the status will notify the customer.</p>
            <div className="flex gap-2 flex-wrap">
              {nextStatuses.map((s) => (
                <Button
                  key={s}
                  onClick={() => handleUpdateStatus(s)}
                  disabled={isUpdating}
                  size="sm"
                  variant="outline"
                  className={
                    s === 'cancelled'
                      ? 'border-error text-error hover:bg-error hover:text-white'
                      : 'border-primary text-primary hover:bg-primary hover:text-white'
                  }
                >
                  {formatStatusLabel(s)}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Customer Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="font-semibold text-text-primary mb-3">Customer</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-text-tertiary">Name:</span>
              <div className="font-medium">{order.user?.fullName || order.contactName || 'N/A'}</div>
            </div>
            <div>
              <span className="text-text-tertiary">Phone:</span>
              <div className="font-medium">{order.user?.phone || order.contactPhone || 'N/A'}</div>
            </div>
            {order.user?.email && (
              <div>
                <span className="text-text-tertiary">Email:</span>
                <div className="font-medium">{order.user.email}</div>
              </div>
            )}
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="font-semibold text-text-primary mb-3">Order Info</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-text-tertiary">Type:</span>
              <div className="font-medium capitalize">
                {order.orderType === 'catering' ? 'Catering' : 'Instant'}
              </div>
            </div>
            <div>
              <span className="text-text-tertiary">Fulfillment:</span>
              <div className="font-medium capitalize">{order.fulfillmentType}</div>
            </div>
            <div>
              <span className="text-text-tertiary">Location:</span>
              <div className="font-medium">{order.location?.name || order.locationName || 'N/A'}</div>
            </div>
            {order.scheduledFor && (
              <div>
                <span className="text-text-tertiary">Scheduled For:</span>
                <div className="font-medium">
                  {format(new Date(order.scheduledFor), 'MMM dd, yyyy h:mm a')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      {order.fulfillmentType === 'delivery' && order.deliveryAddress && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="font-semibold text-text-primary mb-3">Delivery Address</h2>
          <p className="text-text-primary">{order.deliveryAddress.addressLine1}</p>
          {order.deliveryAddress.addressLine2 && (
            <p className="text-text-primary">{order.deliveryAddress.addressLine2}</p>
          )}
          <p className="text-text-secondary text-sm mt-1">{order.deliveryAddress.postalCode}</p>
          {order.deliveryInstructions && (
            <p className="text-text-tertiary text-sm mt-2 italic">{order.deliveryInstructions}</p>
          )}
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="font-semibold text-text-primary mb-3">Items</h2>
        <div className="border rounded-lg divide-y">
          {order.items.map((item) => {
            const itemName = item.itemName || item.menuItem?.name || 'Item';
            return (
              <div key={item.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-text-primary">
                    {item.quantity}x {itemName}
                  </div>
                  {item.specialInstructions && (
                    <div className="text-xs text-text-tertiary italic mt-1">
                      {item.specialInstructions}
                    </div>
                  )}
                </div>
                <div className="font-medium text-text-primary ml-4">
                  S$ {item.subtotal.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="font-semibold text-text-primary mb-3">Pricing</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Subtotal:</span>
            <span>S$ {order.subtotal.toFixed(2)}</span>
          </div>
          {order.deliveryFee > 0 && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Delivery Fee:</span>
              <span>S$ {order.deliveryFee.toFixed(2)}</span>
            </div>
          )}
          {order.gstAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-text-secondary">GST:</span>
              <span>S$ {order.gstAmount.toFixed(2)}</span>
            </div>
          )}
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount:</span>
              <span>-S$ {order.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t font-semibold text-base">
            <span className="text-text-primary">Total:</span>
            <span className="text-primary">S$ {order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment */}
      {order.paymentStatus && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="font-semibold text-text-primary mb-3">Payment</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Status:</span>
              <Badge
                variant="secondary"
                className={
                  order.paymentStatus === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }
              >
                {order.paymentStatus}
              </Badge>
            </div>
            {order.paymentMethod && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Method:</span>
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
