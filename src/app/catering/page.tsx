/**
 * Al-Arafa Restaurant - Catering Page
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import type { MenuItem, Category, Location } from '@/types';
import { MenuCard } from '@/components/menu/MenuCard';
import { CartBar } from '@/components/cart/CartBar';
import { LoginSheet } from '@/components/auth/LoginSheet';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import * as menuService from '@/lib/api/menu.service';
import * as locationService from '@/lib/api/location.service';
import * as cartService from '@/lib/api/cart.service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Default location fallback (Tampines)
const DEFAULT_LOCATION_ID = '1';

export default function CateringPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>(DEFAULT_LOCATION_ID);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitializedLocation = useRef(false);

  // Login sheet state
  const [loginSheetOpen, setLoginSheetOpen] = useState(false);

  // Catering page always shows catering items
  const menuType = 'catering' as const;

  const { cart, fetchCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Handle login prompt when user tries to add item
  const handleLoginPrompt = () => {
    setLoginSheetOpen(true);
  };

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsData = await locationService.getActiveLocations();
        if (locationsData && Array.isArray(locationsData) && locationsData.length > 0) {
          setLocations(locationsData);
          // Update selected location to first available
          setSelectedLocation(locationsData[0].id);
        } else {
          console.warn('No active locations found, using default location');
          // Keep the default location but don't set locations array
        }
      } catch (err) {
        console.error('Failed to load locations:', err);
        // Continue with default location even if API fails
        console.warn('Using default location due to API error');
      }
    };

    fetchLocations();

    // Only fetch cart if user is authenticated
    if (isAuthenticated) {
      fetchCart();
    }
  }, [fetchCart, isAuthenticated]);

  // Sync selected location with cart's locationId (only once on initial load)
  useEffect(() => {
    if (!hasInitializedLocation.current && cart && cart.locationId) {
      // For authenticated users, use cart's location
      if (isAuthenticated && cart.locationId) {
        setSelectedLocation(cart.locationId);
        hasInitializedLocation.current = true;
      } else if (!isAuthenticated && locations.length > 0) {
        // For non-authenticated users, check if cart's locationId is valid
        const cartLocationExists = locations.some(loc => loc.id === cart.locationId);
        if (cartLocationExists) {
          setSelectedLocation(cart.locationId);
        }
        hasInitializedLocation.current = true;
      }
    } else if (!hasInitializedLocation.current && !cart && locations.length > 0) {
      // No cart yet, use first location
      setSelectedLocation(locations[0].id);
      hasInitializedLocation.current = true;
    }
  }, [cart, locations, isAuthenticated]);

  // Fetch menu data when location or menuType changes
  useEffect(() => {
    if (!selectedLocation) return;

    const fetchMenu = async () => {
      try {
        // Use isMenuLoading for location changes, isInitialLoading only on first load
        if (isInitialLoading) {
          setIsInitialLoading(true);
        } else {
          setIsMenuLoading(true);
        }
        setError(null);

        console.log('Fetching catering menu data...', { menuType, locationId: selectedLocation });

        const [categoriesData, itemsData] = await Promise.all([
          menuService.getCategories(menuType),
          menuService.getMenuItems({ locationId: selectedLocation, menuType }),
        ]);

        console.log('Catering categories received:', categoriesData);
        console.log('Catering items received:', itemsData);

        // Filter to show only catering packages
        const packages = itemsData.filter(item => item.isCateringPackage === true);

        setCategories(categoriesData || []);
        setMenuItems(packages || []);
        setIsInitialLoading(false);
        setIsMenuLoading(false);
      } catch (err) {
        console.error('Failed to load catering menu:', err);
        setError(err instanceof Error ? err.message : 'Failed to load menu');
        setCategories([]);
        setMenuItems([]);
        setIsInitialLoading(false);
        setIsMenuLoading(false);
      }
    };

    fetchMenu();
  }, [selectedLocation]);

  // Group items by category
  const groupedItems = categories.reduce((acc, category) => {
    const items = menuItems.filter((item) => item.categoryId === category.id);
    if (items.length > 0) {
      acc[category.id] = {
        category,
        items,
      };
    }
    return acc;
  }, {} as Record<string, { category: Category; items: MenuItem[] }>);

  // Only show full-page loading on initial load
  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading catering menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Oops! Something went wrong</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const yOffset = -100; // Offset for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Catering Packages</h1>
              <p className="text-lg text-white/90">Customizable catering packages for your events</p>
            </div>

            {/* Location Selector for All Users */}
            {locations.length > 0 && (
              <div className="flex items-center gap-3 md:max-w-md">
                <Label htmlFor="location" className="text-sm font-medium text-white whitespace-nowrap">
                  Location:
                </Label>
                <Select
                  value={selectedLocation}
                  onValueChange={async (newLocationId) => {
                    setSelectedLocation(newLocationId);
                    // Update cart location for authenticated users
                    if (isAuthenticated && cart?.id) {
                      try {
                        await cartService.updateCartLocation(newLocationId);
                        await fetchCart(); // Refresh cart to get updated data
                      } catch (error) {
                        console.error('Failed to update cart location:', error);
                      }
                    }
                  }}
                >
                  <SelectTrigger id="location" className="h-10 bg-white text-gray-900 font-medium border-0 shadow-md hover:shadow-lg transition-shadow focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Choose a location" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="bg-white border border-gray-100 shadow-lg w-[var(--radix-select-trigger-width)] overflow-hidden">
                    {locations.map((location) => (
                      <SelectItem
                        key={location.id}
                        value={location.id}
                        className="relative flex w-full cursor-pointer select-none items-center rounded-none py-2.5 pl-9 pr-4 text-sm font-normal outline-none border-0 ring-0 focus:ring-0 focus:outline-none hover:bg-gray-50 focus:bg-gray-50 data-[state=checked]:bg-primary/5 data-[highlighted]:bg-gray-50 data-[highlighted]:outline-none data-[highlighted]:ring-0 data-[highlighted]:border-0"
                      >
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Quick Navigation */}
      {!isMenuLoading && Object.keys(groupedItems).length > 0 && (
        <div className="bg-white border-b border-border-light sticky top-16 lg:top-20 z-40 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center overflow-x-auto scrollbar-hide py-4 gap-3">
              {categories.map((category) => {
                const group = groupedItems[category.id];
                if (!group) return null;

                return (
                  <button
                    key={category.id}
                    onClick={() => scrollToCategory(category.id)}
                    className="px-5 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all flex-shrink-0 bg-background-gray text-text-primary hover:bg-primary hover:text-white border border-transparent hover:border-primary"
                  >
                    {category.name}
                    <span className="ml-2 text-xs opacity-75">({group.items.length})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Menu Items by Category */}
      <section className="py-12 pb-32 bg-background-gray min-h-screen">
        <div className="container mx-auto px-4">
          {isMenuLoading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading menu items...</p>
            </div>
          ) : Object.keys(groupedItems).length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">No catering packages available</h3>
              <p className="text-text-secondary">Please check back later or contact us for custom catering options</p>
            </div>
          ) : (
            <div className="space-y-16">
              {categories.map((category) => {
                const group = groupedItems[category.id];
                if (!group) return null;

                return (
                  <div key={category.id} id={`category-${category.id}`}>
                    {/* Category Header */}
                    <div className="mb-8">
                      <div className="flex items-center gap-4 mb-3">
                        <h2 className="text-3xl font-bold text-text-primary">
                          {category.name}
                        </h2>
                        <span className="px-4 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                          {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-text-secondary text-lg max-w-3xl">
                          {category.description}
                        </p>
                      )}
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {group.items.map((item) => (
                        <MenuCard
                          key={item.id}
                          item={item}
                          locationId={selectedLocation}
                          onLoginRequired={handleLoginPrompt}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Sticky Cart Bar */}
      <CartBar />

      {/* Login Sheet */}
      <LoginSheet
        open={loginSheetOpen}
        onOpenChange={setLoginSheetOpen}
      />
    </>
  );
}
