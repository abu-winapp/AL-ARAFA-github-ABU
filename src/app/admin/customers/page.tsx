/**
 * Al-Arafa Restaurant - Admin Customers Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
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
import type { User } from '@/types';
import * as adminCustomersService from '@/lib/api/admin-customers.service';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Delete confirmation dialog
  const [customerToDelete, setCustomerToDelete] = useState<User | null>(null);

  const { isAuthenticated, user, isInitialized } = useAuthStore();

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let response;
      if (debouncedSearchQuery.trim()) {
        response = await adminCustomersService.searchCustomers(
          debouncedSearchQuery,
          currentPage,
          pageSize
        );
      } else {
        response = await adminCustomersService.getAllCustomers(
          currentPage,
          pageSize
        );
      }

      setCustomers(response.items || []);
      setTotalPages(response.totalPages || 0);
      setTotalItems(response.totalItems || 0);
      setHasNext(response.hasNext || false);
      setHasPrevious(response.hasPrevious || false);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load customers:', error);
      setError('Failed to load customers. Please try again.');
      setCustomers([]);
      setIsLoading(false);
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(0); // Reset to page 0 when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // Wait for auth to initialize before checking authentication
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated || user?.userType !== 'admin') {
      router.push('/admin/login');
      return;
    }

    loadCustomers();
  }, [isAuthenticated, user, router, isInitialized, debouncedSearchQuery, currentPage]);

  const handleToggleStatus = async (id: string) => {
    try {
      await adminCustomersService.toggleCustomerStatus(id);
      loadCustomers();
    } catch (error) {
      alert('Failed to update customer status');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      await adminCustomersService.deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
      loadCustomers();
    } catch (error) {
      console.error('Failed to delete customer:', error);
      setError('Failed to delete customer. Please try again.');
      setCustomerToDelete(null);
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
          <p className="text-text-secondary">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <Input
          placeholder="Search by name, phone, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-background-gray">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-text-primary">Customer</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-text-primary">Contact</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-text-primary">Loyalty Points</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-text-primary">Status</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-text-primary">Joined</th>
              <th className="px-6 py-4 text-right text-sm font-bold text-text-primary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-background-gray/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                      {customer.fullName?.charAt(0) || customer.phone?.slice(-2) || '?'}
                    </div>
                    <div>
                      <div className="font-semibold text-text-primary">
                        {customer.fullName || 'No name'}
                      </div>
                      <div className="text-xs text-text-tertiary">{customer.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-text-primary">{customer.phone || 'No phone'}</div>
                  {customer.email && (
                    <div className="text-xs text-text-tertiary">{customer.email}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-lg font-bold text-secondary">{customer.loyaltyPoints}</div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleStatus(customer.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      customer.status === 'active'
                        ? 'bg-success/20 text-success'
                        : customer.status === 'blocked'
                        ? 'bg-error/20 text-error'
                        : 'bg-warning/20 text-warning'
                    }`}
                  >
                    {customer.status}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-text-tertiary">
                  {new Date(customer.createdAt).toLocaleDateString('en-SG')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-primary hover:text-primary-dark font-semibold text-sm"
                    >
                      View Details →
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCustomerToDelete(customer)}
                      className="text-error hover:text-error hover:bg-error/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {customers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-text-secondary">
              {debouncedSearchQuery ? 'No customers found matching your search' : 'No customers found'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border-light">
            <div className="text-sm text-text-secondary">
              Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems} customers
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
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!customerToDelete} onOpenChange={() => setCustomerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {customerToDelete?.fullName || customerToDelete?.phone}?
              This action cannot be undone and will permanently remove the customer and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCustomer}
              className="bg-error hover:bg-error/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
