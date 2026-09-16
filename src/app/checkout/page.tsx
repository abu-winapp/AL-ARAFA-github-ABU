/**
 * Al-Arafa Restaurant - Checkout Page
 */

"use client";

import Image from "next/image";
import {
  canOpenCheckout,
  clearCheckout,
  allowProcessing,
} from "@/lib/checkout/guard";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AddressCard } from "@/components/checkout/AddressCard";
import { AddressForm } from "@/components/checkout/AddressForm";
import { CateringDatePicker } from "@/components/checkout/CateringDatePicker";
import { CateringTimeSlotSelector } from "@/components/checkout/CateringTimeSlotSelector";
import { CateringFulfillmentSection } from "@/components/checkout/CateringFulfillmentSection";
import PointsRedemptionCard from "@/components/checkout/PointsRedemptionCard";
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import type {
  UserAddress,
  SaveAddressRequest,
  Location,
  CreateOrderRequest,
  CreateOrderItem,
  OrderTimeWindow,
} from "@/types";
import * as addressService from "@/lib/api/address.service";
import * as orderService from "@/lib/api/order.service";
import * as paymentService from "@/lib/api/payment.service";
import * as locationService from "@/lib/api/location.service";
import * as cartService from "@/lib/api/cart.service";
import * as loyaltyService from "@/lib/api/loyalty.service";
import * as profileService from "@/lib/api/profile.service";
import { parseISO, differenceInHours } from "date-fns";
import type { PointsBalance } from "@/types";
import CustomerInfoDialog from "@/components/ui/CustomerInfoDialog";
import { toast } from "@/lib/hooks/use-toast";

