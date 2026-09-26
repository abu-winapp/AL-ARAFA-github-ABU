/**
 * Al-Arafa Restaurant - Menu Page
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

import type { MenuItem, Category, Location } from "@/types";

import { MenuCard } from "@/components/menu/MenuCard";
import { CartBar } from "@/components/cart/CartBar";
import { FulfillmentSelector } from "@/components/menu/FulfillmentSelector";
import { LoginSheet } from "@/components/auth/LoginSheet";
import { SuggestionsDialog } from "@/components/cart/SuggestionsDialog";

import { useCartStore } from "@/lib/store/useCartStore";
import { useAuthStore } from "@/lib/store/useAuthStore";

import * as menuService from "@/lib/api/menu.service";
import * as locationService from "@/lib/api/location.service";
const ContactHero = "/images/contactushero.png";


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { useSettingsStore } from "@/lib/store/useSettingsStore";


const menuPageHero = '/images/menupagehero.png';


// Default location fallback
const DEFAULT_LOCATION_ID = "1";

function MenuPageContent() {
  const { getHomeDeliveryEnabled, getPickupEnabled } =
    useSettingsStore();

  const homeDeliveryAvailable = getHomeDeliveryEnabled();
  const pickFromStoreAvailable = getPickupEnabled();

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [selectedLocation, setSelectedLocation] =
    useState<string>(DEFAULT_LOCATION_ID);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMenuLoading, setIsMenuLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const hasInitializedLocation = useRef(false);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const categoryPillsRef = useRef<Record<string, HTMLButtonElement | null>>({});

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (
    direction: "left" | "right"
  ) => {
    categoryScrollRef.current?.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  // Login sheet
  const [loginSheetOpen, setLoginSheetOpen] =
    useState(false);

  // Suggestions dialog
  const [showSuggestionsDialog, setShowSuggestionsDialog] =
    useState(false);

  // Force fulfillment selector refresh after login
  const [fulfillmentKey, setFulfillmentKey] = useState(0);

  // Menu page always shows regular items
  const menuType = "regular" as const;

  const {
    cart,
    fetchCart,
    suggestedItems,
    clearSuggestedItems,
    setFulfillmentType,
  } = useCartStore();

  const { isAuthenticated } = useAuthStore();

  const searchParams = useSearchParams();

  // Handle login prompt
  const handleLoginPrompt = () => {
    setLoginSheetOpen(true);
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    setFulfillmentKey((prev) => prev + 1);
    fetchCart();
  };

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsData =
          await locationService.getActiveLocations();

        if (
          locationsData &&
          Array.isArray(locationsData) &&
          locationsData.length > 0
        ) {
          setLocations(locationsData);
          setSelectedLocation(locationsData[0].id);
        } else {
          console.warn(
            "No active locations found, using default location"
          );
        }
      } catch (err) {
        console.error(
          "Failed to load locations:",
          err
        );

        console.warn(
          "Using default location due to API error"
        );
      }
    };

    fetchLocations();

    if (isAuthenticated) {
      fetchCart();
    }
  }, [fetchCart, isAuthenticated]);

  // Set fulfillment type from query parameter
  useEffect(() => {
    const type = searchParams.get("type");

    if (
      type === "delivery" ||
      type === "pickup"
    ) {
      setFulfillmentType(menuType, type);
    }
  }, [
    searchParams,
    menuType,
    setFulfillmentType,
  ]);

  // Sync selected location with cart
  useEffect(() => {
    if (
      !hasInitializedLocation.current &&
      cart &&
      cart.locationId
    ) {
      if (
        isAuthenticated &&
        cart.locationId
      ) {
        setSelectedLocation(cart.locationId);
        hasInitializedLocation.current = true;
      } else if (
        !isAuthenticated &&
        locations.length > 0
      ) {
        const cartLocationExists =
          locations.some(
            (loc) => loc.id === cart.locationId
          );

        if (cartLocationExists) {
          setSelectedLocation(cart.locationId);
        }

        hasInitializedLocation.current = true;
      }
    } else if (
      !hasInitializedLocation.current &&
      !cart &&
      locations.length > 0
    ) {
      setSelectedLocation(locations[0].id);
      hasInitializedLocation.current = true;
    }
  }, [
    cart,
    locations,
    isAuthenticated,
  ]);

  // Auto-open suggestions
  useEffect(() => {
    if (
      suggestedItems &&
      suggestedItems.length > 0
    ) {
      setShowSuggestionsDialog(true);
    }
  }, [suggestedItems]);

  // Handle suggestions close
  const handleSuggestionsDialogClose = (
    open: boolean
  ) => {
    setShowSuggestionsDialog(open);

    if (!open) {
      clearSuggestedItems();
    }
  };

  // Fetch menu
  useEffect(() => {
    if (!selectedLocation) return;

    const fetchMenu = async () => {
      try {
        if (isInitialLoading) {
          setIsInitialLoading(true);
        } else {
          setIsMenuLoading(true);
        }

        setError(null);

        console.log("Fetching menu data...", {
          menuType,
          locationId: selectedLocation,
        });

        const [
          categoriesData,
          itemsData,
        ] = await Promise.all([
          menuService.getCategories(menuType),

          menuService.getMenuItems({
            locationId: selectedLocation,
            menuType,
          }),
        ]);

        console.log(
          "Categories received:",
          categoriesData
        );

        console.log(
          "Menu items received:",
          itemsData
        );

        setCategories(categoriesData || []);
        setMenuItems(itemsData || []);

        setIsInitialLoading(false);
        setIsMenuLoading(false);
      } catch (err) {
        console.error(
          "Failed to load menu:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load menu"
        );

        setCategories([]);
        setMenuItems([]);

        setIsInitialLoading(false);
        setIsMenuLoading(false);
      }
    };

    fetchMenu();
  }, [selectedLocation]);

  // Group items by category
  const groupedItems = categories.reduce(
    (acc, category) => {
      const items = menuItems.filter(
        (item) =>
          item.categoryId === category.id
      );

      if (items.length > 0) {
        acc[category.id] = {
          category,
          items,
        };
      }

      return acc;
    },
    {} as Record<
      string,
      {
        category: Category;
        items: MenuItem[];
      }
    >
  );

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(`category-${categoryId}`);

    if (element) {
      const isMobile = window.innerWidth < 768;
      const yOffset = isMobile ? -60 : -140;

      const y =
        element.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      window.scrollTo({
        top: Math.max(0, y),
        behavior: "smooth",
      });

      const pill = categoryPillsRef.current[categoryId];
      if (pill) {
        pill.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  };

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (
      !categoryParam ||
      isInitialLoading ||
      isMenuLoading ||
      categories.length === 0
    ) {
      return;
    }

    const targetCategory = categories.find(
      (c) =>
        c.id === categoryParam ||
        c.name.toLowerCase() === categoryParam.toLowerCase() ||
        c.id.toLowerCase() === categoryParam.toLowerCase()
    );

    if (targetCategory) {
      setActiveCategory(targetCategory.id);

      const timer = setTimeout(() => {
        scrollToCategory(targetCategory.id);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [searchParams, isInitialLoading, isMenuLoading, categories]);

  useEffect(() => {
    if (isMenuLoading || isInitialLoading || categories.length === 0) return;

    const handleScroll = () => {
      const isMobile = window.innerWidth < 768;
      const scrollPosition = window.scrollY + (isMobile ? 120 : 200);

      if (window.scrollY < 200) {
        setActiveCategory("all");
        return;
      }

      for (let i = categories.length - 1; i >= 0; i--) {
        const cat = categories[i];
        const el = document.getElementById(`category-${cat.id}`);
        if (el) {
          const top = el.getBoundingClientRect().top + window.pageYOffset;
          if (scrollPosition >= top) {
            setActiveCategory(cat.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMenuLoading, isInitialLoading, categories]);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-text-secondary">
            Loading menu...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">
        <div className="text-center max-w-md px-6">

          <div className="text-6xl mb-4">
            😕
          </div>

          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Oops! Something went wrong
          </h2>

          <p className="text-text-secondary mb-6">
            {error}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all"
          >
            Try Again
          </button>

        </div>
      </div>
    );
  }

return (
  <>
   

{/* 
    MENU HERO
 */}

