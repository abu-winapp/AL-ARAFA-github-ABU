/**
 * Al-Arafa Restaurant - Admin Orders Management Page
 * Comprehensive orders list with pagination, filtering, search, and status management
 */


'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Order, OrderStatus as OrderStatusType } from '@/types';
import * as adminService from '@/lib/api/admin.service';
import { useAuthStore } from '@/lib/store/useAuthStore';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  XCircle,
  Truck,
  Store,
  Package,
  ShoppingBag,
} from 'lucide-react';

// Valid status transitions (completed status ignored for now)
const validTransitions: Record<OrderStatusType, OrderStatusType[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['out_for_delivery', 'picked_up'],
  out_for_delivery: ['delivered'],
  delivered: [],
  picked_up: [],
  completed: [], // Not used currently
  cancelled: [],
};

const getValidNextStatuses = (order: Order): OrderStatusType[] => {
  let validNext = validTransitions[order.status] || [];

  // Filter based on fulfillment type
  if (order.fulfillmentType === 'pickup') {
    validNext = validNext.filter(s => s !== 'out_for_delivery');
  } else {
    validNext = validNext.filter(s => s !== 'picked_up');
  }

  return validNext;
};

const formatStatusLabel = (status: string): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Compact status display for table
const getStatusConfig = (status: OrderStatusType) => {
  const configs = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '📝' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: '✅' },
    preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-800', icon: '👨‍🍳' },
    ready: { label: 'Ready', color: 'bg-purple-100 text-purple-800', icon: '🎯' },
    out_for_delivery: { label: 'Out for Delivery', color: 'bg-indigo-100 text-indigo-800', icon: '🚗' },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: '✅' },
    picked_up: { label: 'Picked Up', color: 'bg-green-100 text-green-800', icon: '✅' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: '✅' }, // Not used
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' },
  };
  return configs[status] || configs.pending;
};