export function restaurantClosedToast() {
  toast({
    title: (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
          <Image
            src="/images/closedIcon.svg"
            alt="Restaurant Closed"
            width={24}
            height={24}
          />
        </div>

        <div>
          <p className="font-semibold">Restaurant Closed</p>
          <p className="text-sm text-muted-foreground">
            You'll be redirected to your cart.
          </p>
        </div>
      </div>
    ),
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    fetchCart,
    getItemCount,
    getFulfillmentType,
    setFulfillmentType,
    selectedAddressId,
    selectedDeliveryQuote,
    clearCart,
    setCateringSchedule,
    getCateringSchedule,
    orderTiming,
    getAdvanceOrderSchedule,
  } = useCartStore();
  const { isAuthenticated, isInitialized, user, setUser } = useAuthStore();
  const {
    fetchAllSettings,
    getGSTRate,
    isGSTEnabled,
    getPointsPerDollar,
    getCateringMinLeadHours,
    getAcceptingOrdersNow,
    getOrderWindows,
    getServerTime,
  } = useSettingsStore();

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(
    null,
  );
  const [location, setLocation] = useState<Location | null>(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [leaveAtDoor, setLeaveAtDoor] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  // Wait for a fresh order status check before enabling checkout.

  const [orderStatusReady, setOrderStatusReady] = useState(false);

  // Catering-specific state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string | null>(
    null,
  );

  // Points redemption state
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [pointsDiscount, setPointsDiscount] = useState<number>(0);
  const [pointsBalance, setPointsBalance] = useState<PointsBalance | null>(
    null,
  );

  // Use ref to immediately track order placement (prevents timing issues with state)
  const isPlacingOrderRef = useRef(false);

  const itemCount = getItemCount();

  const menuType = cart?.items?.[0]?.menuType || "regular";
  const fulfillmentType = getFulfillmentType(
    menuType as "regular" | "catering",
  );

  // Get dynamic settings
  const gstRate = getGSTRate();
  const gstEnabled = isGSTEnabled();
  const pointsPerDollar = getPointsPerDollar();
  const cateringMinLeadHours = getCateringMinLeadHours();
  const minOrderForDelivery = useSettingsStore((state) =>
    state.getMinOrderForDelivery(),
  );

  // Checks whether the current server time falls inside any order window
  const isCurrentTimeInsideWindow = (
    windows: OrderTimeWindow[],
    serverTime: string,
  ) => {
    const currentTime = new Date(serverTime);

    const currentMinutes =
      currentTime.getHours() * 60 + currentTime.getMinutes();

    return windows.some((window) => {
      const [startHour, startMinute] = window.start.split(":").map(Number);
      const [endHour, endMinute] = window.end.split(":").map(Number);

      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    });
  };

  const orderWindows = getOrderWindows();
  const acceptingOrders = getAcceptingOrdersNow();
  const serverTime = getServerTime();

  const insideOrderWindow = serverTime
    ? isCurrentTimeInsideWindow(orderWindows, serverTime)
    : false;

  // Checkout is only enabled once we've fetched fresh settings AND the
  // restaurant is accepting orders AND we're inside the order window.
  const canCheckout =
    orderStatusReady && Boolean(acceptingOrders) && insideOrderWindow;

  // Order timing (instant vs scheduled) is tracked independently of the
  // delivery provider - selectedDeliveryQuote always holds a real provider
  // (lalamove, grab_express, ...) and its real quotation ID.
  const isAdvanceOrder = orderTiming === "scheduled";

  // Calculate total from cart values with points discount applied before GST
  const calculateTotal = () => {
    if (!cart) return 0;

    const subtotal = cart.subtotal || 0;
    // Only include delivery fee for regular menu items
    const deliveryFee =
      menuType === "regular" && fulfillmentType === "delivery"
        ? selectedDeliveryQuote?.fee || cart.deliveryFee || 0
        : 0;
    const platformFee = cart.platformFee || 0;

    const preDiscountTotal = subtotal + deliveryFee + platformFee;

    // points discount
    const discountedAmount = Math.max(0, preDiscountTotal - pointsDiscount);

    //  GST on discounted amount
    const gstAmount = gstEnabled ? discountedAmount * (gstRate / 100) : 0;

    return discountedAmount + gstAmount;
  };

  // Calculate GST amount for display
  const calculateGSTAmount = () => {
    if (!cart || !gstEnabled) return 0;

    const subtotal = cart.subtotal || 0;
    const deliveryFee =
      menuType === "regular" && fulfillmentType === "delivery"
        ? selectedDeliveryQuote?.fee || cart.deliveryFee || 0
        : 0;
    const platformFee = cart.platformFee || 0;

    const preDiscountTotal = subtotal + deliveryFee + platformFee;
    const discountedAmount = Math.max(0, preDiscountTotal - pointsDiscount);

    return discountedAmount * (gstRate / 100);
  };

  // Get maximum redeemable amount (pre-GST total)
  const getMaxRedeemableAmount = () => {
    if (!cart) return 0;

    const subtotal = cart.subtotal || 0;
    const deliveryFee =
      menuType === "regular" && fulfillmentType === "delivery"
        ? selectedDeliveryQuote?.fee || cart.deliveryFee || 0
        : 0;
    const platformFee = cart.platformFee || 0;

    return subtotal + deliveryFee + platformFee;
  };

  // model dialog for name and ph

  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(
    user?.phone ? user.phone.replace(/^\+65/, "") : "",
  );

  // useEffect to user unfo
  useEffect(() => {
    if (!user) return;

    setName(user.name || "");
    setPhone(user.phone ? user.phone.replace(/^\+65/, "") : "");

    const incomplete = !user.name?.trim() || !user.phone?.trim();

    // if (incomplete) {
    //   setCustomerDialogOpen(true);
    // }
  }, [user]);

  const hasCheckedCheckout = useRef(false);

  useEffect(() => {
    if (!isInitialized) return;

    if (hasCheckedCheckout.current) return;
    hasCheckedCheckout.current = true;

    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    if (!canOpenCheckout()) {
      router.replace("/cart");
      return;
    }
  }, [isInitialized, isAuthenticated, router]);

  // second one

  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;

    if (isPlacingOrder || isPlacingOrderRef.current) return;

    const fetchUserProfile = async () => {
      try {
        const freshUser = await profileService.getProfile();
        setUser(freshUser);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    const checkOrderStatus = async () => {
      await fetchAllSettings(true);

      const settingsState = useSettingsStore.getState();
      const stillAccepting = settingsState.getAcceptingOrdersNow();
      const freshServerTime = settingsState.getServerTime();
      const stillInsideWindow = freshServerTime
        ? isCurrentTimeInsideWindow(
            settingsState.getOrderWindows(),
            freshServerTime,
          )
        : false;

      if (!stillAccepting || !stillInsideWindow) {
        restaurantClosedToast();

        setTimeout(() => {
          router.replace("/cart");
        }, 2000);

        return;
      }

      setOrderStatusReady(true);
    };

    fetchUserProfile();
    fetchCart();
    checkOrderStatus();
    loadPointsBalance();

    if (fulfillmentType === "delivery") {
      loadAddresses();
    }
  }, [
    isInitialized,
    isAuthenticated,
    isPlacingOrder,
    fulfillmentType,
    fetchCart,
    fetchAllSettings,
    setUser,
    router,
  ]);

  // Set default fulfillment type to delivery for catering orders
  useEffect(() => {
    if (menuType === "catering" && !fulfillmentType) {
      setFulfillmentType("catering", "delivery");
    }
  }, [menuType, fulfillmentType, setFulfillmentType]);

  // Initialize scheduling state from cart store (catering orders)
  useEffect(() => {
    if (menuType === "catering") {
      const schedule = getCateringSchedule();
      setSelectedDate(schedule.selectedDate);
      setSelectedTimeRange(schedule.selectedTimeRange);
    }
  }, [menuType, getCateringSchedule]);

  // Load location when switching to pickup mode or when cart.locationId becomes available
  useEffect(() => {
    if (fulfillmentType !== "pickup") return;

    void loadLocation(cart?.locationId ?? null);
  }, [fulfillmentType, cart?.locationId]);

  const loadAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const data = await addressService.getAddresses();
      setAddresses(data);

      // Use the address selected in the menu page (from cart store)
      if (selectedAddressId) {
        const storedAddress = data.find(
          (addr) => addr.id === selectedAddressId,
        );
        if (storedAddress) {
          setSelectedAddress(storedAddress);
        } else {
          console.warn("Selected address not found in user addresses");
        }
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  //blocking the checkout if points balance fails to load, but logging the error for debugging purposes.
  const loadPointsBalance = async () => {
    try {
      const data = await loyaltyService.getPointsBalance();
      setPointsBalance(data);
    } catch (error) {
      console.error("Failed to load points balance:", error);
    }
  };
  //blocking the checkout if location fails to load, but logging the error for debugging purposes.
  const loadLocation = async (locationId: string | null) => {
    if (!locationId) {
      try {
        setIsLoadingLocation(true);
        const activeLocations = await locationService.getActiveLocations();
        const fallbackLocation = activeLocations?.[0] ?? null;
        setLocation(fallbackLocation);
      } catch (error) {
        console.error("Failed to load fallback pickup location:", error);
        setLocation(null);
      } finally {
        setIsLoadingLocation(false);
      }
      return;
    }

    try {
      setIsLoadingLocation(true);
      const data = await locationService.getLocation(locationId);
      setLocation(data);
    } catch (error) {
      console.error("Failed to load location:", error);

      try {
        const activeLocations = await locationService.getActiveLocations();
        const fallbackLocation =
          activeLocations?.find((loc) => loc.id === locationId) ??
          activeLocations?.[0] ??
          null;
        setLocation(fallbackLocation);
      } catch (fallbackError) {
        console.error(
          "Failed to load fallback pickup location:",
          fallbackError,
        );
        setLocation(null);
      }
    } finally {
      setIsLoadingLocation(false);
    }
  };
  //blocking the checkout if address fails to add, but logging the error for debugging purposes.

  const handleAddAddress = async (data: SaveAddressRequest) => {
    try {
      const newAddress = await addressService.addAddress(data);
      setAddresses([...addresses, newAddress]);
      setSelectedAddress(newAddress);
      setShowAddressForm(false);
    } catch (error) {
      console.error("Failed to add address:", error);
      throw error;
    }
  };

  // Blocking the chechout if the time is outside the order now window.

  // Handle order placement

  const handlePlaceOrder = async () => {
    // console.log("handlePlaceOrder called", {
    //   fulfillmentType,
    //   selectedAddress: !!selectedAddress,
    //   location: !!location,
    //   cart: !!cart,
    //   menuType,
    //   selectedDate,
    //   selectedTimeRange,
    // });

    // Validate based on fulfillment type
    if (fulfillmentType === "delivery" && !selectedAddress) {
      console.log("Checkout blocked: no delivery address selected");
      return;
    }
    if (fulfillmentType === "pickup" && !location) {
      console.log("Checkout blocked: no pickup location selected");
      return;
    }
    if (!cart) {
      console.log("Checkout blocked: cart is empty");
      return;
    }

    // before allowing user to order refreshing settings from store it may contain old chaced data

    // Catering-specific validations
    if (menuType === "catering") {
      // Check date and time slot selected
      if (!selectedDate || !selectedTimeRange) {
        console.log("Checkout blocked: catering date/time not selected");
        alert("Please select a date and time slot for your catering order.");
        return;
      }

      // Validate minimum lead time

      // commented the catering block for not in the usage right now 

      // const [startTime] = selectedTimeRange.split("-");
      // const scheduledDateTime = parseISO(`${selectedDate}T${startTime}:00`);
      // const now = new Date();
      // const hoursDiff = differenceInHours(scheduledDateTime, now);

      // if (hoursDiff < cateringMinLeadHours) {
      //   console.log("Checkout blocked: catering lead time not met", {
      //     hoursDiff,
      //     cateringMinLeadHours,
      //   });
      //   alert(
      //     `Catering orders require at least ${cateringMinLeadHours} hours advance notice.`,
      //   );
      //   return;
      // }

      // Check fulfillment type specific requirements
      if (fulfillmentType === "delivery" && !selectedAddress) {
        console.log("Checkout blocked: catering delivery address missing");
        alert("Please select a delivery address.");
        return;
      }

      if (fulfillmentType === "pickup" && !location) {
        console.log("Checkout blocked: catering pickup location missing");
        alert("Please select a pickup location.");
        return;
      }
    }

    // Validate minimum order for delivery (regular orders only)
    if (
      menuType === "regular" &&
      fulfillmentType === "delivery" &&
      cart.subtotal < minOrderForDelivery
    ) {
      console.log("Checkout blocked: delivery minimum order not met", {
        subtotal: cart.subtotal,
        minOrderForDelivery,
      });
      alert(
        `Minimum order for delivery is S$ ${minOrderForDelivery.toFixed(2)}. Please add S$ ${(minOrderForDelivery - cart.subtotal).toFixed(2)} more to your cart.`,
      );
      return;
    }

    // Set ref immediately to prevent any redirects
    isPlacingOrderRef.current = true;
    setIsPlacingOrder(true);
    const orderType =
      menuType === "catering"
        ? "catering"
        : isAdvanceOrder
          ? "scheduled"
          : "instant";

    // Customer contact details
    const orderContactName = user?.name;
    const orderContactPhone = user?.phone;
    const contactEmail = user?.email;

    // Order items

    const items: CreateOrderItem[] = cart.items.map((item) => ({
      menuItemId: item.menuItemId,
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.lineTotal || item.subtotal || 0,
      customizations: item.customizations || undefined,
      specialInstructions: item.specialInstructions || undefined,
    }));

    // Pricing.
    const subtotal = cart.subtotal || 0;
    const deliveryFee =
      fulfillmentType === "delivery"
        ? selectedDeliveryQuote?.fee || cart.deliveryFee || 0
        : 0;
    const platformFee = cart.platformFee || 0;

    // Pre-discount, pre-GST total
    const preDiscountTotal = subtotal + deliveryFee + platformFee;

    // Apply points discount before calculating GST (matches calculateTotal())
    const discountedAmount = Math.max(0, preDiscountTotal - pointsDiscount);
    const gstAmount = gstEnabled ? discountedAmount * (gstRate / 100) : 0;

    // Total actually charged, matching the number shown to the customer
    const total = discountedAmount + gstAmount;

    // order payload
    const orderRequest: CreateOrderRequest = {
      orderType,
      fulfillmentType,
      locationId: cart.locationId || "",
      contactName: orderContactName,
      contactPhone: orderContactPhone,
      contactEmail,
      items,
      subtotal,
      total,
      pointsRedeemed: pointsToRedeem > 0 ? pointsToRedeem : undefined,
      serviceCharge: platformFee,
    };

    // delivery details
    if (fulfillmentType === "delivery") {
      orderRequest.deliveryFee = deliveryFee;

      if (selectedAddress) {
        orderRequest.deliveryAddressId = selectedAddress.id;
        orderRequest.deliveryProvider = selectedDeliveryQuote?.provider;
        orderRequest.deliveryQuotationId = selectedDeliveryQuote?.quotationId;
        orderRequest.specialInstructions = deliveryInstructions || undefined;
        orderRequest.leaveAtDoorstep = leaveAtDoor;
      }
    }
    // scheduling
    console.log("[Checkout] menuType:", menuType);
    console.log("[Checkout] isAdvanceOrder:", isAdvanceOrder);

    if (menuType === "regular") {
      let date = "";
      let time = "";

      if (isAdvanceOrder) {
        console.log("[Checkout] Processing ADVANCE order");

        const advanceSchedule = getAdvanceOrderSchedule();

        console.log("[Checkout] Advance schedule from store:", advanceSchedule);

        if (advanceSchedule?.scheduledDate && advanceSchedule?.scheduledTime) {
          date = advanceSchedule.scheduledDate;
          time = advanceSchedule.scheduledTime;

          // If backend expects HH:mm:ss
          if (time.length === 5) {
            // Converts "16:00" -> "16:00:00"
            time = `${time}:00`;
          }

          console.log("[Checkout] Using advance date/time:", {
            date,
            time,
          });
        } else {
          console.error("[Checkout] ERROR: Advance schedule missing date/time");
          isPlacingOrderRef.current = false;
          setIsPlacingOrder(false);
          alert(
            "Your scheduled delivery time is missing. Please pick a time again.",
          );
          return;
        }
      } else {
        console.log("[Checkout] Processing ORDER NOW");

        const serverTime = useSettingsStore.getState().getServerTime();

        if (!serverTime) {
          console.error("[Checkout] Server time is unavailable");

          isPlacingOrderRef.current = false;
          setIsPlacingOrder(false);

          alert("Unable to verify server time. Please try again.");
          return;
        }

        const now = new Date(serverTime);
        const pad = (n: number) => String(n).padStart(2, "0");

        date = `${now.getFullYear()}-${pad(
          now.getMonth() + 1,
        )}-${pad(now.getDate())}`;

        time = `${pad(now.getHours())}:${pad(
          now.getMinutes(),
        )}:${pad(now.getSeconds())}`;

        // console.log("[Checkout] Generated current date/time:", {
        //   now,
        //   date,
        //   time,
        // });
      }

      // Common scheduling fields
      const scheduledDatetime = `${date} ${time}`;

      orderRequest.scheduledDate = date;
      orderRequest.scheduledTime = time;
      orderRequest.scheduledDatetime = scheduledDatetime;
      orderRequest.order_delivery_date = date;
      orderRequest.order_delivery_time = time;

      // console.log("[Checkout] Final schedule:", {
      //   scheduledDate: orderRequest.scheduledDate,
      //   scheduledTime: orderRequest.scheduledTime,
      //   scheduledDatetime: orderRequest.scheduledDatetime,
      //   order_delivery_date: orderRequest.order_delivery_date,
      //   order_delivery_time: orderRequest.order_delivery_time,
      // });
    }

    const payloadText = JSON.stringify(orderRequest, null, 2);

    // console.log(" CHECKOUT ");
    // console.log("About to save orderData");

    sessionStorage.setItem("orderData", payloadText);

    const saved = sessionStorage.getItem("orderData");

    if (!saved) {
      console.error("sessionStorage write FAILED");

      isPlacingOrderRef.current = false;
      setIsPlacingOrder(false);

      return;
    }

    console.log("Navigating to processing...");

    allowProcessing();
    router.push("/checkout/processing");
  };

  // Show loading state while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Initializing...</p>
        </div>
      </div>
    );
  }

  // After initialization, redirect if not authenticated (handled by useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // Show loading state when placing order (prevents flash of validation messages after cart is cleared)
  if (isPlacingOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-primary font-semibold text-lg">
            Processing your order...
          </p>
          <p className="text-text-secondary text-sm mt-2">
            Please wait while we redirect you to payment
          </p>
        </div>
      </div>
    );
  }

  // Show empty cart message if cart is empty (after loading)
  if (cart && itemCount === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-gray">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Your cart is empty
          </h2>
          <p className="text-text-secondary mb-6">
            Add some items to your cart before checking out.
          </p>
          <button
            onClick={() => router.push("/menu")}
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  const handleSaveCustomer = async () => {
    try {
      setIsSavingCustomer(true);

      const updatedUser = await profileService.updateProfile({
        name: name.trim(),
        phone: `+65${phone}`,
      });

      setUser(updatedUser);

      setCustomerDialogOpen(false);

      // Continue to payment automatically
      await handlePlaceOrder();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingCustomer(false);
    }
  };

  // Show loading if cart hasn't loaded yet
  if (!cart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading cart...</p>
        </div>
      </div>
    );
  }

  const handleProceedToPayment = async () => {
    await fetchAllSettings(true);

    const settingsState = useSettingsStore.getState();

    const acceptingOrders = settingsState.getAcceptingOrdersNow();

    const serverTime = settingsState.getServerTime();
    // const currentTime = new Date(serverTime);

    const orderWindows = settingsState.getOrderWindows();

    if (!serverTime) {
      toast({
        title: "Unable to verify ordering time",
        description: "Please try again.",
      });
      return;
    }

    const insideOrderWindow = isCurrentTimeInsideWindow(
      orderWindows,
      serverTime,
    );

    if (!acceptingOrders || !insideOrderWindow) {
      restaurantClosedToast();

      setTimeout(() => {
        router.replace("/cart");
      }, 2000);

      return;
    }

    // Only after server validation succeeds
    if (!user?.name?.trim() || !user?.phone?.trim()) {
      setCustomerDialogOpen(true);
      return;
    }

    await handlePlaceOrder();
  };

  return (
    <div className="min-h-screen bg-background-gray py-12 pb-32">
      <CustomerInfoDialog
        open={customerDialogOpen}
        onClose={() => setCustomerDialogOpen(false)}
        onSave={handleSaveCustomer}
        name={name}
        setName={setName}
        phone={phone}
        setPhone={setPhone}
        isSubmitting={isSavingCustomer}
      />
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-4 transition-colors"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium">Back to Cart</span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
              Checkout
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-text-secondary">Complete your order details</p>
              {/* Order Type Indicator */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  menuType === "catering"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-blue-100 text-blue-800 border border-blue-200"
                }`}
              >
                {menuType === "catering" ? (
                  <>
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Catering Order
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3.5 h-3.5"
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
                    Instant Order
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Regular Menu: Delivery Address or Pickup Location Section */}
              {menuType === "regular" && fulfillmentType === "delivery" ? (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Delivery Address
                    </h2>
                  </div>

                  {isLoadingAddresses ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : selectedAddress ? (
                    <div>
                      <p className="text-text-primary mb-2">
                        {selectedAddress.unitNumber &&
                          `#${selectedAddress.unitNumber}, `}
                        {selectedAddress.buildingName &&
                          `${selectedAddress.buildingName}, `}
                        {selectedAddress.addressLine1}
                        {selectedAddress.addressLine2 &&
                          `, ${selectedAddress.addressLine2}`}
                        {", "}Singapore {selectedAddress.postalCode}
                      </p>
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-md">
                        {selectedAddress.customLabel || selectedAddress.label}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center py-8 p-4 border-2 border-dashed border-red-300 rounded-lg">
                      <svg
                        className="w-12 h-12 text-red-400 mx-auto mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <p className="text-red-600 font-semibold mb-2">
                        No delivery address selected
                      </p>
                      <p className="text-text-secondary text-sm">
                        Please go back to the menu page and select a delivery
                        address.
                      </p>
                    </div>
                  )}
                </div>
              ) : menuType === "regular" && fulfillmentType === "pickup" ? (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Self Collect Location
                  </h2>

                  {isLoadingLocation ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : location ? (
                    <div className="p-4 border-2 border-primary bg-primary/5 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-6 h-6 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-text-primary mb-1">
                            {location.name}
                          </h3>
                          <p className="text-sm text-text-secondary mb-2">
                            {location.address}
                            {location.postalCode && `, ${location.postalCode}`}
                          </p>
                          {location.phone && (
                            <p className="text-sm text-text-secondary flex items-center gap-1">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              {location.phone}
                            </p>
                          )}
                          {location.openingTime && location.closingTime && (
                            <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                              <svg
                                className="w-4 h-4"
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
                              {location.openingTime} - {location.closingTime}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-text-secondary">
                        No pickup location selected
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Catering: Fulfillment Type Selection */}
              {menuType === "catering" && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-text-primary mb-4">
                    Delivery or Self Collect
                  </h2>
                  <CateringFulfillmentSection
                    fulfillmentType={fulfillmentType}
                    onFulfillmentChange={(type) =>
                      setFulfillmentType("catering", type)
                    }
                    selectedAddress={selectedAddress}
                    onAddressSelect={setSelectedAddress}
                    addresses={addresses}
                    location={location}
                    onAddAddress={() => setShowAddressForm(true)}
                  />
                  {showAddressForm && (
                    <div className="mt-6">
                      <AddressForm
                        onSubmit={handleAddAddress}
                        onCancel={() => setShowAddressForm(false)}
                        isLoading={isPlacingOrder}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Catering: Date Selection */}
              {menuType === "catering" && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-text-primary mb-4">
                    Select Date
                  </h2>
                  <CateringDatePicker
                    minLeadHours={cateringMinLeadHours}
                    selectedDate={selectedDate}
                    onDateSelect={(date) => {
                      setSelectedDate(date);
                      setCateringSchedule(date, selectedTimeRange || "");
                    }}
                  />
                </div>
              )}

              {/* Catering: Time Slot Selection */}
              {menuType === "catering" && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-text-primary mb-4">
                    Select Time Slot
                  </h2>
                  <CateringTimeSlotSelector
                    selectedDate={selectedDate}
                    selectedTimeRange={selectedTimeRange}
                    onTimeRangeSelect={(timeRange) => {
                      setSelectedTimeRange(timeRange);
                      setCateringSchedule(selectedDate || "", timeRange);
                    }}
                    disabled={!selectedDate}
                  />
                </div>
              )}

              {/* Delivery Instructions - Only for delivery */}
              {menuType === "regular" && fulfillmentType === "delivery" && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    Delivery Instructions
                  </h2>

                  <Input
                    placeholder="e.g., Ring the doorbell, leave at security desk"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                  />

                  <label className="flex items-center gap-2 mt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={leaveAtDoor}
                      onChange={(e) => setLeaveAtDoor(e.target.checked)}
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <span className="text-sm text-text-primary">
                      Leave at the door (contactless delivery)
                    </span>
                  </label>
                </div>
              )}

              {/* Points Redemption Card */}
              <PointsRedemptionCard
                availablePoints={pointsBalance?.currentBalance || 0}
                maxRedeemableAmount={getMaxRedeemableAmount()}
                onPointsChange={(points, discount) => {
                  setPointsToRedeem(points);
                  setPointsDiscount(discount);
                }}
                disabled={isPlacingOrder}
              />

              {/* Delivery Provider - Only for regular menu delivery orders */}
              {menuType === "regular" &&
                fulfillmentType === "delivery" &&
                selectedDeliveryQuote && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                        />
                      </svg>
                      Delivery Provider
                    </h2>

                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {selectedDeliveryQuote.providerLogo && (
                            <img
                              src={selectedDeliveryQuote.providerLogo}
                              alt={selectedDeliveryQuote.providerName}
                              className="w-10 h-10 object-contain"
                            />
                          )}
                          <div>
                            <div className="font-bold text-text-primary">
                              {selectedDeliveryQuote.providerName}
                            </div>
                            <div className="text-sm text-text-secondary">
                              Estimated:{" "}
                              {selectedDeliveryQuote.estimatedTime ||
                                `${selectedDeliveryQuote.estimatedMinutes} mins`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary text-lg">
                            S$ {selectedDeliveryQuote.fee.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Right Column - Order Summary (Sticky) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-32">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-text-primary">
                    Order Summary
                  </h2>
                  {/* Order Type Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      menuType === "catering"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-blue-100 text-blue-800 border border-blue-200"
                    }`}
                  >
                    {menuType === "catering" ? (
                      <>
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Catering
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3 h-3"
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
                        Instant
                      </>
                    )}
                  </span>
                </div>
                {/* Cart Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart?.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.itemName}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-2xl">🍛</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-text-primary text-sm truncate">
                          {item.quantity}x {item.itemName}
                        </div>
                        <div className="text-xs text-text-tertiary">
                          S$ {(item.subtotal || item.lineTotal).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-border-light">
                  <div className="flex items-center justify-between text-text-secondary text-sm">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      S$ {(cart?.subtotal ?? 0).toFixed(2)}
                    </span>
                  </div>
                  {menuType === "regular" && fulfillmentType === "delivery" && (
                    <div className="flex items-center justify-between text-text-secondary text-sm">
                      <span>Delivery Fee</span>
                      <span className="font-semibold">
                        {(selectedDeliveryQuote?.fee ??
                          cart?.deliveryFee ??
                          0) === 0 ? (
                          <span className="text-success">FREE</span>
                        ) : (
                          `S$ ${(selectedDeliveryQuote?.fee ?? cart?.deliveryFee ?? 0).toFixed(2)}`
                        )}
                      </span>
                    </div>
                  )}
                  {(cart?.platformFee ?? 0) > 0 && (
                    <div className="flex items-center justify-between text-text-secondary text-sm">
                      <span>Platform Fee</span>
                      <span className="font-semibold">
                        S$ {(cart?.platformFee ?? 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {pointsDiscount > 0 && (
                    <div className="flex items-center justify-between text-green-700 text-sm font-medium">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Points Discount
                      </span>
                      <span className="font-bold">
                        - S$ {pointsDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-text-secondary text-sm">
                    <span>GST {gstEnabled ? `(${gstRate}%)` : ""}</span>
                    <span className="font-semibold">
                      S$ {gstEnabled ? calculateGSTAmount().toFixed(2) : "0.00"}
                    </span>
                  </div>
                </div>
                {/* Total */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-text-primary">
                    Total
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      S$ {calculateTotal().toFixed(2)}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      (incl. fees and tax)
                    </div>
                  </div>
                </div>
                {/* Loyalty Points to Earn */}
                {(cart?.subtotal ?? 0) > 0 && pointsPerDollar > 0 && (
                  <div className="mb-6 pb-6 border-b border-border-light">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4 text-primary"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        You'll earn
                      </span>
                      <span className="font-semibold text-text-primary">
                        {Math.floor((cart?.subtotal ?? 0) * pointsPerDollar)}{" "}
                        Points
                      </span>
                    </div>
                  </div>
                )}
                {/* Catering Lead Time Warning */}
                {menuType === "catering" && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="text-xs text-amber-800">
                        <div className="font-semibold mb-1">
                          Advance Notice Required
                        </div>
                        <div>
                          Catering orders require at least{" "}
                          {cateringMinLeadHours} hours advance notice for
                          preparation.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Minimum Order Warning - Backup validation for delivery */}
                {menuType === "regular" &&
                  fulfillmentType === "delivery" &&
                  (cart?.subtotal ?? 0) < minOrderForDelivery && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="text-xs text-red-800">
                          <div className="font-semibold mb-1">
                            Minimum Order Not Met
                          </div>
                          <div>
                            Minimum order for delivery is S${" "}
                            {minOrderForDelivery.toFixed(2)}. Please add S${" "}
                            {(
                              minOrderForDelivery - (cart?.subtotal ?? 0)
                            ).toFixed(2)}{" "}
                            more to your cart.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                {/* Place Order Button */}
                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  onClick={(event) => {
                    event.preventDefault();

                    console.log("Proceed to Payment button clicked", {
                      fulfillmentType,
                      selectedAddress: !!selectedAddress,
                      location: !!location,
                      isPlacingOrder,
                      cartItems: cart?.items?.length ?? 0,
                    });

                    void handleProceedToPayment();
                  }}
                  disabled={
                    isPlacingOrder || !cart?.items?.length || !canCheckout
                  }
                >
                  {isPlacingOrder
                    ? "Processing..."
                    : !canCheckout
                      ? "Ordering Unavailable"
                      : "Proceed to Payment"}
                </Button>
                {fulfillmentType === "delivery" && !selectedAddress && (
                  <p className="text-xs text-error mt-3 text-center">
                    Please select a delivery address
                  </p>
                )}
                {fulfillmentType === "pickup" && !location && (
                  <p className="text-xs text-error mt-3 text-center">
                    Self Collect location not available
                  </p>
                )}
                {menuType === "regular" &&
                  fulfillmentType === "delivery" &&
                  (cart?.subtotal ?? 0) < minOrderForDelivery && (
                    <p className="text-xs text-error mt-3 text-center">
                      Minimum order of S$ {minOrderForDelivery.toFixed(2)}{" "}
                      required for delivery
                    </p>
                  )}
                {menuType === "catering" &&
                  (!selectedDate || !selectedTimeRange) && (
                    <p className="text-xs text-error mt-3 text-center">
                      Please select a date and time slot for your catering order
                    </p>
                  )}
                {/* Terms */}
                <p className="text-xs text-text-tertiary mt-4 text-center leading-relaxed">
                  By placing this order, you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms & Conditions
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
