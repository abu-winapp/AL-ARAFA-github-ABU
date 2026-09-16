/**
 * Al-Arafa Restaurant - Settings Store
 * Global state management for application settings
 */

import { create } from "zustand";
import type {
  AllSettings,
  GSTSettings,
  LoyaltySettings,
  OrderSettings,
  CateringSettings,
  OrderHoursConfig,
  OrderTimeWindow,
} from "@/types";
import * as settingsService from "@/lib/api/settings.service";

interface SettingsState {
  // Settings data
  settings: AllSettings | null;
  gstSettings: GSTSettings | null;
  loyaltySettings: LoyaltySettings | null;
  orderSettings: OrderSettings | null;
  cateringSettings: CateringSettings | null;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Last fetch timestamp
  lastFetchTime: number | null;

  // Actions
  // updating to force to read the fresh data to avoid old chaced data
  fetchAllSettings: (force?: boolean) => Promise<void>;
  fetchGSTSettings: () => Promise<void>;
  fetchLoyaltySettings: () => Promise<void>;
  fetchOrderSettings: () => Promise<void>;
  fetchCateringSettings: () => Promise<void>;
  clearSettings: () => void;

  // Computed helpers
  getGSTRate: () => number;
  isGSTEnabled: () => boolean;
  getMinOrderForDelivery: () => number;
  getPointsPerDollar: () => number;
  getPointValue: () => number;
  getMinRedemption: () => number;
  getCateringMinLeadHours: () => number;

  // Delivery helpers
  getHomeDeliveryEnabled: () => boolean;
  getPickupEnabled: () => boolean;

  // service charge helpers

  getServiceChargeType: () => "percentage" | "fixed" | "flat" | null;
  getServiceChargeValue: () => number;
  getServiceCharge: (subtotal: number) => number;
  getGST: (amount: number) => number;

  // order hours helpers

  getOrderHours: () => OrderHoursConfig | null;
  getAcceptingOrdersNow: () => boolean;
  getOrderWindows: () => OrderTimeWindow[];
  getServerTime: () => string | null;
}

