

export interface PricingCartInput {
  subtotal?: number;
  platformFee?: number;
  /** Backend-stored delivery fee, used only as a fallback if no live quote is selected. */
  deliveryFee?: number;
}

export interface PricingDeliveryQuoteInput {
  fee: number;
}

/** Subset of useSettingsStore's getters this utility needs. */
export interface PricingSettings {
  getServiceChargeValue: () => number;
  getServiceCharge: (subtotal: number) => number;
  getGST: (amount: number) => number;
}

export interface OrderTotals {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  serviceCharge: number;
  pointsDiscount: number;
  /** Amount GST is calculated on: subtotal + deliveryFee + platformFee + serviceCharge - pointsDiscount */
  taxableAmount: number;
  gstAmount: number;
  total: number;
}

/**
 * Calculate the canonical order totals for a cart.
 *
 * Formula (applied consistently everywhere):
 *   deliveryFee   = live selected quote fee, falling back to cart.deliveryFee, only for
 *                   regular-menu delivery orders (0 otherwise)
 *   serviceCharge = settings.getServiceCharge(subtotal), only when a service charge is
 *                   configured
 *   taxableAmount = max(0, subtotal + deliveryFee + platformFee + serviceCharge - pointsDiscount)
 *   gstAmount     = settings.getGST(taxableAmount)
 *   total         = taxableAmount + gstAmount
 */
export function calculateOrderTotals(
  cart: PricingCartInput | null | undefined,
  menuType: "regular" | "catering",
  fulfillmentType: "delivery" | "pickup" | null | undefined,
  selectedDeliveryQuote: PricingDeliveryQuoteInput | null | undefined,
  settings: PricingSettings,
  pointsDiscount: number = 0,
): OrderTotals {
  const subtotal = cart?.subtotal ?? 0;

  // Delivery fee only applies to regular-menu delivery orders. Always prefer the
  // frontend-selected live quote over the backend-stored cart.deliveryFee, since the
  // latter can be stale (see the DeliveryProviderSelector expiry fix).
  const deliveryFee =
    menuType === "regular" && fulfillmentType === "delivery"
      ? (selectedDeliveryQuote?.fee ?? cart?.deliveryFee ?? 0)
      : 0;

  const platformFee = cart?.platformFee ?? 0;

  const serviceChargeValue = settings.getServiceChargeValue();
  const serviceCharge =
    subtotal > 0 && serviceChargeValue > 0
      ? settings.getServiceCharge(subtotal)
      : 0;

  const preDiscountTotal = subtotal + deliveryFee + platformFee + serviceCharge;
  const safePointsDiscount = Math.max(0, pointsDiscount || 0);
  const taxableAmount = Math.max(0, preDiscountTotal - safePointsDiscount);

  const gstAmount = settings.getGST(taxableAmount);

  const total = taxableAmount + gstAmount;

  return {
    subtotal,
    deliveryFee,
    platformFee,
    serviceCharge,
    pointsDiscount: safePointsDiscount,
    taxableAmount,
    gstAmount,
    total,
  };
}
