/**
 * Al-Arafa Restaurant - Sticky Bottom Cart Bar Component
 */

"use client";

import { FC, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/useCartStore";
import {
  useAuthStore,
  isCustomerAuthenticated as isCustomerAuth,
} from "@/lib/store/useAuthStore";
import { useSettingsStore } from "@/lib/store/useSettingsStore";

export const CartBar: FC = () => {
  const { cart, getItemCount } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { fetchAllSettings, isGSTEnabled } = useSettingsStore();

  // Fetch settings on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllSettings();
    }
  }, [isAuthenticated, fetchAllSettings]);

  // Only show cart bar for authenticated customer users (not admin)
  const isCustomerAuthenticated = isCustomerAuth(user, isAuthenticated);

  const itemCount = getItemCount();
  const gstEnabled = isGSTEnabled();

  // Calculate total: use API total if provided, otherwise calculate from subtotal + fees
  const subtotal = cart?.subtotal || 0;
  const deliveryFee = cart?.deliveryFee || 0;
  const platformFee = cart?.platformFee || 0;
  const gstAmount = gstEnabled ? cart?.gstAmount || 0 : 0;
  const total = cart?.total || subtotal + deliveryFee + platformFee + gstAmount;

  // Debug: Log cart values to console
  if (cart && process.env.NODE_ENV === "development") {
    console.log("CartBar - Cart values:", {
      subtotal: cart.subtotal,
      deliveryFee: cart.deliveryFee,
      platformFee: cart.platformFee,
      gstAmount: cart.gstAmount,
      total: cart.total,
      calculatedTotal: total,
      locationId: cart.locationId,
      fulfillmentType: cart.fulfillmentType,
    });
  }

  // Don't show cart bar if user is not a customer or not authenticated
  if (!isCustomerAuthenticated || itemCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-primary shadow-2xl z-50 animate-slide-up">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Cart Summary */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="absolute -top-1 -right-1 bg-secondary text-background-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            </div>
            <div>
              <div className="text-sm text-text-secondary">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </div>
              <div className="text-xl font-bold text-primary">
                S$ {total.toFixed(2)}
              </div>
            </div>
          </div>

          {/* View Cart Button */}
          <Link
            href="/cart"
            className="bg-primary text-white hover:text-white visited:text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all transform hover:scale-105 shadow-lg inline-flex items-center gap-2 group"
          >
            <span>View Cart</span>
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};
