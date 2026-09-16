/**
 * Al-Arafa Restaurant - Orders List Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { OrderStatus } from '@/components/order/OrderStatus';
import { Button } from '@/components/ui/Button';
import type { Order } from '@/types';
import * as orderService from '@/lib/api/order.service';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const pageSize = 10;

  const { isAuthenticated, isInitialized, initialize } = useAuthStore();

  // Initialize auth store on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Handle authentication and load orders
  useEffect(() => {
    // Wait for auth store to initialize before checking authentication
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login?redirect=/orders');
      return;
    }

    loadOrders();
  }, [isAuthenticated, isInitialized, router, currentPage]);

  // Reset to page 0 when filter changes
  useEffect(() => {
    // Wait for initialization and authentication
    if (!isInitialized || !isAuthenticated) {
      return;
    }

    if (currentPage !== 0) {
      setCurrentPage(0);
    } else {
      loadOrders();
    }
  }, [filter, isInitialized, isAuthenticated]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await orderService.getMyOrders({
        page: currentPage,
        pageSize,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setOrders(response.items);
      setTotalPages(response.totalPages);
      setHasNext(response.hasNext);
      setHasPrevious(response.hasPrevious);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'active') {
      return !['delivered', 'picked_up', 'cancelled'].includes(order.status);
    }
    if (filter === 'completed') {
      return ['delivered', 'picked_up'].includes(order.status);
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-gray py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-8">My Orders</h1>

          {/* Filter Tabs */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setFilter('all')}
              className={clsx(
                'px-6 py-2.5 rounded-lg font-semibold transition-all',
                filter === 'all'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-text-primary hover:bg-primary/10'
              )}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilter('active')}
              className={clsx(
                'px-6 py-2.5 rounded-lg font-semibold transition-all',
                filter === 'active'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-text-primary hover:bg-primary/10'
              )}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={clsx(
                'px-6 py-2.5 rounded-lg font-semibold transition-all',
                filter === 'completed'
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-text-primary hover:bg-primary/10'
              )}
            >
              Completed
            </button>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-7xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">No orders yet</h2>
              <p className="text-text-secondary mb-6">Start ordering delicious food!</p>
              <Link href="/menu">
                <button className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all">
                  Browse Menu
                </button>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  // Determine order type badge text
                  const getOrderTypeBadge = () => {
                    if (order.instantOrder || order.orderType === 'instant') return 'Instant';
                    if (order.cateringOrder || order.orderType === 'catering') return 'Catering';
                    if (order.orderType === 'scheduled') return 'Scheduled';
                    return null;
                  };

                  const orderTypeBadge = getOrderTypeBadge();

                  return (
                    <Link key={order.id} href={`/orders/${order.id}`}>
                      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-border-light hover:border-primary/50">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-text-primary text-lg">
                                Order #{order.orderNumber}
                              </h3>
                              {orderTypeBadge && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                                  {orderTypeBadge}
                                </span>
                              )}
                              {(order.paymentStatus === 'pending' || order.paymentStatus === 'failed') &&
                                order.paymentMethod !== 'cash' && (
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                  order.paymentStatus === 'failed'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {order.paymentStatus === 'failed' ? 'Payment Failed' : 'Payment Pending'}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-text-tertiary">
                              {new Date(order.createdAt).toLocaleDateString('en-SG', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {order.locationName && (
                              <p className="text-sm text-text-secondary mt-1 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {order.locationName}
                              </p>
                            )}
                          </div>
                          <OrderStatus status={order.status} />
                        </div>

                        {/* Items Summary */}
                        <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span>
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="capitalize">{order.fulfillmentType}</span>
                        </div>

                        {/* Total and Points */}
                        <div className="flex items-center justify-between pt-4 border-t border-border-light">
                          <div>
                            <span className="text-text-secondary font-medium">Total</span>
                            {/* Only show points earned for completed orders (delivered/picked_up/completed) */}
                            {(order.status === 'delivered' || order.status === 'picked_up' || order.status === 'completed') &&
                              order.pointsEarned && order.pointsEarned > 0 && (
                              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                +{order.pointsEarned} pts earned
                              </div>
                            )}
                          </div>
                          <span className="text-2xl font-bold text-primary">S$ {order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    disabled={!hasPrevious || isLoading}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Button>
                  <span className="text-text-secondary font-medium">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={!hasNext || isLoading}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