<section className="relative overflow-hidden bg-[#4d0907] text-white">
  {/* Background */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: `url(${menuPageHero})`,
    }}
  />

  {/* Dark overlay */}
  <div className="absolute inset-0 bg-[#4d0907]/65" />

  {/* Hero content */}
  {/* <div className="relative z-10 mx-auto flex min-h-[260px] w-full max-w-[1500px] items-center justify-center px-5 py-8 sm:min-h-[280px] sm:px-6 sm:py-10 lg:px-8">
    {isAuthenticated ? (
      <div className="w-full max-w-[720px]">
        <FulfillmentSelector
          key={fulfillmentKey}
          menuType="regular"
          onLocationChange={setSelectedLocation}
          homeDeliveryAvailable={homeDeliveryAvailable}
          pickFromStoreAvailable={pickFromStoreAvailable}
        />
      </div>
    ) : (
      locations.length > 0 && (
        <div className="w-full max-w-[620px] rounded-2xl border border-white/15 bg-black/25 p-3 shadow-xl backdrop-blur-md sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z"
                  />
                  <circle cx="12" cy="11" r="2.5" />
                </svg>
              </div>

              <div>
                <p className="text-xs text-white/60">
                  Collect from
                </p>

                <p className="text-sm font-semibold text-white">
                  {locations.find(
                    (location) => location.id === selectedLocation
                  )?.name || "Choose a location"}
                </p>
              </div>
            </div>

            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              <SelectTrigger className="h-11 flex-1 border-white/15 bg-white text-gray-900 shadow-none">
                <SelectValue placeholder="Choose a location" />
              </SelectTrigger>

              <SelectContent>
                {locations.map((location) => (
                  <SelectItem
                    key={location.id}
                    value={location.id}
                  >
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    )}
  </div> */}

