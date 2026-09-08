/**
 * Al-Arafa Restaurant - Address Management Page
 */

"use client";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useState, useEffect } from "react";

import { useAuthStore } from "@/lib/store/useAuthStore";
import { AddressCard } from "@/components/checkout/AddressCard";
import { AddAddressDialog } from "@/components/checkout/AddAddressDialog";
import { EditAddressDialog } from "@/components/checkout/EditAddressDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { UserAddress } from "@/types";
import * as addressService from "@/lib/api/address.service";
import { toast } from "@/lib/hooks/use-toast";

function AddressesPage() {
 const {
  isAuthenticated,
  isInitialized,
  user,
} = useAuthStore();

const isCustomer =
  user?.userType === "customer" ||
  user?.role === "CUSTOMER";
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(
    null,
  );
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
useEffect(() => {
  if (!isInitialized) return;

  if (isAuthenticated && isCustomer) {
    loadAddresses();
  }

}, [
  isInitialized,
  isAuthenticated,
  isCustomer
]);

  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch (error) {
      console.error("Failed to load addresses:", error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressAdded = (newAddress: UserAddress) => {
    setAddresses((prev) => [...prev, newAddress]);
    toast({
      title: "Success",
      description: "Address added successfully",
    });
  };

  const handleAddressUpdated = (updatedAddress: UserAddress) => {
    setAddresses((prev) =>
      prev.map((addr) =>
        addr.id === updatedAddress.id ? updatedAddress : addr,
      ),
    );
    toast({
      title: "Success",
      description: "Address updated successfully",
    });
  };

  const handleDeleteClick = (address: UserAddress) => {
    setDeletingAddressId(address.id);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAddressId) return;

    setIsDeleting(true);
    try {
      await addressService.deleteAddress(deletingAddressId);
      setAddresses((prev) =>
        prev.filter((addr) => addr.id !== deletingAddressId),
      );
      toast({
        title: "Success",
        description: "Address deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete address:", error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletingAddressId(null);
    }
  };

  const handleSetDefault = async (address: UserAddress) => {
    if (address.isDefault) return;

    try {
      await addressService.setDefaultAddress(address.id);

      // Optimistically update UI
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          isDefault: addr.id === address.id,
        })),
      );

      toast({
        title: "Success",
        description: "Default address updated",
      });
    } catch (error) {
      console.error("Failed to set default address:", error);
      toast({
        title: "Error",
        description: "Failed to update default address",
        variant: "destructive",
      });
      // Reload addresses on error
      loadAddresses();
    }
  };

  const deletingAddress = addresses.find(
    (addr) => addr.id === deletingAddressId,
  );

  // Show loading while auth initializes or addresses are loading
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">
            {!isInitialized ? "Initializing..." : "Loading addresses..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-gray py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
              My Addresses
            </h1>
            <button
              onClick={() => setShowAddDialog(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Address
            </button>
          </div>

          {/* Empty State */}
          {addresses.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-7xl mb-4">📍</div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                No addresses saved
              </h2>
              <p className="text-text-secondary mb-6">
                Add your first delivery address to get started
              </p>
              <button
                onClick={() => setShowAddDialog(true)}
                className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all inline-flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {addresses.map((address) => (
                <div key={address.id} className="relative h-full">
                  <AddressCard
                    address={address}
                    showActions={true}
                    onEdit={setEditingAddress}
                    onDelete={handleDeleteClick}
                  />
                  {/* Set as Default Button */}
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address)}
                      className="absolute top-5 right-5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors px-2 py-1 bg-white rounded-md border border-primary/30 hover:border-primary"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Address Dialog */}
      <AddAddressDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddressAdded={handleAddressAdded}
      />

      {/* Edit Address Dialog */}
      <EditAddressDialog
        open={!!editingAddress}
        onOpenChange={(open) => !open && setEditingAddress(null)}
        address={editingAddress}
        onAddressUpdated={handleAddressUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingAddressId}
        onOpenChange={(open) => !open && setDeletingAddressId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingAddress?.isDefault ? (
                <>
                  You are about to delete your default address. Are you sure you
                  want to continue?
                  {addresses.length > 1 && (
                    <span className="block mt-2 text-text-tertiary">
                      You'll need to set another address as default.
                    </span>
                  )}
                </>
              ) : (
                "This action cannot be undone. This will permanently delete this address."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-error hover:bg-error/90"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
export default function ProtectedAddressesPage() {
  return (
    <ProtectedRoute customerOnly>
      <AddressesPage />
    </ProtectedRoute>
  );
}
