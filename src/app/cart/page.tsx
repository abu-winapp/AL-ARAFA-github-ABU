/**
 * Al-Arafa Restaurant - Cart Page
 */

"use client";

import {
  Minus,
  Plus,
  X,
  Home,
  Truck,
  ShieldCheck,
  Clock3,
  ChevronRight,
  Utensils,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useEffect, useRef, useState } from "react";
import { useCallback } from "react";
import Link from "next/link";
import { CartItem } from "@/components/cart/CartItem";
import { DeliveryProviderSelector } from "@/components/cart/DeliveryProviderSelector";
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
import type { UserAddress } from "@/types";
import * as addressService from "@/lib/api/address.service";

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

  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);

  const [orderStatusReady, setOrderStatusReady] = useState(false);
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

  const canCheckout =
    orderStatusReady && Boolean(acceptingOrders) && insideOrderWindow;

  const checkoutDisabled =
    !canCheckout ||
    (fulfillmentType === "delivery" &&
      ((cart?.subtotal ?? 0) < minOrderForDelivery || quotesLoading));

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
    } catch (error) {
      console.error("Failed to load addresses:", error);
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

        await Promise.all([fetchCart(), loadAddresses()]);

        setOrderStatusReady(true);
      } catch (err) {
        console.error(err);
      }
    };

    init();
  }, [fetchCart, loadAddresses, fetchAllSettings]);

  useEffect(() => {
    if (!addresses.length) return;

    const selected =
      addresses.find((addr) => String(addr.id) === String(selectedAddressId)) ||
      addresses.find((addr) => addr.isDefault) ||
      addresses[0];

    setDeliveryAddress(selected);
  }, [addresses, selectedAddressId]);

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

      setShowDeliveryDialog(true);
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
      <div className="min-h-screen bg-background-gray py-12">
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
    <div className="min-h-screen bg-[#F7F4EE] py-12 pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#241F1B] md:text-4xl">
              Your Cart
            </h1>

            <p className="text-sm font-medium text-[black] md:text-base">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(360px,0.75fr)] xl:gap-10">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}

              <div className="bg-[#FFFCF8] rounded-xl shadow-md border border-[#E8E1D8] p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-[black] uppercase tracking-wide mb-1">
                    Delivery Method
                  </div>
                  <div className="font-semibold text-[#241F1B]">
                    {fulfillmentType === "delivery"
                      ? "Home Delivery"
                      : "Self Collect"}
                  </div>
                  {fulfillmentType === "delivery" && (
                    <div className="text-sm text-[black] mt-0.5 truncate">
                      {deliveryAddress
                        ? formatAddressSummary(deliveryAddress)
                        : "No delivery address selected yet"}
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

              {homeDeliveryAvailable && fulfillmentType === "delivery" && (
                <DeliveryProviderSelector deliveryAddress={deliveryAddress} />
              )}

              <Link href="/menu">
                <button className="w-full py-4 text-[#B33A2E]   hover:border-[#B33A2E] transition-all font-semibold flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Add More Items</span>
                </button>
              </Link>
            </div>

            <div>
              <div className="bg-[#FFFCF8] rounded-2xl shadow-xl p-6 lg:p-7 sticky top-32">
                <h2 className="text-xl font-bold text-[#241F1B] mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-[black]">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      S$ {cart.subtotal.toFixed(2)}
                    </span>
                  </div>

                  {menuType === "regular" &&
                    fulfillmentType === "delivery" &&
                    selectedDeliveryQuote && (
                      <div className="flex items-center justify-between text-[black]">
                        <div className="flex flex-col">
                          <span>Delivery Fee</span>
                          <span className="text-xs text-[#9A9086]">
                            via {selectedDeliveryQuote.providerName}
                            {" • "}
                            {selectedDeliveryQuote.estimatedTime}
                          </span>
                        </div>
                        <span className="font-semibold">
                          {selectedDeliveryQuote.fee === 0 ? (
                            <span className="text-[#287A52]">FREE</span>
                          ) : (
                            `S$ ${selectedDeliveryQuote.fee.toFixed(2)}`
                          )}
                        </span>
                      </div>
                    )}

                  {cart.platformFee !== undefined && cart.platformFee > 0 && (
                    <div className="flex items-center justify-between text-[black]">
                      <span>Platform Fee</span>
                      <span className="font-semibold">
                        S$ {cart.platformFee.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {serviceChargeValue > 0 && serviceCharge > 0 && (
                    <div className="flex items-center justify-between text-[black]">
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

                  <div className="flex items-center justify-between text-[black]">
                    <div className="flex flex-col">
                      <span>GST {gstEnabled ? `(${gstRate}%)` : ""}</span>
                    </div>
                    <span className="font-semibold">
                      S$ {calculatedGST.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t-2 border-[#E8E1D8] pt-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#241F1B]">
                      Total
                    </span>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#B33A2E]">
                        S$ {orderTotal.toFixed(2)}
                      </div>

                      <div className="text-xs text-[#9A9086]">
                        (incl. fees and tax)
                      </div>
                    </div>
                  </div>
                </div>

                {menuType === "regular" &&
                  fulfillmentType === "delivery" &&
                  cart.subtotal < minOrderForDelivery && (
                    <div className="mb-4 p-3 bg-[#FFF7E8] border border-[#F1D49A] rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-[#B7791F] flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="text-sm text-[#805B20]">
                          <div className="font-semibold mb-1">
                            Minimum order not met
                          </div>
                          <div>
                            Add S${" "}
                            {(minOrderForDelivery - cart.subtotal).toFixed(2)}{" "}
                            more to meet the minimum delivery order of S${" "}
                            {minOrderForDelivery.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {menuType === "catering" && (
                  <div className="mb-4 p-3 bg-[#EEF6F5] border border-[#C8E1DE] rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-[#2C716B] flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="text-sm text-[#285C58]">
                        <div className="font-semibold mb-1">Catering Order</div>
                        <div>
                          Catering orders require at least{" "}
                          {cateringMinLeadHours} hours advance notice.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* {cart.subtotal > 0 && pointsPerDollar > 0 && (
                  <div className="mb-4 p-3 bg-[#EEF7F1] border border-[#CBE2D3] rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-[#287A52]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-semibold text-[#245D43]">
                          Earn Points
                        </span>
                      </div>
                      <span className="text-sm font-bold text-[#245D43]">
                        +{Math.floor(cart.subtotal * pointsPerDollar)} points
                      </span>
                    </div>
                  </div>
                )} */}

                <Button
                  className="w-full"
                  size="lg"
                  disabled={checkoutDisabled}
                  onClick={checkoutDisabled ? undefined : handleCheckout}
                >
                  {!orderStatusReady
                    ? "Checking Order Status..."
                    : !acceptingOrders
                      ? "Restaurant Closed"
                      : !insideOrderWindow
                        ? "Outside Order Hours"
                        : fulfillmentType === "delivery" &&
                            cart.subtotal < minOrderForDelivery
                          ? "Minimum Order Not Met"
                          : fulfillmentType === "delivery" && quotesLoading
                            ? "Loading Delivery Options..."
                            : "Proceed to Checkout"}
                </Button>

                {/* reverting for testing purposes  */}
                {/* {menuType === "regular" && false ? (
                  <Button className="w-full" size="lg" disabled>
                    Ordering Unavailable
                  </Button>
                ) : (
                  <Button className="w-full" size="lg" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                )} */}

                {menuType === "regular" && !canCheckout && (
                  <div className="mt-4 rounded-xl border border-[#E8E1D8] bg-[#F8F5F0] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full ">
                        <svg
                          className="h-5 w-5 text-[#B33A2E]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>

                      <div>
                        {/* updating dynamic order hours allowing users to proceed to checkout within the timing window */}
                        <div className="mt-1 text-xs text-[black]">
                          <span className="font-medium text-[#241F1B] block">
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
                            <div className="mt-2">No order hours available</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {menuType === "regular" &&
                  fulfillmentType === "delivery" &&
                  quotesLoading && (
                    <p className="text-xs text-[#B33A2E] mt-3 text-center flex items-center justify-center gap-1">
                      <svg
                        className="w-3.5 h-3.5 animate-spin"
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

                <Link href="/menu">
                  <button className="w-full mt-3 py-3 text-[#B33A2E] hover:bg-[#B33A2E]/5 rounded-lg transition-all font-semibold text-sm">
                    Continue Ordering
                  </button>
                </Link>
              </div>
            </div>
          </div>
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
