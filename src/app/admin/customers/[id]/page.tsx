/**
 * Al-Arafa Restaurant - Admin Customer Detail Page
 */

// if i login the login it works successfully but when i click a product to add to cart it shows the login page again if i login again it allows to add to cart 

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Modal } from '@/components/ui/Modal';
import type { User, Order } from '@/types';
import * as adminCustomersService from '@/lib/api/admin-customers.service';
import { useAuthStore } from '@/lib/store/useAuthStore';
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { useForm } from 'react-hook-form';

interface AdjustPointsForm {
  points: number;
  reason: string;
}

export default function AdminCustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination for orders
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Modal and dialog states
  const [showAdjustPointsModal, setShowAdjustPointsModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<boolean>(false);

  const { isAuthenticated, user, isInitialized } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdjustPointsForm>();

  const loadCustomer = async () => {
    try {
      const data = await adminCustomersService.getCustomer(customerId);
      setCustomer(data);
    } catch (error) {
      console.error('Failed to load customer:', error);
      setError('Failed to load customer details.');
    }
  };

  const loadOrders = async () => {
    try {
      const response = await adminCustomersService.getCustomerOrders(
        customerId,
        currentPage,
        pageSize
      );
      setOrders(response.items || []);
      setTotalPages(response.totalPages || 0);
      setTotalItems(response.totalItems || 0);
      setHasNext(response.hasNext || false);
      setHasPrevious(response.hasPrevious || false);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated || user?.userType !== 'admin') {
      router.push('/admin/login');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadCustomer(), loadOrders()]);
      setIsLoading(false);
    };

    loadData();
  }, [isAuthenticated, user, router, isInitialized, customerId, currentPage]);

  const handleUpdateStatus = async () => {
    try {
      await adminCustomersService.updateCustomerStatus(customerId, newStatus);
      setShowStatusDialog(false);
      await loadCustomer();
    } catch (error) {
      console.error('Failed to update status:', error);
      setError('Failed to update customer status.');
    }
  };

  const handleAdjustPoints = async (data: AdjustPointsForm) => {
    try {
      await adminCustomersService.adjustLoyaltyPoints(
        customerId,
        data.points,
        data.reason
      );
      setShowAdjustPointsModal(false);
      reset();
      await loadCustomer();
    } catch (error) {
      console.error('Failed to adjust points:', error);
      setError('Failed to adjust loyalty points.');
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      await adminCustomersService.deleteCustomer(customerId);
      router.push('/admin/customers');
    } catch (error) {
      console.error('Failed to delete customer:', error);
      setError('Failed to delete customer.');
      setShowDeleteDialog(false);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Customer not found</AlertDescription>
        </Alert>
        <Link href="/admin/customers">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success';
      case 'blocked':
        return 'bg-error/20 text-error';
      default:
        return 'bg-warning/20 text-warning';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'picked_up':
        return 'bg-success/20 text-success';
      case 'cancelled':
        return 'bg-error/20 text-error';
      case 'pending':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/customers">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-text-primary">Customer Details</h1>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-2xl mb-3">
                  {customer.fullName?.charAt(0) || customer.phone.slice(-2)}
                </div>
                <h2 className="text-xl font-bold text-text-primary">
                  {customer.fullName || 'No name'}
                </h2>
                <span
                  className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    customer.status
                  )}`}
                >
                  {customer.status}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Mail className="w-4 h-4" />
                    <span>{customer.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-text-secondary">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(customer.createdAt).toLocaleDateString('en-SG')}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <UserIcon className="w-4 h-4" />
                  <span className="text-xs break-all">{customer.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Status Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setNewStatus(true);
                  setShowStatusDialog(true);
                }}
                disabled={customer.status === 'active'}
              >
                Activate Account
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setNewStatus(false);
                  setShowStatusDialog(true);
                }}
                disabled={customer.status === 'blocked'}
              >
                Deactivate Account
              </Button>
            </CardContent>
          </Card>

          {/* Loyalty Points */}
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CreditCard className="w-6 h-6 text-secondary" />
                  <span className="text-4xl font-bold text-secondary">
                    {customer.loyaltyPoints}
                  </span>
                </div>
                <p className="text-sm text-text-secondary">Current Points Balance</p>
              </div>
              <Button
                variant="default"
                className="w-full"
                onClick={() => setShowAdjustPointsModal(true)}
              >
                Adjust Points
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-error">
            <CardHeader>
              <CardTitle className="text-error">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-4">
                Permanently delete this customer and all associated data.
              </p>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteDialog(true)}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Delete Customer
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-text-secondary">No orders found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-background-gray">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-bold text-text-primary">Order #</th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-text-primary">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-text-primary">Items</th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-text-primary">Total</th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-text-primary">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-light">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-background-gray/50 transition-colors">
                            <td className="px-4 py-3">
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="text-primary hover:text-primary-dark font-semibold"
                              >
                                {order.orderNumber}
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-sm text-text-secondary">
                              {new Date(order.createdAt).toLocaleDateString('en-SG')}
                            </td>
                            <td className="px-4 py-3 text-sm text-text-secondary">
                              {order.items.length} items
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-text-primary">
                              ${order.total.toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(
                                  order.status
                                )}`}
                              >
                                {order.status.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 0 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-border-light">
                      <div className="text-sm text-text-secondary">
                        Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems} orders
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousPage}
                          disabled={!hasPrevious}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Previous
                        </Button>
                        <span className="text-sm text-text-secondary">
                          Page {currentPage + 1} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={!hasNext}
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Adjust Points Modal */}
      <Modal
        isOpen={showAdjustPointsModal}
        onClose={() => {
          setShowAdjustPointsModal(false);
          reset();
        }}
        title="Adjust Loyalty Points"
      >
        <form onSubmit={handleSubmit(handleAdjustPoints)} className="space-y-4">
          <div>
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              placeholder="Enter points (negative to deduct)"
              {...register('points', {
                required: 'Points is required',
                valueAsNumber: true,
                validate: (value) => value !== 0 || 'Points cannot be zero',
              })}
            />
            {errors.points && (
              <p className="text-error text-sm mt-1">{errors.points.message}</p>
            )}
            <p className="text-xs text-text-tertiary mt-1">
              Use negative values to deduct points (e.g., -100)
            </p>
          </div>

          <div>
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              type="text"
              placeholder="Enter reason for adjustment"
              {...register('reason', {
                required: 'Reason is required',
                minLength: {
                  value: 3,
                  message: 'Reason must be at least 3 characters',
                },
              })}
            />
            {errors.reason && (
              <p className="text-error text-sm mt-1">{errors.reason.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAdjustPointsModal(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Adjust Points
            </Button>
          </div>
        </form>
      </Modal>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {newStatus ? 'Activate Customer' : 'Deactivate Customer'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {newStatus ? 'activate' : 'deactivate'} this customer account?
              {!newStatus && ' The customer will not be able to place orders while deactivated.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateStatus}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p className="font-semibold text-error">
                  This action cannot be undone!
                </p>
                <p>
                  This will permanently delete <strong>{customer.fullName || customer.phone}</strong> and remove:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Customer profile and personal information</li>
                  <li>Order history ({totalItems} orders)</li>
                  <li>Loyalty points ({customer.loyaltyPoints} points)</li>
                  <li>All associated data</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
              className="bg-error hover:bg-error/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
