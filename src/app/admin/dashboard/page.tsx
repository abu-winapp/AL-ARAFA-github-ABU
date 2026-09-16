/**
 * Al-Arafa Restaurant - Admin Dashboard Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { OrderStatus } from '@/components/order/OrderStatus';
import type { Order } from '@/types';
import * as adminService from '@/lib/api/admin.service';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<{
    ordersToday?: number;
    revenueToday?: number;
    activeOrders?: number;
    activeOrdersCount?: number;
    todayOrders?: number;
    todayRevenue?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthenticated, user, isInitialized } = useAuthStore();

  const loadDashboard = async () => {
    try {
      const [orders, dashboard] = await Promise.all([
        adminService.getActiveOrders(),
        adminService.getDashboard(),
      ]);

      setActiveOrders(orders || []);
      setRecentOrders(dashboard?.recentOrders || []);
      setStats(dashboard || {});
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setActiveOrders([]);
      setRecentOrders([]);
      setStats({});
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Wait for auth store to initialize from localStorage
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated || user?.userType !== 'admin') {
      router.push('/admin/login');
      return;
    }

    loadDashboard();
    const interval = setInterval(loadDashboard, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, user, isInitialized, router]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      loadDashboard();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update order status');
    }
  };

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-3xl font-bold text-primary mb-2">
                {stats.ordersToday || stats.todayOrders || 0}
              </div>
              <div className="text-text-secondary font-medium">Today&apos;s Orders</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-3xl font-bold text-success mb-2">
                S$ {((stats.revenueToday || stats.todayRevenue || 0)).toFixed(2)}
              </div>
              <div className="text-text-secondary font-medium">Today&apos;s Revenue</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-3xl font-bold text-warning mb-2">
                {stats.activeOrders || stats.activeOrdersCount || activeOrders?.length || 0}
              </div>
              <div className="text-text-secondary font-medium">Active Orders</div>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {recentOrders && recentOrders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Recent Orders</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/admin/orders`}>
                  <div className="border-2 border-border-light rounded-xl p-4 hover:border-primary/50 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-text-primary">
                          {order.orderNumber}
                        </h3>
                        <p className="text-sm text-text-tertiary">
                          {new Date(order.createdAt).toLocaleString('en-SG')}
                        </p>
                        {order.user && (
                          <p className="text-sm text-text-secondary mt-1">
                            {order.user.fullName || order.user.phone}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">
                          S$ {order.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-text-secondary mb-2">
                      {order.items.length} items • {order.fulfillmentType}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Active Orders */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Active Orders ({activeOrders?.length || 0})</h2>

          {!activeOrders || activeOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-text-secondary">No active orders at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders?.map((order) => (
                <div
                  key={order.id}
                  className="border-2 border-border-light rounded-xl p-6 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-xl text-text-primary mb-1">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-text-tertiary">
                        {new Date(order.createdAt).toLocaleTimeString('en-SG')} •{' '}
                        {order.items.length} items • S$ {order.total.toFixed(2)}
                      </p>
                      {order.user && (
                        <p className="text-sm text-text-secondary mt-1">
                          Customer: {order.user.fullName || order.user.phone}
                        </p>
                      )}
                    </div>
                    <OrderStatus status={order.status} />
                  </div>

                  {/* Items List */}
                  <div className="bg-background-gray rounded-lg p-4 mb-4">
                    {order.items.map((item) => {
                      const itemName = item.itemName || item.menuItem?.name || 'Item';
                      return (
                        <div key={item.id} className="text-sm text-text-secondary">
                          {item.quantity}x {itemName}
                        </div>
                      );
                    })}
                  </div>

                  {/* Status Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                        className="px-4 py-2 bg-success text-white rounded-lg font-semibold hover:bg-success/90 transition-all text-sm"
                      >
                        Confirm Order
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                        className="px-4 py-2 bg-status-preparing text-white rounded-lg font-semibold hover:opacity-90 transition-all text-sm"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                        className="px-4 py-2 bg-status-ready text-white rounded-lg font-semibold hover:opacity-90 transition-all text-sm"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'ready' && order.fulfillmentType === 'delivery' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'out_for_delivery')}
                        className="px-4 py-2 bg-status-out-for-delivery text-white rounded-lg font-semibold hover:opacity-90 transition-all text-sm"
                      >
                        Out for Delivery
                      </button>
                    )}
                    {order.status === 'out_for_delivery' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                        className="px-4 py-2 bg-success text-white rounded-lg font-semibold hover:bg-success/90 transition-all text-sm"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {order.status === 'ready' && order.fulfillmentType === 'pickup' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'picked_up')}
                        className="px-4 py-2 bg-success text-white rounded-lg font-semibold hover:bg-success/90 transition-all text-sm"
                      >
                        Mark Picked Up
                      </button>
                    )}

                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="px-4 py-2 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-all text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
