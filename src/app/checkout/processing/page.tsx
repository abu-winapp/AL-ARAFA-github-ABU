/**
 * Al-Arafa Restaurant - Order Processing Page
 * Handles order creation and payment initiation
 * This is a dedicated page to avoid navigation issues from checkout
 */

"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/lib/store/useAuthStore";
import * as orderService from "@/lib/api/order.service";
import * as paymentService from "@/lib/api/payment.service";
import * as cartService from "@/lib/api/cart.service";
import { useCartStore } from "@/lib/store/useCartStore";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { canOpenProcessing, clearProcessing } from "@/lib/checkout/guard";
import { toast } from "@/lib/hooks/use-toast";
import type { OrderTimeWindow } from "@/types";
// Force dynamic rendering
export const dynamic = "force-dynamic";

function restaurantClosedToast() {
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

// Checks whether the current server time falls inside any order window re
const isCurrentTimeInsideWindow = (
  windows: typeof orderWindows,
  serverTime: string,
) => {
  // Convert server time into a Date object
  const currentTime = new Date(serverTime);

  // Convert current time to total minutes for easy comparison
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

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
function ProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitialized, initialize } = useAuthStore();
  const { clearCart } = useCartStore();
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  // Initialize auth store on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    console.log("Processing effect state", {
      isInitialized,
      isAuthenticated,
      orderData: sessionStorage.getItem("orderData"),
    });

    // Guard
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    if (!canOpenProcessing()) {
      router.replace("/checkout");
      return;
    }

    clearProcessing();



    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;

    // Continue with orderData...

    // Get order data
    const orderDataStr = sessionStorage.getItem("orderData");

    if (!orderDataStr) {
      console.error("No order data found");
      router.replace("/cart");
      return;
    }

    let orderData;

    try {
      orderData = JSON.parse(orderDataStr);
    } catch (e) {
      console.error("Failed to parse order data:", e);
      router.replace("/cart");
      return;
    }

    // Final fresh check before we actually create the order - accepting
    // orders / order window can change between checkout and this page.
    const verifyOrderWindowAndProcess = async () => {
      await useSettingsStore.getState().fetchAllSettings(true);

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

        // Allow a retry to re-enter this flow if the user comes back.
        hasStarted.current = false;

        setTimeout(() => {
          router.replace("/cart");
        }, 2000);

        return;
      }

      processOrder(orderData);
    };

    verifyOrderWindowAndProcess();
  }, [isAuthenticated, isInitialized, router]);

  const processOrder = async (orderData: any) => {
    try {
      // Create order
      console.log("Creating order...", {
        orderType: orderData?.orderType,
        fulfillmentType: orderData?.fulfillmentType,
        itemCount: orderData?.items?.length,
      });

      const order = await orderService.createOrder(orderData);
      console.log("Order created:", order.id);

      // Order has been created successfully.
      //  removing the temporary checkout data.
      console.log("Removing orderData");

      sessionStorage.removeItem("orderData");

      // Initiate payment
      console.log("Initiating payment...");
      const redirectUrl = `${window.location.origin}/payment/success?orderId=${order.id}`;

      const paymentResponse = await paymentService.initiatePayment({
        orderId: order.id,
        redirectUrl: redirectUrl,
        returnUrl: redirectUrl,
      });

      console.log("Payment response:", paymentResponse);

      // Extract payment URL
      let paymentUrl: string | null = null;

      if (paymentResponse.payment?.paymentUrl) {
        paymentUrl = paymentResponse.payment.paymentUrl;
      } else if (paymentResponse.payment) {
        const dataString =
          paymentResponse.payment.webhookData ||
          paymentResponse.payment.gatewayResponse;
        if (dataString) {
          const urlMatch = dataString.match(/url=(https:\/\/[^\s,}]+)/);
          if (urlMatch && urlMatch[1]) {
            paymentUrl = urlMatch[1];
          }
        }
      }

      if (!paymentUrl && paymentResponse.paymentUrl) {
        paymentUrl = paymentResponse.paymentUrl;
      }

      console.log("Extracted payment URL:", paymentUrl);

      // Clear cart before redirecting
      try {
        await cartService.clearCart();
        clearCart();
        console.log("Cart cleared successfully");
      } catch (err) {
        console.error("Failed to clear cart:", err);
        // Still clear local store even if API fails
        clearCart();
      }

      // Redirect to payment or order page
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        router.push(`/orders/${order.id}`);
      }
    } catch (error) {
      console.error("Failed to process order:", error);

      // Allow processing again if user retries
      hasStarted.current = false;

      setError(
        error instanceof Error ? error.message : "Failed to process order",
      );

      setTimeout(() => {
        router.push("/checkout");
      }, 3000);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-gray">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Order Failed</h2>
          <p className="text-text-secondary mb-4">{error}</p>
          <p className="text-sm text-text-tertiary">
            Redirecting back to checkout...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-gray">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          Processing Your Order
        </h2>
        <p className="text-text-secondary">
          Please wait while we create your order and prepare payment...
        </p>
        <p className="text-sm text-text-tertiary mt-4">
          Do not close this window
        </p>
      </div>
    </div>
  );
}

export default function ProcessingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background-gray">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Loading...
            </h2>
          </div>
        </div>
      }
    >
      <ProcessingContent />
    </Suspense>
  );
}
