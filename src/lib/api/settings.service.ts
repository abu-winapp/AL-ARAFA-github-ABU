/**
 * Al-Arafa Restaurant - Public Settings API Service
 * Customer-facing settings endpoints
 */

import apiClient from "./client";
import type {
  AllSettings,
  GSTSettings,
  LoyaltySettings,
  OrderSettings,
  CateringSettings,
} from "@/types";

/**
 * Get all settings (public endpoint)
 */
export async function getAllSettings(): Promise<AllSettings> {
  const response = await apiClient.get("/settings");

  const data = response.data.data;

  return {
    ...data,

    order_hours: data.order_hours
      ? {
          serverTime: data.order_hours.server_time,
          timezone: data.order_hours.timezone,
          acceptingOrdersNow: data.order_hours.accepting_orders_now,
          windows: data.order_hours.windows,
        }
      : undefined,
  };
}

/**
 * Get GST settings (public endpoint)
 */
export async function getGSTSettings(): Promise<GSTSettings> {
  const response = await apiClient.get("/settings/gst");
  return response.data.data;
}

/**
 * Get loyalty settings (public endpoint)
 */
export async function getLoyaltySettings(): Promise<LoyaltySettings> {
  const response = await apiClient.get("/settings/loyalty");
  return response.data.data;
}

/**
 * Get order settings (public endpoint)
 */
export async function getOrderSettings(): Promise<OrderSettings> {
  const response = await apiClient.get("/settings/order");
  return response.data.data;
}

/**
 * Get catering settings (public endpoint)
 */
export async function getCateringSettings(): Promise<CateringSettings> {
  const response = await apiClient.get("/settings/catering");
  return response.data.data;
}