export default function AdminOrdersPage() {
  const router = useRouter();

  // Data state
  const [orders, setOrders] = useState<Order[]>([]);

  // Pagination state (server-side)
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('all');

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [detailsDialogOrder, setDetailsDialogOrder] = useState<Order | null>(null);
  const [statusDialogOrder, setStatusDialogOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [cancelDialogOrder, setCancelDialogOrder] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  const { isAuthenticated, user, isInitialized } = useAuthStore();

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await adminService.getAllOrders(
        currentPage,
        pageSize,
        {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          orderType: orderTypeFilter !== 'all' ? (orderTypeFilter as 'regular' | 'catering') : undefined,
        }
      );

      setOrders(response.items || []);
      setTotalPages(response.totalPages || 0);
      setTotalItems(response.totalItems || 0);
      setHasNext(response.hasNext || false);
      setHasPrevious(response.hasPrevious || false);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setError('Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(0); // Reset to page 0 when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auth guard and data loading
  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated || user?.userType !== 'admin') {
      router.push('/admin/login');
      return;
    }

    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, isInitialized, router, currentPage, statusFilter, orderTypeFilter]);

  // Client-side filtering for search and fulfillment type
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Search filter (client-side)
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.user?.fullName?.toLowerCase().includes(query) ||
        order.user?.phone?.includes(query)
      );
    }

    // Fulfillment filter (client-side)
    if (fulfillmentFilter !== 'all') {
      filtered = filtered.filter(order => order.fulfillmentType === fulfillmentFilter);
    }

    return filtered;
  }, [orders, debouncedSearch, fulfillmentFilter]);

  const handleUpdateStatus = async () => {
    if (!statusDialogOrder || !newStatus) return;

    try {
      setIsLoading(true);
      await adminService.updateOrderStatus(statusDialogOrder.id, newStatus);
      toast.success(`Order status updated to ${formatStatusLabel(newStatus)}`);
      setStatusDialogOrder(null);
      setNewStatus('');
      await loadOrders(); // Refresh list
    } catch (error) {
      console.error('Failed to update status:', error);
      const err = error as { response?: { status: number } };
      if (err.response?.status === 400) {
        toast.error('Invalid status transition');
      } else {
        toast.error('Failed to update order status');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelDialogOrder || !cancellationReason.trim() || cancellationReason.length < 10) {
      toast.error('Please provide a detailed cancellation reason (minimum 10 characters)');
      return;
    }

    try {
      setIsLoading(true);
      await adminService.adminCancelOrder(cancelDialogOrder.id, cancellationReason);
      toast.success('Order cancelled successfully');
      setCancelDialogOrder(null);
      setCancellationReason('');
      await loadOrders(); // Refresh list
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Orders Management</h1>
          <p className="text-text-secondary mt-2">Manage and track all customer orders</p>
        </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <Label htmlFor="search">Search Orders</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <Input
                id="search"
                placeholder="Order #, customer name, or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Label htmlFor="status-filter">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="mt-2">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Order Type Filter */}
          <div>
            <Label htmlFor="type-filter">Order Type</Label>
            <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
              <SelectTrigger id="type-filter" className="mt-2">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="regular">Instant</SelectItem>
                <SelectItem value="catering">Catering</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fulfillment Filter */}
          <div>
            <Label htmlFor="fulfillment-filter">Fulfillment</Label>
            <Select value={fulfillmentFilter} onValueChange={setFulfillmentFilter}>
              <SelectTrigger id="fulfillment-filter" className="mt-2">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="pickup">Self Collect</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || statusFilter !== 'all' || orderTypeFilter !== 'all' || fulfillmentFilter !== 'all') && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setOrderTypeFilter('all');
                setFulfillmentFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary">
              {searchQuery || statusFilter !== 'all' || orderTypeFilter !== 'all' || fulfillmentFilter !== 'all'
                ? 'No orders match your filters'
                : 'No orders yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-gray border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Order Info</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Fulfillment</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Payment</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-text-primary">Total</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-text-primary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-background-gray/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="min-w-[140px]">
                        <div className="font-semibold text-sm text-text-primary whitespace-nowrap">
                          {order.orderNumber}
                        </div>
                        <div className="text-xs text-text-tertiary whitespace-nowrap">
                          {format(new Date(order.createdAt), 'MMM dd, h:mm a')}
                        </div>
                        <Badge
                          variant="secondary"
                          className={`mt-1 text-xs ${
                            order.orderType === 'catering'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.orderType === 'catering' ? 'Catering' : 'Instant'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-text-primary">{order.user?.fullName || 'N/A'}</div>
                        <div className="text-sm text-text-tertiary">{order.user?.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="text-left hover:bg-background-gray/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4 text-primary" />
                              <div className="text-sm">
                                <div className="font-medium text-text-primary">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                                <div className="text-text-tertiary text-xs">Click to view</div>
                              </div>
                            </div>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="start">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-text-primary mb-3">Order Items</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {order.items.map((item, index) => (
                                <div key={item.id || index} className="flex items-start justify-between gap-2 text-sm border-b border-border-light pb-2 last:border-0">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-text-primary truncate">
                                      {item.menuItem?.name || item.itemName || 'Unknown Item'}
                                    </div>
                                    {item.specialInstructions && (
                                      <div className="text-xs text-text-tertiary italic mt-0.5">
                                        {item.specialInstructions}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right whitespace-nowrap">
                                    <div className="text-text-secondary">{item.quantity}×</div>
                                    <div className="font-semibold text-primary text-xs">
                                      ${item.subtotal.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="pt-2 border-t border-border-light flex justify-between font-semibold">
                              <span className="text-text-primary">Total:</span>
                              <span className="text-primary">${order.subtotal.toFixed(2)}</span>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {order.fulfillmentType === 'delivery' ? (
                          <Truck className="h-4 w-4 text-primary" />
                        ) : (
                          <Store className="h-4 w-4 text-primary" />
                        )}
                        <div>
                          <div className="text-sm capitalize">{order.fulfillmentType}</div>
                          <div className="text-xs text-text-tertiary">
                            {order.location?.name || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className={`${getStatusConfig(order.status).color} font-medium`}
                      >
                        <span className="mr-1">{getStatusConfig(order.status).icon}</span>
                        {getStatusConfig(order.status).label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {order.paymentStatus && (
                        <Badge
                          variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'}
                          className={
                            order.paymentStatus === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : order.paymentStatus === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {order.paymentStatus}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-semibold text-text-primary">
                        ${order.total.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDetailsDialogOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Details</p>
                          </TooltipContent>
                        </Tooltip>
                        {!['delivered', 'picked_up', 'cancelled'].includes(order.status) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setStatusDialogOrder(order);
                                  setNewStatus('');
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Update Status</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {['pending', 'confirmed', 'preparing'].includes(order.status) && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-error hover:text-error hover:bg-error/10"
                                onClick={() => setCancelDialogOrder(order)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cancel Order</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredOrders.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-text-secondary">
              Showing {currentPage * pageSize + 1} to{' '}
              {Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems} orders
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!hasPrevious}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-text-secondary px-4">
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!hasNext}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!detailsDialogOrder} onOpenChange={(open) => !open && setDetailsDialogOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {detailsDialogOrder?.orderNumber}</DialogTitle>
          </DialogHeader>

          {detailsDialogOrder && (
            <div className="space-y-6">
              {/* Two-column layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-text-primary">Customer Information</h3>
                  <div className="bg-background-gray rounded-lg p-4 space-y-2">
                    <div>
                      <span className="text-sm text-text-tertiary">Name:</span>
                      <div className="font-medium">{detailsDialogOrder.user?.fullName || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-sm text-text-tertiary">Phone:</span>
                      <div className="font-medium">{detailsDialogOrder.user?.phone}</div>
                    </div>
                    {detailsDialogOrder.user?.email && (
                      <div>
                        <span className="text-sm text-text-tertiary">Email:</span>
                        <div className="font-medium">{detailsDialogOrder.user.email}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-text-primary">Order Details</h3>
                  <div className="bg-background-gray rounded-lg p-4 space-y-2">
                    <div>
                      <span className="text-sm text-text-tertiary">Type:</span>
                      <div className="font-medium">
                        {detailsDialogOrder.orderType === 'catering' ? 'Catering' : 'Instant'}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-text-tertiary">Fulfillment:</span>
                      <div className="font-medium capitalize">{detailsDialogOrder.fulfillmentType}</div>
                    </div>
                    <div>
                      <span className="text-sm text-text-tertiary">Location:</span>
                      <div className="font-medium">{detailsDialogOrder.location?.name || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-sm text-text-tertiary">Created:</span>
                      <div className="font-medium">
                        {format(new Date(detailsDialogOrder.createdAt), 'MMM dd, yyyy h:mm a')}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-text-tertiary">Status:</span>
                      <div className="mt-1">
                        <Badge
                          variant="secondary"
                          className={`${getStatusConfig(detailsDialogOrder.status).color} font-medium`}
                        >
                          <span className="mr-1">{getStatusConfig(detailsDialogOrder.status).icon}</span>
                          {getStatusConfig(detailsDialogOrder.status).label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              {detailsDialogOrder.fulfillmentType === 'delivery' && detailsDialogOrder.deliveryAddress && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-text-primary">Delivery Address</h3>
                  <div className="bg-background-gray rounded-lg p-4">
                    <p className="text-text-primary">
                      {detailsDialogOrder.deliveryAddress.addressLine1}
                    </p>
                    {detailsDialogOrder.deliveryAddress.addressLine2 && (
                      <p className="text-text-primary">
                        {detailsDialogOrder.deliveryAddress.addressLine2}
                      </p>
                    )}
                    <p className="text-text-secondary text-sm mt-1">
                      {detailsDialogOrder.deliveryAddress.postalCode}
                    </p>
                    {detailsDialogOrder.deliveryInstructions && (
                      <p className="text-text-tertiary text-sm mt-2 italic">
                        {detailsDialogOrder.deliveryInstructions}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="font-semibold text-text-primary">Order Items</h3>
                <div className="border rounded-lg divide-y">
                  {detailsDialogOrder.items.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-text-primary">
                          {item.menuItem?.name || item.itemName || 'N/A'}
                        </div>
                        {item.specialInstructions && (
                          <div className="text-sm text-text-tertiary mt-1">
                            {item.specialInstructions}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-text-primary">
                          {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </div>
                        <div className="font-semibold text-primary">
                          ${item.subtotal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-3">
                <h3 className="font-semibold text-text-primary">Order Summary</h3>
                <div className="bg-background-gray rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Subtotal:</span>
                    <span className="text-text-primary">${detailsDialogOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {detailsDialogOrder.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Delivery Fee:</span>
                      <span className="text-text-primary">${detailsDialogOrder.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {detailsDialogOrder.gstAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">GST:</span>
                      <span className="text-text-primary">${detailsDialogOrder.gstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {detailsDialogOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount:</span>
                      <span>-${detailsDialogOrder.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                    <span className="text-text-primary">Total:</span>
                    <span className="text-primary">${detailsDialogOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              {detailsDialogOrder.paymentStatus && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-text-primary">Payment</h3>
                  <div className="bg-background-gray rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Status:</span>
                      <Badge
                        variant={detailsDialogOrder.paymentStatus === 'completed' ? 'default' : 'secondary'}
                        className={
                          detailsDialogOrder.paymentStatus === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {detailsDialogOrder.paymentStatus}
                      </Badge>
                    </div>
                    {detailsDialogOrder.paymentMethod && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Method:</span>
                        <span className="text-text-primary capitalize">
                          {detailsDialogOrder.paymentMethod}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={!!statusDialogOrder}
        onOpenChange={(open) => {
          if (!open) {
            setStatusDialogOrder(null);
            setNewStatus('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>

          {statusDialogOrder && (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-text-tertiary">Order:</div>
                <div className="font-semibold">{statusDialogOrder.orderNumber}</div>
              </div>

              <div>
                <div className="text-sm text-text-tertiary mb-2">Current Status:</div>
                <Badge
                  variant="secondary"
                  className={`${getStatusConfig(statusDialogOrder.status).color} font-medium`}
                >
                  <span className="mr-1">{getStatusConfig(statusDialogOrder.status).icon}</span>
                  {getStatusConfig(statusDialogOrder.status).label}
                </Badge>
              </div>

              <div>
                <Label htmlFor="new-status">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="new-status" className="mt-2">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {getValidNextStatuses(statusDialogOrder).map((status) => (
                      <SelectItem key={status} value={status}>
                        {formatStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <AlertDescription>
                  Status changes are immediate and cannot be reversed.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusDialogOrder(null);
                    setNewStatus('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={!newStatus || isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <AlertDialog
        open={!!cancelDialogOrder}
        onOpenChange={(open) => {
          if (!open) {
            setCancelDialogOrder(null);
            setCancellationReason('');
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {cancelDialogOrder && (
            <div className="space-y-4">
              <div className="bg-background-gray rounded-lg p-4">
                <div className="font-semibold">{cancelDialogOrder.orderNumber}</div>
                <div className="text-sm text-text-tertiary mt-1">
                  {cancelDialogOrder.user?.fullName || cancelDialogOrder.user?.phone}
                </div>
                <div className="text-sm font-semibold text-primary mt-1">
                  ${cancelDialogOrder.total.toFixed(2)}
                </div>
              </div>

              <div>
                <Label htmlFor="cancel-reason">Cancellation Reason (required)</Label>
                <Textarea
                  id="cancel-reason"
                  placeholder="Enter reason for cancellation..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
                {cancellationReason && cancellationReason.length < 10 && (
                  <p className="text-sm text-error mt-1">
                    Please provide at least 10 characters
                  </p>
                )}
              </div>

              <Alert variant="destructive">
                <AlertDescription>
                  Cancellation cannot be undone. Ensure proper refund processing if payment was made.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setCancelDialogOrder(null);
                setCancellationReason('');
              }}
            >
              Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              disabled={!cancellationReason || cancellationReason.length < 10 || isLoading}
              className="bg-error hover:bg-error/90"
            >
              {isLoading ? 'Cancelling...' : 'Cancel Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
