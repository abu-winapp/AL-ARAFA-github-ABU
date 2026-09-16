/**
 * Al-Arafa Restaurant - Menu Item Detail Page
 */

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Flame, ShoppingCart, Plus, Minus } from 'lucide-react';
import type { MenuItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { LoginSheet } from '@/components/auth/LoginSheet';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore, isCustomerAuthenticated as isCustomerAuth } from '@/lib/store/useAuthStore';
import * as menuService from '@/lib/api/menu.service';
import * as locationService from '@/lib/api/location.service';
import * as cartService from '@/lib/api/cart.service';
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

// Default location fallback (Tampines)
const DEFAULT_LOCATION_ID = '1';

interface ItemDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showMenuTypeAlert, setShowMenuTypeAlert] = useState(false);
  const [loginSheetOpen, setLoginSheetOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>(DEFAULT_LOCATION_ID);

  const { cart, addItem, updateItem, fetchCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  // Only show cart for authenticated customer users (not admin)
  const isCustomerAuthenticated = isCustomerAuth(user, isAuthenticated);

  // Check if item is already in cart
  const cartItem = isCustomerAuthenticated && item
    ? cart?.items.find((ci) => ci.menuItemId === item.id)
    : null;
  const currentQuantity = cartItem?.quantity || 0;

  // Initialize location from cart or fetch locations
  useEffect(() => {
    const initializeLocation = async () => {
      if (cart?.locationId) {
        setSelectedLocation(cart.locationId);
      } else {
        try {
          const locations = await locationService.getActiveLocations();
          if (locations && locations.length > 0) {
            setSelectedLocation(locations[0].id);
          }
        } catch (err) {
          console.warn('Failed to fetch locations, using default:', err);
        }
      }
    };

    initializeLocation();
  }, [cart?.locationId]);

  // Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await menuService.getMenuItem(id);
        setItem(data);
      } catch (err) {
        console.error('Failed to load item:', err);
        setError(err instanceof Error ? err.message : 'Failed to load item');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  // Check if cart has items with different menu type
  const hasConflictingMenuType = () => {
    if (!cart || !cart.items || cart.items.length === 0 || !item) return false;
    const existingMenuType = cart.items[0].menuType || cart.items[0].menuItem?.menuType;
    return existingMenuType && existingMenuType !== item.menuType;
  };

  const handleAddToCart = async () => {
    if (!item || !item.available) return;

    // Auth gate: show login prompt if not authenticated as customer
    if (!isCustomerAuthenticated) {
      setLoginSheetOpen(true);
      return;
    }

    // Check for menu type conflict
    if (hasConflictingMenuType()) {
      setShowMenuTypeAlert(true);
      return;
    }

    setIsAdding(true);
    try {
      if (cartItem) {
        await updateItem(cartItem.id, currentQuantity + 1);
      } else {
        await addItem(item, 1, selectedLocation);
      }
    } catch (error) {
      console.error('Failed to add item:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleIncrease = async () => {
    if (!cartItem || !isCustomerAuthenticated) return;

    setIsAdding(true);
    try {
      await updateItem(cartItem.id, currentQuantity + 1);
    } catch (error) {
      console.error('Failed to update item:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDecrease = async () => {
    if (!cartItem || currentQuantity <= 0 || !isCustomerAuthenticated) return;

    setIsAdding(true);
    try {
      await updateItem(cartItem.id, currentQuantity - 1);
    } catch (error) {
      console.error('Failed to update item:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleConfirmClearCart = async () => {
    if (!item) return;

    setShowMenuTypeAlert(false);
    setIsAdding(true);
    try {
      await cartService.clearCart();
      await fetchCart();
      await addItem(item, 1, selectedLocation);
    } catch (error) {
      console.error('Failed to clear cart and add item:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleLoginSuccess = async () => {
    if (item && item.available) {
      try {
        await addItem(item, 1, selectedLocation);
      } catch (error) {
        console.error('Failed to add item after login:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Item not found</h2>
          <p className="text-text-secondary mb-6">{error || 'The item you are looking for does not exist.'}</p>
          <Button onClick={() => router.push('/menu')}>
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Item Details */}
      <section className="bg-background-gray min-h-screen py-6">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Image Section - Left */}
              <div className="relative h-56 md:h-auto bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">🍛</span>
                )}

                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  {item.popular && (
                    <span className="bg-warning text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Popular
                    </span>
                  )}
                  {!item.available && (
                    <span className="bg-error text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>

              {/* Content Section - Right */}
              <div className="p-6 flex flex-col">
                {/* Header */}
                <div className="mb-4">
                  <h1 className="text-2xl font-bold text-text-primary mb-1">{item.name}</h1>
                  <p className="text-sm text-text-secondary">{item.categoryName}</p>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    item.isVegetarian
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      item.isVegetarian ? 'bg-green-600' : 'bg-red-600'
                    }`} />
                    {item.isVegetarian ? 'Vegetarian' : 'Non-Veg'}
                  </span>
                  {item.spiceLevel > 0 && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1">
                      {[...Array(item.spiceLevel)].map((_, i) => (
                        <Flame key={i} className="w-2.5 h-2.5 fill-orange-600" />
                      ))}
                    </span>
                  )}
                </div>

                {/* Description */}
                {item.description && (
                  <p className="text-text-secondary text-sm leading-relaxed mb-4 flex-grow">
                    {item.description}
                  </p>
                )}

                {/* Serves People */}
                {item.servesPeople && (
                  <div className="mb-6 flex items-center gap-2 text-sm">
                    <span className="text-text-secondary">Serves:</span>
                    <span className="font-semibold text-text-primary">{item.servesPeople} people</span>
                  </div>
                )}

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">
                      S$ {item.price.toFixed(2)}
                    </span>
                    {currentQuantity > 0 && (
                      <span className="text-sm text-text-secondary">
                        × {currentQuantity} = S$ {(item.price * currentQuantity).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart Controls */}
                {currentQuantity === 0 ? (
                  <Button
                    className="w-full py-2.5 text-sm font-semibold"
                    onClick={handleAddToCart}
                    disabled={!item.available || isAdding}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {isAdding ? 'Adding...' : 'Add to Cart'}
                  </Button>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={handleDecrease}
                        disabled={isAdding}
                        className="w-9 h-9 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors flex items-center justify-center font-bold disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-center font-bold text-text-primary text-lg min-w-[50px]">
                        {currentQuantity}
                      </span>
                      <button
                        onClick={handleIncrease}
                        disabled={isAdding}
                        className="w-9 h-9 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors flex items-center justify-center font-bold disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <Button
                      className="w-full py-2.5 text-sm"
                      onClick={() => router.push('/cart')}
                    >
                      View Cart ({currentQuantity} {currentQuantity === 1 ? 'item' : 'items'})
                    </Button>
                  </div>
                )}

                {/* Back Button */}
                <button
                  onClick={() => router.back()}
                  className="w-full mt-3 py-2.5 flex items-center justify-center gap-2 text-text-secondary hover:text-primary transition-colors border border-border-light rounded-lg hover:border-primary text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Back to Menu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Type Conflict Alert Dialog */}
      <AlertDialog open={showMenuTypeAlert} onOpenChange={setShowMenuTypeAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Cart?</AlertDialogTitle>
            <AlertDialogDescription>
              Your cart contains {cart?.items[0]?.menuType || 'other'} items.
              You cannot mix {cart?.items[0]?.menuType || 'regular'} and {item.menuType} items in the same order.
              Do you want to clear your cart and add this {item.menuType} item instead?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowMenuTypeAlert(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClearCart}>
              Clear Cart & Add Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Login Sheet */}
      <LoginSheet
        open={loginSheetOpen}
        onOpenChange={setLoginSheetOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