const CACHE_DURATION = 5 * 60 * 1000;

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial state
  settings: null,
  gstSettings: null,
  loyaltySettings: null,
  orderSettings: null,
  cateringSettings: null,

  isLoading: false,
  error: null,
  lastFetchTime: null,

  /**
   * Fetch all settings
   */
  fetchAllSettings: async (force = false) => {
    const state = get();
    const now = Date.now();

    // Use cached settings if still fresh (unless a fresh read was requested)
    if (
      !force &&
      state.settings &&
      state.lastFetchTime &&
      now - state.lastFetchTime < CACHE_DURATION
    ) {
      return;
    }

    try {
      set({
        isLoading: true,
        error: null,
      });

      const data = await settingsService.getAllSettings();
      console.log("Settings API Response:", data.order_hours);

      set({
        settings: data,
        isLoading: false,
        lastFetchTime: now,
      });
      console.log(
        "Stored acceptingOrdersNow:",
        get().settings?.order_hours?.acceptingOrdersNow,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch settings";

      console.error("Failed to fetch settings:", error);

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  /**
   * Fetch GST settings
   */
  fetchGSTSettings: async () => {
    try {
      set({
        isLoading: true,
        error: null,
      });

      const data = await settingsService.getGSTSettings();

      set({
        gstSettings: data,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch GST settings";

      console.error("Failed to fetch GST settings:", error);

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  /**
   * Fetch loyalty settings
   */
  fetchLoyaltySettings: async () => {
    try {
      set({
        isLoading: true,
        error: null,
      });

      const data = await settingsService.getLoyaltySettings();

      set({
        loyaltySettings: data,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch loyalty settings";

      console.error("Failed to fetch loyalty settings:", error);

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  /**
   * Fetch order settings
   */
  fetchOrderSettings: async () => {
    try {
      set({
        isLoading: true,
        error: null,
      });

      const data = await settingsService.getOrderSettings();

      set({
        orderSettings: data,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch order settings";

      console.error("Failed to fetch order settings:", error);

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  /**
   * Fetch catering settings
   */
  fetchCateringSettings: async () => {
    try {
      set({
        isLoading: true,
        error: null,
      });

      const data = await settingsService.getCateringSettings();

      set({
        cateringSettings: data,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch catering settings";

      console.error("Failed to fetch catering settings:", error);

      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  /**
   * Clear all settings
   */
  clearSettings: () => {
    set({
      settings: null,
      gstSettings: null,
      loyaltySettings: null,
      orderSettings: null,
      cateringSettings: null,
      error: null,
      lastFetchTime: null,
    });
  },

  /**
   * Get GST rate
   */
  getGSTRate: () => {
    const state = get();

    // Individual GST settings
    if (state.gstSettings?.rate !== undefined) {
      const rate = parseFloat(String(state.gstSettings.rate));
      return Number.isNaN(rate) ? 0 : rate;
    }

    // All settings
    const tax = state.settings?.tax;

    if (tax?.gstRate !== undefined) {
      const rate = parseFloat(String(tax.gstRate));
      return Number.isNaN(rate) ? 0 : rate;
    }

    // If API/type uses snake_case
    if ((tax as any)?.gst_rate !== undefined) {
      const rate = parseFloat(String((tax as any).gst_rate));
      return Number.isNaN(rate) ? 0 : rate;
    }

    return 0;
  },

  /**
   * Check if GST is enabled
   */

  /**
   * Check if GST is enabled
   *
   * API does not provide gst_enabled.
   * If a valid GST rate exists, treat GST as enabled.
   */
  isGSTEnabled: () => {
    const state = get();

    if (state.gstSettings?.enabled !== undefined) {
      return state.gstSettings.enabled === true;
    }

    if (state.settings?.tax?.gstEnabled !== undefined) {
      return state.settings.tax.gstEnabled === true;
    }

    // API response only provides gst_rate
    const gstRate = state.settings?.tax?.gstRate;

    if (gstRate !== undefined && gstRate !== null) {
      const rate = parseFloat(String(gstRate));
      return !Number.isNaN(rate) && rate > 0;
    }

    // Support snake_case API response
    const apiGstRate = (state.settings?.tax as any)?.gst_rate;

    if (apiGstRate !== undefined && apiGstRate !== null) {
      const rate = parseFloat(String(apiGstRate));
      return !Number.isNaN(rate) && rate > 0;
    }

    return false;
  },

  /**
   * Get minimum order amount for delivery
   */
  getMinOrderForDelivery: () => {
    const state = get();

    if (state.orderSettings?.min_order_delivery) {
      return parseFloat(state.orderSettings.min_order_delivery);
    }

    if (state.settings?.order?.min_order_delivery) {
      return parseFloat(state.settings.order.min_order_delivery);
    }

    return 20.0;
  },

  /**
   * Get points per dollar
   */
  getPointsPerDollar: () => {
    const state = get();

    if (state.loyaltySettings?.points_per_dollar) {
      return parseFloat(state.loyaltySettings.points_per_dollar);
    }

    if (state.settings?.loyalty?.points_per_dollar) {
      return parseFloat(state.settings.loyalty.points_per_dollar);
    }

    return 1.0;
  },

  /**
   * Get point value
   */
  getPointValue: () => {
    const state = get();

    if (state.loyaltySettings?.points_value) {
      return parseFloat(state.loyaltySettings.points_value);
    }

    if (state.settings?.loyalty?.points_value) {
      return parseFloat(state.settings.loyalty.points_value);
    }

    return 0.05;
  },

  /**
   * Get minimum redemption points
   */
  getMinRedemption: () => {
    const state = get();

    if (state.loyaltySettings?.min_redemption) {
      return parseFloat(state.loyaltySettings.min_redemption);
    }

    if (state.settings?.loyalty?.min_redemption) {
      return parseFloat(state.settings.loyalty.min_redemption);
    }

    return 100;
  },

  /**
   * Get catering minimum lead hours
   */
  getCateringMinLeadHours: () => {
    const state = get();

    if (state.cateringSettings?.min_lead_hours) {
      return parseFloat(state.cateringSettings.min_lead_hours);
    }

    if (state.settings?.catering?.min_lead_hours) {
      return parseFloat(state.settings.catering.min_lead_hours);
    }

    return 48;
  },

  /**
   * Get service charge type
   */
  getServiceChargeType: () => {
    return get().settings?.charges?.service_charge?.type ?? null;
  },

  /**
   * Get service charge value
   *
   * Percentage:
   * 5 = 5%
   *
   * Fixed / Flat:
   * 5 = S$5
   */
  getServiceChargeValue: () => {
    const value = get().settings?.charges?.service_charge?.value;

    if (value === undefined || value === null || value === "") {
      return 0;
    }

    const parsedValue = parseFloat(String(value));

    return Number.isNaN(parsedValue) ? 0 : parsedValue;
  },

  /**
   * Calculate service charge
   */
  getServiceCharge: (subtotal: number) => {
    const serviceCharge = get().settings?.charges?.service_charge;

    if (!serviceCharge) {
      return 0;
    }

    const value = parseFloat(String(serviceCharge.value));

    if (Number.isNaN(value) || value <= 0) {
      return 0;
    }

    if (serviceCharge.type === "percentage") {
      return (subtotal * value) / 100;
    }

    if (serviceCharge.type === "fixed" || serviceCharge.type === "flat") {
      return value;
    }

    return 0;
  },

  /**
   * Calculate GST
   *
   * Example:
   * amount = 100
   * GST rate
   * GST
   */
  getGST: (amount: number) => {
    const state = get();

    if (!state.isGSTEnabled()) {
      return 0;
    }

    const gstRate = state.getGSTRate();

    if (!gstRate || gstRate <= 0 || amount <= 0) {
      return 0;
    }

    return (amount * gstRate) / 100;
  },

  /**
   * Check if home delivery is enabled
   */
  getHomeDeliveryEnabled: () => {
    const value = get().settings?.delivery?.home_delivery;

    return Boolean(value);
  },

  /**
   * Check if store pickup is enabled
   */
  getPickupEnabled: () => {
    const value = get().settings?.delivery?.pick_from_store;

    return Boolean(value);
  },

  /**
   * Get full order hours configuration
   */
  getOrderHours: () => {
    return get().settings?.order_hours ?? null;
  },

  /**
   * Check if orders are currently accepted
   */

  getAcceptingOrdersNow: () => {
    return get().settings?.order_hours?.acceptingOrdersNow ?? false;
  },

  /**
   * Get all order windows
   */
  getOrderWindows: () => {
    return get().settings?.order_hours?.windows ?? [];
  },

  /**
   * Get server time
   */
  getServerTime: () => {
    return get().settings?.order_hours?.serverTime ?? null;
  },
}));
