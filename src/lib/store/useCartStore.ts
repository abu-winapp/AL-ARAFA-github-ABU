/**
 * Al-Arafa Restaurant - Cart Store (Zustand)
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Cart,
  CartItem,
  MenuItem,
  DeliveryQuotesResponse,
  DeliveryQuoteOption,
} from "@/types";
import * as cartService from "@/lib/api/cart.service";
import * as deliveryService from "@/lib/api/delivery.service";

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;

  // Frontend-only state (not stored in backend)
  // Store fulfillment types separately for regular and catering menus
  fulfillmentTypes: {
    regular: "delivery" | "pickup";
    catering: "delivery" | "pickup";
  };
  // Tracks whether the user has explicitly chosen a fulfillment method
  // (Home Delivery / Self Collect) for each menu type, as opposed to just
  // relying on the default. Used to decide whether the Delivery Method
  // dialog should auto-open (e.g. in the Cart).
  fulfillmentTypeSelected: {
    regular: boolean;
    catering: boolean;
  };
  selectedAddressId: number | string | null;
  selectedDeliveryQuote: DeliveryQuoteOption | null;

  // Scheduling info for catering orders
  schedulingInfo: {
    catering: {
      selectedDate: string | null; // ISO date string (YYYY-MM-DD)
      selectedTimeRange: string | null; // e.g., "10:00-12:00"
    };
  };

  // Order timing for regular (non-catering) orders.
  // This is independent of which delivery provider is selected -
  // the provider (lalamove, grab_express, ...) only represents the
  // delivery service, never the order timing.
  orderTiming: "instant" | "scheduled";

  // Advance order scheduling for regular (non-catering) orders
  // Populated when orderTiming === 'scheduled'
  advanceOrderSchedule: {
    scheduledDate: string | null; // ISO date string (YYYY-MM-DD)
    scheduledTime: string | null; // e.g., "14:30" (24h format)
  } | null;

  // Delivery quotes state
  deliveryQuotes: DeliveryQuotesResponse | null;
  quotesLoading: boolean;
  quotesError: string | null;

  // Suggested items (transient state, not persisted)
  suggestedItems: MenuItem[] | null;
  lastSuggestedItemId: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (
    menuItem: MenuItem,
    quantity: number,
    locationId: string,
  ) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => void;
  getItemCount: () => number;

  // Fulfillment type actions (frontend-only) - now menu-type specific
  getFulfillmentType: (
    menuType: "regular" | "catering",
  ) => "delivery" | "pickup";
  setFulfillmentType: (
    menuType: "regular" | "catering",
    type: "delivery" | "pickup",
  ) => void;
  // Whether the user has explicitly chosen a fulfillment method for this
  // menu type yet (as opposed to just the untouched default).
  hasFulfillmentTypeSelected: (menuType: "regular" | "catering") => boolean;
  setSelectedAddressId: (addressId: string | null) => void;

  // Delivery quote actions
  fetchDeliveryQuotes: (deliveryAddressId: string) => Promise<void>;
  selectDeliveryQuote: (quote: DeliveryQuoteOption) => void;
  clearDeliveryQuotes: () => void;

  // Catering scheduling actions
  setCateringSchedule: (date: string, timeRange: string) => void;
  clearCateringSchedule: () => void;
  getCateringSchedule: () => {
    selectedDate: string | null;
    selectedTimeRange: string | null;
  };

  // Order timing actions (regular orders) - decoupled from delivery provider
  setOrderTiming: (timing: "instant" | "scheduled") => void;
  getOrderTiming: () => "instant" | "scheduled";

  // Advance order scheduling actions (regular orders, when orderTiming is 'scheduled')
  setAdvanceOrderSchedule: (date: string, time: string) => void;
  clearAdvanceOrderSchedule: () => void;
  getAdvanceOrderSchedule: () => {
    scheduledDate: string | null;
    scheduledTime: string | null;
  } | null;

  // Suggested items actions
  setSuggestedItems: (items: MenuItem[], triggeredBy: string) => void;
  clearSuggestedItems: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      error: null,

      // Frontend-only state (persisted in localStorage)
      // Store separate fulfillment types for regular and catering menus
      fulfillmentTypes: {
        regular: "delivery",
        catering: "delivery",
      },
      // Neither menu type has an explicit user selection yet by default
      fulfillmentTypeSelected: {
        regular: false,
        catering: false,
      },
      selectedAddressId: null,
      selectedDeliveryQuote: null,

      // Scheduling info for catering orders
      schedulingInfo: {
        catering: {
          selectedDate: null,
          selectedTimeRange: null,
        },
      },

      // Order timing (regular orders) - independent of delivery provider
      orderTiming: "instant",

      // Advance order schedule (regular orders)
      advanceOrderSchedule: null,

      // Delivery quotes state
      deliveryQuotes: null,
      quotesLoading: false,
      quotesError: null,

      // Suggested items state
      suggestedItems: null,
      lastSuggestedItemId: null,

      fetchCart: async () => {
        try {
          set({ isLoading: true, error: null });
          const cart = await cartService.getCart();
          set({ cart, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch cart",
            isLoading: false,
          });
        }
      },

      addItem: async (
        menuItem: MenuItem,
        quantity: number,
        locationId: string,
      ) => {
        try {
          // Don't set global isLoading to avoid full-page refresh effect
          set({ error: null });

          // Check if cart has items with different menu type
          const { cart } = get();
          if (cart && cart.items && cart.items.length > 0) {
            // Support both new structure (flat menuType) and old structure (nested menuItem.menuType)
            const existingMenuType =
              cart.items[0].menuType || cart.items[0].menuItem?.menuType;
            if (existingMenuType && existingMenuType !== menuItem.menuType) {
              const errorMessage = `Cannot mix ${existingMenuType} and ${menuItem.menuType} items. Please clear your cart first.`;
              set({ error: errorMessage });
              throw new Error(errorMessage);
            }
          }

          const response = await cartService.addToCart({
            menuItemId: menuItem.id,
            quantity,
            locationId,
          });

          // Extract cart from the response (new API structure)
          set({ cart: response.cart });

          // Handle suggested items from API response
          // Only update suggestions if we don't already have suggestions displayed
          // This prevents clearing suggestions when adding items from the suggestions dialog
          const currentSuggestions = get().suggestedItems;
          if (
            !currentSuggestions &&
            response.suggestedItems &&
            response.suggestedItems.length > 0
          ) {
            get().setSuggestedItems(response.suggestedItems, menuItem.id);
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to add item",
          });
          throw error;
        }
      },

      updateItem: async (itemId: string, quantity: number) => {
        try {
          // Don't set global isLoading to avoid full-page refresh effect
          set({ error: null });
          if (quantity === 0) {
            const cart = await cartService.removeCartItem(itemId);
            set({ cart });
          } else {
            const cart = await cartService.updateCartItem(itemId, { quantity });
            set({ cart });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to update item",
          });
          throw error;
        }
      },

      removeItem: async (itemId: string) => {
        try {
          // Don't set global isLoading to avoid full-page refresh effect
          set({ error: null });
          const cart = await cartService.removeCartItem(itemId);
          set({ cart });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to remove item",
          });
          throw error;
        }
      },

      clearCart: () => {
        set({
          cart: null,
          error: null,
          // Clear user-specific persisted data on logout
          selectedAddressId: null,
          selectedDeliveryQuote: null,
          deliveryQuotes: null,
          orderTiming: "instant",
          advanceOrderSchedule: null,
          // Clear transient suggestions
          suggestedItems: null,
          lastSuggestedItemId: null,
        });
      },

      getItemCount: () => {
        const { cart } = get();
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => total + item.quantity, 0);
      },

      getFulfillmentType: (menuType: "regular" | "catering") => {
        return get().fulfillmentTypes[menuType];
      },

      setFulfillmentType: (
        menuType: "regular" | "catering",
        type: "delivery" | "pickup",
      ) => {
        set((state) => ({
          fulfillmentTypes: {
            ...state.fulfillmentTypes,
            [menuType]: type,
          },
          fulfillmentTypeSelected: {
            ...state.fulfillmentTypeSelected,
            [menuType]: true,
          },
        }));
      },

      hasFulfillmentTypeSelected: (menuType: "regular" | "catering") => {
        return get().fulfillmentTypeSelected[menuType];
      },

      setSelectedAddressId: (addressId: string | null) => {
        set({ selectedAddressId: addressId });
      },

      fetchDeliveryQuotes: async (deliveryAddressId: string) => {
        const { cart } = get();

        console.log("Cart Store - fetchDeliveryQuotes called:", {
          deliveryAddressId,
          cartLocationId: cart?.locationId,
        });

        if (!cart?.locationId) {
          console.error("Cart Store - No pickup location selected");
          set({ quotesError: "No pickup location selected" });
          return;
        }

        try {
          set({ quotesLoading: true, quotesError: null });

          console.log("Cart Store - Requesting quotes from API:", {
            pickupLocationId: cart.locationId,
            deliveryAddressId,
          });

          const quotes = await deliveryService.getDeliveryQuotes({
            pickupLocationId: cart.locationId,
            deliveryAddressId,
          });

          console.log("Cart Store - Quotes received from API:", quotes);

          set({ deliveryQuotes: quotes, quotesLoading: false });

          // Auto-select cheapest provider

          // if (quotes.cheapestProvider) {
          //   const cheapestQuote = quotes.options.find(
          //     (q) => q.provider === quotes.cheapestProvider && q.available,
          //   );
          //   if (cheapestQuote) {
          //     console.log(
          //       "Cart Store - Auto-selecting cheapest quote:",
          //       cheapestQuote,
          //     );
          //     get().selectDeliveryQuote(cheapestQuote);
          //   }
          // }

          // Auto-select the first available provider
          const defaultQuote = quotes.options.find((q) => q.available);

          if (defaultQuote) {
            console.log("Cart Store - Auto-selecting:", defaultQuote);
            get().selectDeliveryQuote(defaultQuote);
          }
        } catch (error) {
          console.error("Cart Store - Error fetching quotes:", error);
          set({
            quotesError:
              error instanceof Error
                ? error.message
                : "Failed to fetch delivery quotes",
            quotesLoading: false,
          });
        }
      },

      selectDeliveryQuote: (quote: DeliveryQuoteOption) => {
        // Store as frontend-only state (persisted in localStorage)
        set({
          selectedDeliveryQuote: quote,
        });
      },

      clearDeliveryQuotes: () => {
        set({
          deliveryQuotes: null,
          quotesError: null,
          quotesLoading: false,
          selectedDeliveryQuote: null,
        });
      },

      setCateringSchedule: (date: string, timeRange: string) => {
        set((state) => ({
          schedulingInfo: {
            ...state.schedulingInfo,
            catering: { selectedDate: date, selectedTimeRange: timeRange },
          },
        }));
      },

      clearCateringSchedule: () => {
        set((state) => ({
          schedulingInfo: {
            ...state.schedulingInfo,
            catering: { selectedDate: null, selectedTimeRange: null },
          },
        }));
      },

      getCateringSchedule: () => {
        return get().schedulingInfo.catering;
      },

      setOrderTiming: (timing: "instant" | "scheduled") => {
        set({ orderTiming: timing });
        // Instant orders never carry a stale schedule
        if (timing === "instant") {
          set({ advanceOrderSchedule: null });
        }
      },

      getOrderTiming: () => {
        return get().orderTiming;
      },

      setAdvanceOrderSchedule: (date: string, time: string) => {
        // Selecting a schedule always implies a scheduled order, regardless
        // of which delivery provider is currently selected.
        set({
          orderTiming: "scheduled",
          advanceOrderSchedule: { scheduledDate: date, scheduledTime: time },
        });
      },

      clearAdvanceOrderSchedule: () => {
        set({ orderTiming: "instant", advanceOrderSchedule: null });
      },

      getAdvanceOrderSchedule: () => {
        return get().advanceOrderSchedule;
      },

      setSuggestedItems: (items: MenuItem[], triggeredBy: string) => {
        set({
          suggestedItems: items,
          lastSuggestedItemId: triggeredBy,
        });
      },

      clearSuggestedItems: () => {
        set({
          suggestedItems: null,
          lastSuggestedItemId: null,
        });
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        fulfillmentTypes: state.fulfillmentTypes,
        fulfillmentTypeSelected: state.fulfillmentTypeSelected,
        selectedAddressId: state.selectedAddressId,
        selectedDeliveryQuote: state.selectedDeliveryQuote,
        schedulingInfo: state.schedulingInfo,
        orderTiming: state.orderTiming,
        advanceOrderSchedule: state.advanceOrderSchedule,
      }),
    },
  ),
);
