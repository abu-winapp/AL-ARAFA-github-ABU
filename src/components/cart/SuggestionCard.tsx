/**
 * Al-Arafa Restaurant - Suggestion Card Component
 * Displays a suggested menu item in the suggestions dialog
 */

'use client';

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MenuItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore, isCustomerAuthenticated as isCustomerAuth } from '@/lib/store/useAuthStore';
import { useToast } from '@/lib/hooks/use-toast';
import { Leaf } from 'lucide-react';
import * as addressService from '@/lib/api/address.service';

interface SuggestionCardProps {
  item: MenuItem;
  locationId: string;
  onItemAdded: () => void;
}

export const SuggestionCard: FC<SuggestionCardProps> = ({ item, locationId, onItemAdded }) => {
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();
  const { addItem, updateItem, cart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  // Only show cart for authenticated customer users (not admin)
  const isCustomerAuthenticated = isCustomerAuth(user, isAuthenticated);

  // Check if item is already in cart
  const cartItem = isCustomerAuthenticated ? cart?.items.find((ci) => ci.menuItemId === item.id) : null;
  const currentQuantity = cartItem?.quantity || 0;

  // Check if cart has items with different menu type
  const hasConflictingMenuType = () => {
    if (!cart || !cart.items || cart.items.length === 0) return false;
    const existingMenuType = cart.items[0].menuType || cart.items[0].menuItem?.menuType;
    return existingMenuType && existingMenuType !== item.menuType;
  };

  const handleAdd = async () => {
    if (!item.isAvailable) return;

    // Auth gate
    if (!isCustomerAuthenticated) {
      router.push('/login?redirect=/menu');
      return;
    }

    // Check if delivery mode is selected but no address exists
    const fulfillmentType = useCartStore.getState().getFulfillmentType(item.menuType);
    if (fulfillmentType === 'delivery') {
      try {
        const addresses = await addressService.getAddresses();
        if (!addresses || addresses.length === 0) {
          toast({
            title: "Address Required",
            description: "Please add a delivery address before ordering.",
            variant: "destructive",
            duration: 3000,
          });
          return;
        }
      } catch (error) {
        console.error('Failed to check addresses:', error);
      }
    }

    // Check for menu type conflict
    if (hasConflictingMenuType()) {
      const existingMenuType = cart?.items[0].menuType || cart?.items[0].menuItem?.menuType;
      toast({
        title: "Cannot mix menu types",
        description: `Cannot mix ${existingMenuType} and ${item.menuType} items. Please clear your cart first.`,
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    setIsAdding(true);
    try {
      if (cartItem) {
        await updateItem(cartItem.id, currentQuantity + 1);
      } else {
        await addItem(item, 1, locationId);
      }

      // Show success toast
      toast({
        title: "Added to cart",
        description: `${item.name} has been added`,
        duration: 2000,
      });

      // Callback to refresh cart display
      onItemAdded();
    } catch (error) {
      console.error('Failed to add item:', error);
      toast({
        title: "Failed to add item",
        description: "Please try again",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleIncrease = async () => {
    if (!cartItem) return;
    setIsAdding(true);
    try {
      await updateItem(cartItem.id, currentQuantity + 1);
      onItemAdded();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast({
        title: "Failed to update",
        description: "Please try again",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDecrease = async () => {
    if (!cartItem) return;
    setIsAdding(true);
    try {
      await updateItem(cartItem.id, currentQuantity - 1);
      onItemAdded();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast({
        title: "Failed to update",
        description: "Please try again",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const isDisabled = !item.isAvailable || hasConflictingMenuType();

  return (
    <div className="bg-white rounded-xl border-2 border-border-light hover:border-primary/30 hover:shadow-lg transition-all duration-200 overflow-hidden group">
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-background-gray to-gray-100 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            🍛
          </div>
        )}

        {/* Veg/Non-veg Badge */}
        <div className="absolute top-2 left-2 shadow-md">
          {item.isVegetarian ? (
            <div className="bg-green-500 p-1.5 rounded-md backdrop-blur-sm">
              <Leaf className="h-3.5 w-3.5 text-white" />
            </div>
          ) : (
            <div className="bg-red-500 p-1.5 rounded-md backdrop-blur-sm">
              <div className="h-3.5 w-3.5 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          )}
        </div>

        {/* Unavailable Overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-text-primary text-base mb-1.5 line-clamp-1">
          {item.name}
        </h3>

        <p className="text-primary font-bold text-lg mb-3">
          ${item.price.toFixed(2)}
        </p>

        {/* Add Button or Quantity Controls */}
        {currentQuantity === 0 ? (
          <Button
            onClick={handleAdd}
            disabled={isDisabled || isAdding}
            className="w-full h-10 text-sm font-semibold shadow-sm"
          >
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </Button>
        ) : (
          <div className="flex items-center justify-between bg-primary/5 border-2 border-primary/20 rounded-lg px-3 py-2.5">
            <button
              onClick={handleDecrease}
              disabled={isAdding}
              className="w-8 h-8 flex items-center justify-center text-primary font-bold text-xl hover:bg-primary/10 rounded-md transition-colors disabled:opacity-50"
            >
              −
            </button>
            <span className="font-bold text-text-primary text-base">
              {currentQuantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={isAdding}
              className="w-8 h-8 flex items-center justify-center text-primary font-bold text-xl hover:bg-primary/10 rounded-md transition-colors disabled:opacity-50"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
