/**
 * Al-Arafa Restaurant - Cart Page
 */

"use client";

import {
  Plus,
  ShieldCheck,
  Clock3,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useEffect, useRef, useState } from "react";
import { useCallback } from "react";
import Link from "next/link";
import { CartItem } from "@/components/cart/CartItem";
import { DeliveryProviderSelector } from "@/components/cart/DeliveryProviderSelector";
import { OrderTimingSelector } from "@/components/cart/OrderTimingSelector";
import { FulfillmentSelector } from "@/components/menu/FulfillmentSelector";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import type { UserAddress, Location } from "@/types";
import * as addressService from "@/lib/api/address.service";
import * as locationService from "@/lib/api/location.service";
import * as cartService from "@/lib/api/cart.service";

import { allowCheckout } from "@/lib/checkout/guard";

const formatAddressSummary = (address: UserAddress): string => {
  const parts: string[] = [];
  if (address.unitNumber) parts.push(`#${address.unitNumber}`);
  if (address.buildingName) parts.push(address.buildingName);
  if (address.addressLine1) parts.push(address.addressLine1);
  parts.push(`Singapore ${address.postalCode}`);
  return parts.join(", ");
};

function CartContent() {
  const {
    cart,
    isLoading,
    fetchCart,
    getItemCount,
    getFulfillmentType,
    hasFulfillmentTypeSelected,
    selectedAddressId,
    selectedDeliveryQuote,
    quotesLoading,
    setFulfillmentType,
    orderTiming,
    getAdvanceOrderSchedule,
  } = useCartStore();

  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const handleCheckout = () => {
    // console.log("Before:", sessionStorage.getItem("checkoutAllowed"));

    allowCheckout();

    // console.log("After:", sessionStorage.getItem("checkoutAllowed"));

    if (isAuthenticated) {
      router.push("/checkout");
    } else {
      router.push("/?login=true&redirect=" + encodeURIComponent("/checkout"));
    }
  };

  const { isInitialized } = useAuthStore();

  const {
    settings,
    fetchAllSettings,
    getMinOrderForDelivery,
    getGSTRate,
    isGSTEnabled,
    getGST,
    getPointsPerDollar,
    getCateringMinLeadHours,
    getHomeDeliveryEnabled,
    getPickupEnabled,
    getServiceChargeValue,
    getServiceCharge,
    getServiceChargeType,
    getOrderWindows,
    getAcceptingOrdersNow,
    getServerTime,
  } = useSettingsStore();

  const orderWindows = getOrderWindows();
  const acceptingOrders = getAcceptingOrdersNow();

  // testing

  // storing the order windows in a variable to use in this component

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState<UserAddress | null>(
    null,
  );
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);

  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);

  const [orderStatusReady, setOrderStatusReady] = useState(false);

  // Same /cart route, two-step journey.
  const [step, setStep] = useState<"cart" | "details">("cart");

  const hasAutoOpenedDeliveryDialog = useRef(false);

  const itemCount = getItemCount();
  const menuType = cart?.items?.[0]?.menuType || "regular";
  const fulfillmentType = getFulfillmentType(
    menuType as "regular" | "catering",
  );

  const minOrderForDelivery = getMinOrderForDelivery();

  // GST settings
  const gstRate = getGSTRate();
  const gstEnabled = isGSTEnabled();

  // Service charge settings
  const serviceChargeValue = getServiceChargeValue();
  const serviceChargeType = getServiceChargeType();

  // Calculate service charge
  const serviceCharge =
    cart?.subtotal && serviceChargeValue > 0
      ? getServiceCharge(cart.subtotal)
      : 0;

  // Calculate delivery fee
  const deliveryFee =
    menuType === "regular" &&
    fulfillmentType === "delivery" &&
    selectedDeliveryQuote
      ? selectedDeliveryQuote.fee
      : 0;

  // Calculate GST taxable amount
  // GST = Subtotal + Service Charge + Platform Fee + Delivery Fee
  const taxableAmount =
    (cart?.subtotal ?? 0) +
    serviceCharge +
    (cart?.platformFee ?? 0) +
    deliveryFee;

  // Calculate GST
  const calculatedGST = gstEnabled ? getGST(taxableAmount) : 0;

  // Calculate final order total

  const orderTotal =
    (cart?.subtotal ?? 0) +
    deliveryFee +
    (cart?.platformFee ?? 0) +
    serviceCharge +
    calculatedGST;

  const pointsPerDollar = getPointsPerDollar();
  const cateringMinLeadHours = getCateringMinLeadHours();

  // 24 hours to am pm

  const formatTime = (time: string) =>
    new Date(`2000-01-01T${time}`).toLocaleTimeString("en-SG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  // Checks whether the current server time falls inside any order window
  const isCurrentTimeInsideWindow = (
    windows: typeof orderWindows,
    serverTime: string,
  ) => {
    // Convert server time into a Date object
    const currentTime = new Date(serverTime);

    // Convert current time to total minutes for easy comparison
    const currentMinutes =
      currentTime.getHours() * 60 + currentTime.getMinutes();

    // Check each configured order window
    for (const window of windows) {
      const [startHour, startMinute] = window.start.split(":").map(Number);
      const [endHour, endMinute] = window.end.split(":").map(Number);

      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      // Return true as soon as the current time is inside a window
      if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        return true;
      }
    }

    // No matching window found
    return false;
  };

  const serverTime = getServerTime();

  const insideOrderWindow = serverTime
    ? isCurrentTimeInsideWindow(orderWindows, serverTime)
    : false;

  const isAdvanceOrder = menuType === "catering" || orderTiming === "scheduled";

  const isRestaurantOpen = Boolean(acceptingOrders) && insideOrderWindow;

  const canCheckout = orderStatusReady && Boolean(acceptingOrders) && (isAdvanceOrder || insideOrderWindow);

  const isDelivery = fulfillmentType === "delivery";
  const deliveryMet =
    !isDelivery ||
    ((cart?.subtotal ?? 0) >= minOrderForDelivery && !quotesLoading);

  const advanceSchedule = getAdvanceOrderSchedule();
  const hasAdvanceTime =
    menuType === "catering" ||
    orderTiming !== "scheduled" ||
    Boolean(advanceSchedule?.scheduledDate && advanceSchedule?.scheduledTime);

  const checkoutDisabled = !canCheckout || !deliveryMet || !hasAdvanceTime;

  // const updateOrderStatus = () => {
  //   const windows = getOrderWindows();

  //   console.log("Windows:", windows);

  //   //testing

  //   // scenario 1
  //   // const acceptingOrders = false;
  //   // const insideWindow = true;

  //   // scenario 2
  //   // const acceptingOrders = true;
  //   // const insideWindow = false;

  //   // actual code

  //   const acceptingOrders = getAcceptingOrdersNow();
  //   const insideWindow = isCurrentTimeInsideWindow(windows);

  //   setOrderWindows(windows);
  //   setAcceptingOrders(acceptingOrders);
  //   setIsInsideOrderWindow(insideWindow);
  //   console.log({
  //     acceptingOrders,
  //     insideWindow,
  //   });
  // };

  // console.log({
  //   orderTiming,
  //   isOutsideOrderNowWindow,
  //   fulfillmentType,
  // });

  // Delivery settings
  const homeDeliveryAvailable = getHomeDeliveryEnabled();

  const pickFromStoreAvailable = getPickupEnabled();

  const loadAddresses = useCallback(async () => {
    try {
      const data = await addressService.getAddresses();

      setAddresses(data);

      const currentSelectedId = useCartStore.getState().selectedAddressId;

      const selected =
        data.find(
          (addr) =>
            currentSelectedId && String(addr.id) === String(currentSelectedId),
        ) ||
        data.find((addr) => addr.isDefault) ||
        data[0] ||
        null;

      setDeliveryAddress(selected);
      if (selected) {
        useCartStore.getState().setSelectedAddressId(String(selected.id));
      }
      return data;
    } catch (error) {
      console.error("Failed to load addresses:", error);
      return [];
    }
  }, []);
  // reloading the page with safe guard
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;

    const init = async () => {
      try {
        // Get fresh server time + order window first
        await fetchAllSettings(true);

        const [, userAddresses] = await Promise.all([
          fetchCart(),
          loadAddresses(),
        ]);

        // If delivery was selected but user has no saved addresses, fallback to pickup (Self Collect)
        const currentFulfillment = useCartStore
          .getState()
          .getFulfillmentType(menuType as "regular" | "catering");
        if (
          currentFulfillment === "delivery" &&
          (!userAddresses || userAddresses.length === 0)
        ) {
          setFulfillmentType(menuType as "regular" | "catering", "pickup");
        }

        setOrderStatusReady(true);
      } catch (err) {
        console.error(err);
      }
    };

    init();
  }, [fetchCart, loadAddresses, fetchAllSettings, menuType, setFulfillmentType]);

  useEffect(() => {
    if (!addresses.length) return;

    const selected =
      addresses.find((addr) => String(addr.id) === String(selectedAddressId)) ||
      addresses.find((addr) => addr.isDefault) ||
      addresses[0];

    setDeliveryAddress(selected || null);
    if (selected && String(selected.id) !== String(selectedAddressId)) {
      useCartStore.getState().setSelectedAddressId(String(selected.id));
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (fulfillmentType === "delivery" && addresses.length === 0) {
      loadAddresses();
    }
  }, [fulfillmentType, addresses.length, loadAddresses]);

  useEffect(() => {
    if (fulfillmentType === "pickup") {
      locationService
        .getActiveLocations()
        .then((locs) => {
          if (locs && locs.length > 0) {
            const found = cart?.locationId
              ? locs.find((l) => l.id === cart.locationId) || locs[0]
              : locs[0];
            setPickupLocation(found);
            if (!cart?.locationId && found) {
              // Keep the selected location locally for the UI.
              setPickupLocation(found);
            }
          }
        })
        .catch(console.error);
    }
  }, [fulfillmentType, cart?.locationId]);

  useEffect(() => {
    if (
      !hasAutoOpenedDeliveryDialog.current &&
      cart &&
      getItemCount() > 0 &&
      !hasFulfillmentTypeSelected(menuType as "regular" | "catering")
    ) {
      if (!homeDeliveryAvailable && !pickFromStoreAvailable) {
        hasAutoOpenedDeliveryDialog.current = true;
        return;
      }

      if (homeDeliveryAvailable && !pickFromStoreAvailable) {
        setFulfillmentType(menuType as "regular" | "catering", "delivery");
        hasAutoOpenedDeliveryDialog.current = true;
        return;
      }

      if (!homeDeliveryAvailable && pickFromStoreAvailable) {
        setFulfillmentType(menuType as "regular" | "catering", "pickup");
        hasAutoOpenedDeliveryDialog.current = true;
        return;
      }

      setFulfillmentType(menuType as "regular" | "catering", "pickup");
      hasAutoOpenedDeliveryDialog.current = true;
    }
  }, [
    cart,
    getItemCount,
    hasFulfillmentTypeSelected,
    menuType,
    homeDeliveryAvailable,
    pickFromStoreAvailable,
    setFulfillmentType,
  ]);

  const handleContinueToDetails = () => {
    setStep("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToCart = () => {
    setStep("cart");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">
            {!isInitialized ? "Initializing..." : "Loading your cart..."}
          </p>
        </div>
      </div>
    );
  }

  if (!cart || itemCount === 0) {
    return (
      <div className="min-h-screen bg-background-gray pt-12 pb-12 md:pt-0">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="text-8xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold text-text-primary mb-3">
              Your cart is empty
            </h1>
            <p className="text-xl text-text-secondary mb-8">
              Add some delicious items from our menu to get started!
            </p>
            <Link href="/menu">
              <Button size="lg">Browse Menu</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EE] pt-3 pb-32 md:pt-8 lg:pt-10">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1180px]">
          {step === "cart" ? (
            /*  STEP 1  */
            <div className="mx-auto w-full max-w-3xl">
              {/* Mobile Back Button */}
              <div className="mb-4 md:hidden">
                <button
                  type="button"
                  onClick={() => router.push("/menu")}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#241F1B] transition-colors hover:text-[#B33A2E]"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Back
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <h1 className="text-2xl md:text-xl lg:text-3xl">Your Cart</h1>
                </div>
                {cart.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}

                <Link href="/menu">
                  <button className="w-full rounded-xl py-4 font-semibold text-[#B33A2E] transition-all hover:bg-[#B33A2E]/5 flex items-center justify-center gap-2">
                    <Plus className="h-5 w-5" />
                    <span>Add More Items</span>
                  </button>
                </Link>

                {/* Fixed Bottom CTA */}
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8E1D8] bg-[white] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_16px_rgba(36,31,27,0.08)] md:static md:border-0 md:bg-transparent md:px-0 md:pb-0 md:pt-0 md:shadow-none">
                  <div className="mx-auto max-w-2xl">
                    <div className="mb-3 flex items-center justify-between p-2">
                      <div className="text-xl text-[#92251C]">Subtotal</div>
                      <div className="text-xl font-bold text-[#241F1B]">
                        S$ {cart.subtotal.toFixed(2)}
                      </div>
                    </div>

                    <Button
                      type="button"
                      size="lg"
                      className="h-14 w-full rounded-xl text-base font-semibold"
                      onClick={handleContinueToDetails}
                    >
                      Continue
                      <ChevronRight className="ml-1 h-5 w-5" />
                    </Button>

                    <p className="mt-2 text-center text-[11px] leading-4 text-[#9A9086]">
                      Delivery, service charges, GST, and order timing are
                      selected next.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /*  STEP 2  */
            <div className="w-full">
              {/* Mobile Back Button */}
              <div className="mb-4 md:hidden">
                <button
                  type="button"
                  onClick={handleBackToCart}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#241F1B] transition-colors hover:text-[#B33A2E]"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Back
                </button>
              </div>

              {/* Page title */}
              <div className="mb-6 flex items-center justify-center lg:mb-7">
                <h1 className="text-2xl font-semibold text-[#241F1B] md:text-3xl">
                  Delivery Option And Timing
                </h1>
              </div>

              {/* Main checkout layout */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
                {/* Left content */}
                <div className="space-y-4 lg:space-y-5">
                  {/* Fulfillment */}
                  <section className="rounded-2xl border border-[#E8E1D8] bg-[white] p-5 shadow-md md:p-6">
                    <div className="rounded-xl border border-[#E8E1D8] bg-white p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-xs font-medium uppercase tracking-wide text-black">
                            Delivery Method
                          </div>

                          <div className="mt-1 font-semibold text-[#241F1B]">
                            {fulfillmentType === "delivery"
                              ? "Home Delivery"
                              : "Self Collect"}
                          </div>

                          {fulfillmentType === "delivery" && (
                            <div className="mt-0.5 truncate text-sm text-black">
                              {deliveryAddress
                                ? formatAddressSummary(deliveryAddress)
                                : "No delivery address selected yet"}
                            </div>
                          )}

                          {fulfillmentType === "pickup" && (
                            <div className="mt-0.5 truncate text-sm text-black">
                              {pickupLocation
                                ? `${pickupLocation.name} (${pickupLocation.address})`
                                : "Self collect at store"}
                            </div>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          onClick={() => setShowDeliveryDialog(true)}
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  </section>

                  {/* Timing */}
                  {menuType === "regular" && (
                    <section className="rounded-2xl border border-[#E8E1D8] bg-[white] p-5 shadow-md md:p-6">
                      <OrderTimingSelector
                        isRestaurantOpen={isRestaurantOpen}
                      />
                    </section>
                  )}

                  {/* Catering notice */}
                  {/* {menuType === "catering" && (
                  <div className="rounded-xl border border-[#C8E1DE] bg-[#EEF6F5] p-4">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#2C716B]" />
                      <div className="text-sm text-[#285C58]">
                        <div className="mb-1 font-semibold">Catering Order</div>
                        <div>
                          Catering orders require at least{" "}
                          {cateringMinLeadHours} hours advance notice.
                        </div>
                      </div>
                    </div>
                  </div>
                )} */}

                  {/* Delivery provider */}
                  {homeDeliveryAvailable && fulfillmentType === "delivery" && (
                    <section className="rounded-2xl border border-[#E8E1D8] bg-[white] p-5 shadow-md md:p-6">
                      <div className="mb-4">

                        <p className="mt-1 text-sm text-[#9A9086]">
                          Choose the available delivery provider for your
                          address.
                        </p>
                      </div>

                      <DeliveryProviderSelector
                        deliveryAddress={deliveryAddress}
                      />
                    </section>
                  )}

                  {/* Closed / order hours */}
                  {menuType === "regular" &&
                    !isRestaurantOpen &&
                    !isAdvanceOrder && (
                      <div className="rounded-xl border border-[#E8E1D8] bg-[white] px-4 py-3">
                        <div className="flex items-start gap-3">
                          <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#B33A2E]" />

                          <div className="text-xs text-black">
                            <span className="block font-medium text-[#241F1B]">
                              Order Hours
                            </span>

                            {orderWindows.length > 0 ? (
                              orderWindows.map((window) => (
                                <div key={window.name} className="mt-2">
                                  <div className="font-medium text-[#241F1B]">
                                    {window.name}
                                  </div>
                                  <div>
                                    {formatTime(window.start)} -{" "}
                                    {formatTime(window.end)}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="mt-2">
                                No order hours available
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  {menuType === "regular" &&
                    fulfillmentType === "delivery" &&
                    quotesLoading && (
                      <p className="flex items-center justify-center gap-1 text-center text-xs text-[#B33A2E]">
                        <svg
                          className="h-3.5 w-3.5 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Finding best delivery options...
                      </p>
                    )}
                </div>

                {/* Summary */}
                <aside className="lg:sticky lg:top-28">
                  <div className="rounded-2xl border border-[#E8E1D8] bg-white p-5 shadow-[0_12px_35px_rgba(36,31,27,0.10)] lg:p-6">
                    {/* Header */}
                    <div className="mb-3 flex items-center justify-between sm:mb-5">
                      <h2 className="text-base font-bold text-[#241F1B] sm:text-lg lg:text-xl">
                        Order Summary
                      </h2>

                      <button
                        type="button"
                        onClick={handleBackToCart}
                        className="hidden text-[11px] font-semibold text-[#B33A2E] hover:underline sm:block sm:text-xs"
                      >
                        Edit Cart
                      </button>
                    </div>

                    {/* Price Breakdown */}
                    <div className="mb-3 space-y-2 sm:mb-5 sm:space-y-3 lg:space-y-4">
                      {/* Subtotal */}
                      <div className="flex items-center justify-between text-sm text-black sm:text-base">
                        <span>Subtotal</span>

                        <span className="font-semibold">
                          S$ {cart.subtotal.toFixed(2)}
                        </span>
                      </div>

                      {/* Delivery Fee */}
                      {menuType === "regular" &&
                        fulfillmentType === "delivery" &&
                        selectedDeliveryQuote && (
                          <div className="flex items-center justify-between text-sm text-black sm:text-base">
                            <div className="flex min-w-0 flex-col">
                              <span>Delivery Fee</span>

                              <span className="text-[10px] leading-tight text-[#9A9086] sm:text-xs">
                                via {selectedDeliveryQuote.providerName} •{" "}
                                {selectedDeliveryQuote.estimatedTime}
                              </span>
                            </div>

                            <span className="shrink-0 font-semibold">
                              {selectedDeliveryQuote.fee === 0 ? (
                                <span className="text-[#287A52]">FREE</span>
                              ) : (
                                `S$ ${selectedDeliveryQuote.fee.toFixed(2)}`
                              )}
                            </span>
                          </div>
                        )}

                      {/* Platform Fee */}
                      {cart.platformFee !== undefined &&
                        cart.platformFee > 0 && (
                          <div className="flex items-center justify-between text-sm text-black sm:text-base">
                            <span>Platform Fee</span>

                            <span className="font-semibold">
                              S$ {cart.platformFee.toFixed(2)}
                            </span>
                          </div>
                        )}

                      {/* Service Charge */}
                      {serviceChargeValue > 0 && serviceCharge > 0 && (
                        <div className="flex items-center justify-between text-sm text-black sm:text-base">
                          <span>
                            Service Charge{" "}
                            {serviceChargeType === "percentage"
                              ? `(${serviceChargeValue}%)`
                              : "(Flat)"}
                          </span>

                          <span className="font-semibold">
                            S$ {serviceCharge.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* GST */}
                      <div className="flex items-center justify-between text-sm text-black sm:text-base">
                        <span>GST {gstEnabled ? `(${gstRate}%)` : ""}</span>

                        <span className="font-semibold">
                          S$ {calculatedGST.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="mb-3 border-t border-[#E8E1D8] pt-3 sm:mb-5 sm:border-t-2 sm:pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-[#241F1B] sm:text-lg">
                          Total
                        </span>

                        <div className="text-right">
                          <div className="text-xl font-bold text-[#B33A2E] sm:text-2xl">
                            S$ {orderTotal.toFixed(2)}
                          </div>

                          <div className="text-[10px] text-[#9A9086] sm:text-xs">
                            incl. fees and tax
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Minimum Delivery Order Warning */}
                    {menuType === "regular" &&
                      fulfillmentType === "delivery" &&
                      cart.subtotal < minOrderForDelivery && (
                        <div className="mb-3 rounded-lg border border-[#F1D49A] bg-[#FFF7E8] p-2 sm:mb-4 sm:p-3">
                          <div className="flex items-start gap-2">
                            <svg
                              className="mt-0.5 h-4 w-4 shrink-0 text-[#B7791F] sm:h-5 sm:w-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>

                            <div className="text-[11px] leading-tight text-[#805B20] sm:text-sm sm:leading-normal">
                              <div className="mb-0.5 font-semibold sm:mb-1">
                                Minimum order not met
                              </div>

                              <div>
                                Add S{" "}
                                {(minOrderForDelivery - cart.subtotal).toFixed(
                                  2,
                                )}{" "}
                                more to meet the minimum delivery order of S{" "}
                                {minOrderForDelivery.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Checkout Button */}
                    <Button
                      className="
        h-10
        w-full
        rounded-lg
        text-sm
        sm:h-11
        sm:rounded-xl
        sm:text-base
       
      "
                      size="lg"
                      disabled={checkoutDisabled}
                      onClick={checkoutDisabled ? undefined : handleCheckout}
                    >
                      {!orderStatusReady
                        ? "Checking Order Status..."
                        : !acceptingOrders
                          ? "Restaurant Closed"
                          : !isAdvanceOrder && !insideOrderWindow
                            ? "Outside Order Hours"
                            : isAdvanceOrder && !hasAdvanceTime
                              ? "Select Date & Time"
                              : isDelivery &&
                                  cart.subtotal < minOrderForDelivery
                                ? "Minimum Order Not Met"
                                : isDelivery && quotesLoading
                                  ? "Loading Delivery Options..."
                                  : "Continue to Checkout"}
                    </Button>
                  </div>
                </aside>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Choose Delivery Method</DialogTitle>
            <DialogDescription>
              Choose Home Delivery or Self Collect for this order.
            </DialogDescription>
          </DialogHeader>

          <FulfillmentSelector
            menuType={menuType as "regular" | "catering"}
            homeDeliveryAvailable={homeDeliveryAvailable}
            pickFromStoreAvailable={pickFromStoreAvailable}
          />

          <DialogFooter>
            <Button type="button" onClick={() => setShowDeliveryDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProtectedCartPage() {
  return (
    <ProtectedRoute customerOnly>
      <CartContent />
    </ProtectedRoute>
  );
}