<section className="relative h-[10vh] min-h-[100px] overflow-hidden bg-[#4d0907] text-white md:min-h-[180px] md:pt-[80px] lg:min-h-[188px] lg:pt-[88px]">
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: `url(${ContactHero})`,
    }}
  />

  <div className="absolute inset-0 bg-gradient-to-r from-[#430705]/95 via-[#650b08]/80 to-[#74100c]/25" />

  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#4d0907]/80 to-transparent" />
<div
  className="
    relative z-10
    mx-auto
    flex h-full w-full
    max-w-[1650px]
    items-center
    justify-center
    px-5
    text-center

    sm:px-6
    md:px-8
    lg:px-10
    xl:px-12
    2xl:px-16
  "
>
  <div className="w-full max-w-[680px]">
    <p
      className="
        mb-2
        text-[clamp(0.7rem,1.2vw,0.95rem)]
        font-semibold
        uppercase
        tracking-[0.3em]
        text-[#f4d27a]

        sm:mb-3
      "
    >
      Al Arafa Cuisine Menu
    </p>
  </div>
</div>

  {/* Curved transition */}

</section>

</section>


    {/* 
        CATEGORY NAVIGATION
     */}
    {!isMenuLoading && Object.keys(groupedItems).length > 0 && (
      <div className="sticky top-0 z-40 border-b border-black/5 bg-white/95 shadow-sm backdrop-blur-md md:top-16 lg:top-20">
        <div className="relative mx-auto w-full max-w-[1500px] px-3 sm:px-6 lg:px-8">
          {/* Desktop left arrow */}
          <button
            type="button"
            onClick={() => scrollCategories("left")}
            className="absolute left-2 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-[#92251C] shadow-md transition-all hover:bg-[#92251C] hover:text-white md:flex"
            aria-label="Scroll categories left"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Left fade */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent sm:w-12" />

          {/* Categories */}
          <div
            ref={categoryScrollRef}
            className="scrollbar-hide flex items-center gap-2 overflow-x-auto py-2 px-1 sm:gap-3 md:px-12"
          >
            {/* All */}
            <button
              type="button"
              onClick={() => {
                setActiveCategory("all");
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                activeCategory === "all"
                  ? "bg-[#92251C] text-white shadow-sm"
                  : "bg-[#f5f1eb] text-[#211a16] hover:bg-[#92251C] hover:text-white"
              }`}
            >
              All
            </button>

            {categories.map((category) => {
              const group = groupedItems[category.id];

              if (!group) return null;

              const isActive = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  ref={(el) => {
                    categoryPillsRef.current[category.id] = el;
                  }}
                  type="button"
                  onClick={() => scrollToCategory(category.id)}
                  className={`flex shrink-0 items-center whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#92251C] text-white shadow-sm"
                      : "bg-[#f5f1eb] text-[#211a16] hover:bg-[#92251C] hover:text-white"
                  }`}
                >
                  {category.name}

                  <span
                    className={`ml-1.5 text-xs ${
                      isActive ? "text-white/80" : "opacity-60"
                    }`}
                  >
                    {group.items.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right fade */}
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent sm:w-12" />

          {/* Desktop right arrow */}
          <button
            type="button"
            onClick={() => scrollCategories("right")}
            className="absolute right-2 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-[#92251C] shadow-md transition-all hover:bg-[#92251C] hover:text-white md:flex"
            aria-label="Scroll categories right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    )}

    {/* 
        MENU
     */}
    <section className="min-h-screen bg-[#faf7f2] px-0 pt-5 pb-32 sm:pt-7 md:pt-0">
      <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-6 lg:px-8">
        {isMenuLoading ? (
          /* Loading */
          <div className="flex flex-col items-center justify-center py-24">
            <div className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#92251C] border-t-transparent" />

            <p className="text-sm text-[#6b625c]">
              Loading menu items...
            </p>
          </div>
        ) : Object.keys(groupedItems).length === 0 ? (
          /* Empty */
          <div className="mx-auto max-w-md py-24 text-center">
            <div className="mb-5 text-6xl">🍽️</div>

            <h3 className="mb-2 text-2xl font-bold text-[#211a16]">
              No items available
            </h3>

            <p className="text-sm leading-6 text-[#6b625c]">
              Please check back later or try a different location.
            </p>
          </div>
        ) : (
          /* Categories */
          <div className="space-y-14 sm:space-y-16 lg:space-y-20">
            {categories.map((category) => {
              const group = groupedItems[category.id];

              if (!group) return null;

              return (
                <section
                  key={category.id}
                  id={`category-${category.id}`}
                  className="scroll-mt-20 md:scroll-mt-36 lg:scroll-mt-40"
                >
                  {/* Category heading */}
                  <div className="mb-6 sm:mb-7">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold tracking-tight text-[#211a16] sm:text-3xl">
                        {category.name}
                      </h2>

                      <span className="rounded-full bg-[#92251C]/10 px-2.5 py-1 text-xs font-semibold text-[#92251C]">
                        {group.items.length}
                      </span>
                    </div>

                    {category.description && (
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b625c] sm:text-base">
                        {category.description}
                      </p>
                    )}
                  </div>

                  {/* Food grid */}
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                    {group.items.map((item) => (
                      <MenuCard
                        key={item.id}
                        item={item}
                        locationId={selectedLocation}
                        onLoginRequired={handleLoginPrompt}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </section>

    {/* 
        STICKY CART
     */}
    <CartBar />

    {/* 
        LOGIN
     */}
    <LoginSheet
      open={loginSheetOpen}
      onOpenChange={setLoginSheetOpen}
      onLoginSuccess={handleLoginSuccess}
    />

    {/* 
        SUGGESTIONS
     */}
    <SuggestionsDialog
      open={showSuggestionsDialog}
      onOpenChange={handleSuggestionsDialogClose}
      suggestions={suggestedItems || []}
      locationId={selectedLocation}
    />
  </>
);

}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#faf7f2]">

          <div className="text-center">

            <div className="w-14 h-14 border-4 border-[#92251C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />

            <p className="text-text-secondary">
              Loading menu...
            </p>

          </div>

        </div>
      }
    >
      <MenuPageContent />
    </Suspense>
  );
}