/**
 * Al-Arafa Restaurant - Delivery Provider Selector Component
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { useCartStore } from "@/lib/store/useCartStore";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import OrderTimeDialog from "@/components/ui/OrderTimeDialog";
import type { DeliveryQuoteOption, UserAddress } from "@/types";
import { Clock, Truck, AlertCircle, Loader2 } from "lucide-react";

type OrderType = "now" | "advance";

interface DeliveryProviderSelectorProps {
  deliveryAddress: UserAddress | null;
}

export function DeliveryProviderSelector({
  deliveryAddress,
}: DeliveryProviderSelectorProps) {
  const {
    cart,
    getFulfillmentType,
    deliveryQuotes,
    quotesLoading,
    quotesError,
    selectedDeliveryQuote,
    fetchDeliveryQuotes,
    selectDeliveryQuote,
    orderTiming,
    getAdvanceOrderSchedule,
    setAdvanceOrderSchedule,
    clearAdvanceOrderSchedule,
  } = useCartStore();

  const [showOrderTimeDialog, setShowOrderTimeDialog] = useState(false);
  const [orderTimeType, setOrderTimeType] = useState<OrderType>("advance");
  const [selectedOrderDate, setSelectedOrderDate] = useState<Dayjs | null>(
    dayjs().hour(19).minute(30),
  );
  const [selectedOrderSlot, setSelectedOrderSlot] = useState("");
  const [selectedOrderDeliveryTime, setSelectedOrderDeliveryTime] =
    useState("");

  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const expiryCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Determine menuType from cart items
  const menuType = cart?.items?.[0]?.menuType;

  // Only show for regular menu items with delivery
  const fulfillmentType = useCartStore(
    (state) => state.fulfillmentTypes.regular,
  );

  const shouldShow =
    cart &&
    cart.items &&
    cart.items.length > 0 &&
    menuType === "regular" &&
    fulfillmentType === "delivery" &&
    deliveryAddress;

  // Fetch quotes only when delivery address ID changes (not when cart items change)
  // This prevents unnecessary re-fetching when items are added/removed from cart
  // useEffect(() => {
  //   if (shouldShow && deliveryAddress) {
  //     fetchDeliveryQuotes(deliveryAddress.id);
  //   }

  //   // Cleanup on unmount
  //   return () => {
  //     if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  //     if (expiryCheckIntervalRef.current) clearInterval(expiryCheckIntervalRef.current);
  //   };
  // }, [deliveryAddress?.id, fetchDeliveryQuotes]);

  useEffect(() => {
    if (!shouldShow || !deliveryAddress) return;

    fetchDeliveryQuotes(deliveryAddress.id);

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      if (expiryCheckIntervalRef.current)
        clearInterval(expiryCheckIntervalRef.current);
    };
  }, [shouldShow, deliveryAddress?.id, fetchDeliveryQuotes]);

  // Monitor quote expiry and auto-refresh
  // const checkExpiry = useCallback(() => {
  //   if (!deliveryQuotes?.options || deliveryQuotes.options.length === 0) return;

  //   if (!selectedDeliveryQuote) return;

  //   const expiresAt = new Date(selectedDeliveryQuote.expiresAt).getTime();
  //   const now = Date.now();
  //   const timeLeft = expiresAt - now;

  //   setTimeUntilExpiry(timeLeft);

  //   // Refresh at 30 seconds before expiry
  //   if (timeLeft > 0 && timeLeft <= 30000 && !refreshTimerRef.current) {
  //     refreshTimerRef.current = setTimeout(() => {
  //       if (deliveryAddress) {
  //         fetchDeliveryQuotes(deliveryAddress.id);
  //         refreshTimerRef.current = null;
  //       }
  //     }, timeLeft - 30000);
  //   }

  //   // If expired, refresh immediately
  //   if (timeLeft <= 0 && deliveryAddress) {
  //     fetchDeliveryQuotes(deliveryAddress.id);
  //   }
  // }, [deliveryQuotes, selectedDeliveryQuote, deliveryAddress, fetchDeliveryQuotes]);

  // useEffect(() => {
  //   if (deliveryQuotes?.options && selectedDeliveryQuote) {
  //     // Check expiry every 10 seconds
  //     expiryCheckIntervalRef.current = setInterval(checkExpiry, 10000);
  //     checkExpiry(); // Check immediately

  //     return () => {
  //       if (expiryCheckIntervalRef.current) {
  //         clearInterval(expiryCheckIntervalRef.current);
  //       }
  //     };
  //   }
  // }, [deliveryQuotes, selectedDeliveryQuote, checkExpiry]);

  const handleSelectProvider = (quote: DeliveryQuoteOption) => {
    if (!quote.available) return;
    // Selecting a delivery provider never changes when the order is fulfilled -
    // orderTiming/advanceOrderSchedule are managed independently below.
    selectDeliveryQuote(quote);
  };

  const handleOrderNowClick = () => {
    clearAdvanceOrderSchedule();
  };

  const handleScheduleClick = () => {
    setOrderTimeType("advance");
    setShowOrderTimeDialog(true);
  };

  const handleRetry = () => {
    if (deliveryAddress) {
      fetchDeliveryQuotes(deliveryAddress.id);
    }
  };

  // Don't render if conditions not met
  if (!shouldShow) return null;

  // No address selected
  if (!deliveryAddress) {
    return (
      <div className="mb-6">
        <Alert variant="default" className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">Delivery address required</h4>
            <p className="text-sm">
              Please add a delivery address to see delivery options.
            </p>
          </div>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (quotesLoading) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Delivery Options
        </h3>
        <Card className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-text-secondary">
              Finding best delivery options...
            </span>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (quotesError) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Delivery Options
        </h3>
        <Alert variant="destructive" className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold mb-1">
              Unable to get delivery quotes
            </h4>
            <p className="text-sm mb-3">{quotesError}</p>
            <button
              onClick={handleRetry}
              className="text-sm font-semibold underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </Alert>
      </div>
    );
  }

  
  // No quotes available
  if (!deliveryQuotes?.options || deliveryQuotes?.options.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Delivery Options
        </h3>
        <Alert variant="default">
          <AlertCircle className="h-5 w-5" />
          <div>
            <h4 className="font-semibold mb-1">
              No delivery providers available
            </h4>
            <p className="text-sm">
              Standard delivery will be used for your order.
            </p>
          </div>
        </Alert>
      </div>
    );
  }

  //useffect to select the lalamove selected default if no provider is selected

  const availableOptions = deliveryQuotes?.options ?? [];
  const advanceSchedule = getAdvanceOrderSchedule();
  const scheduleLabel =
    advanceSchedule?.scheduledDate && advanceSchedule?.scheduledTime
      ? `${dayjs(advanceSchedule.scheduledDate).format("DD MMM YYYY")} at ${selectedOrderDeliveryTime || advanceSchedule.scheduledTime}`
      : "No schedule selected yet";

  return (
    <div className="mb-6">
      {/* When do you want your order? Independent of which delivery provider is used. */}
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        When do you want your order?
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card
          className={`p-4 cursor-pointer transition-all ${
            orderTiming === "instant"
              ? "border-2 border-primary bg-primary/5"
              : "border border-border-light hover:border-primary/50"
          }`}
          onClick={handleOrderNowClick}
        >
          <div className="font-semibold text-text-primary">Order Now</div>
          <div className="text-sm text-text-secondary">As soon as possible</div>
        </Card>
        <Card
          className={`p-4 cursor-pointer transition-all ${
            orderTiming === "scheduled"
              ? "border-2 border-primary bg-primary/5"
              : "border border-border-light hover:border-primary/50"
          }`}
          onClick={handleScheduleClick}
        >
          <div className="font-semibold text-text-primary">
            Schedule for Later
          </div>
          <div className="text-sm text-text-secondary">
            {orderTiming === "scheduled"
              ? scheduleLabel
              : "Pick a date and time"}
          </div>
        </Card>
      </div>

      {orderTiming === "scheduled" && (
        <div className="flex items-center justify-between gap-3 mb-6 -mt-2">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock className="h-4 w-4" />
            <span>{scheduleLabel}</span>
          </div>
          <button
            type="button"
            onClick={handleScheduleClick}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Change
          </button>
        </div>
      )}

      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Delivery Options
      </h3>

      {/* Expiry warning */}
      {timeUntilExpiry !== null &&
        timeUntilExpiry > 0 &&
        timeUntilExpiry <= 120000 && (
          <Alert variant="default" className="mb-4">
            <Clock className="h-5 w-5" />
            <div>
              <p className="text-sm">
                Delivery quotes will refresh in{" "}
                {Math.ceil(timeUntilExpiry / 1000)} seconds
              </p>
            </div>
          </Alert>
        )}

      <div className="space-y-3">
        {availableOptions.map((quote) => {
          const isSelected =
            selectedDeliveryQuote?.quotationId === quote.quotationId;
          const isCheapest =
            quote.provider === deliveryQuotes?.cheapestProvider;
          const isFastest = quote.provider === deliveryQuotes?.fastestProvider;

          return (
            <Card
              key={quote.quotationId}
              className={`p-4 cursor-pointer transition-all ${
                isSelected
                  ? "border-2 border-primary bg-primary/5"
                  : quote.available
                    ? "border border-border-light hover:border-primary/50"
                    : "border border-border-light opacity-50 cursor-not-allowed"
              }`}
              onClick={() => handleSelectProvider(quote)}
            >
              <div className="flex items-start gap-4">
                {/* Radio button */}
                <div className="flex items-center pt-1">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-border-medium bg-white"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>

                {/* Provider details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-5 w-5 text-text-secondary" />
                    <span className="font-semibold text-text-primary">
                      {quote.providerName}
                    </span>

                    {/* Badges */}
                    {isCheapest && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                        Cheapest
                      </span>
                    )}
                    {isFastest && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        Fastest
                      </span>
                    )}
                  </div>

                  {quote.available ? (
                    <div className="space-y-1 text-sm text-text-secondary">
                      <div className="flex items-center gap-2">
                        {/* commented estimated delivery until we get respose from api */}
                        {/* <Clock className="h-4 w-4" /> */}
                        {/* <span>Estimated delivery: {quote.estimatedTime}</span> */}
                      </div>
                      <div className="font-semibold text-text-primary">
                        S$ {quote.fee.toFixed(2)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-text-tertiary">
                      {quote.unavailableReason || "Currently unavailable"}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <OrderTimeDialog
        open={showOrderTimeDialog}
        onClose={() => setShowOrderTimeDialog(false)}
        orderType={orderTimeType}
        setOrderType={setOrderTimeType}
        selectedDate={selectedOrderDate}
        setSelectedDate={setSelectedOrderDate}
        selectedSlot={selectedOrderSlot}
        setSelectedSlot={setSelectedOrderSlot}
        selectedDeliveryTime={selectedOrderDeliveryTime}
        setSelectedDeliveryTime={setSelectedOrderDeliveryTime}
        onConfirm={() => {
          setShowOrderTimeDialog(false);

          // Save the advance schedule to cart store so checkout can send it to the API.
          // This only sets orderTiming/advanceOrderSchedule - the delivery provider
          // selection (lalamove, grab_express, ...) above is untouched.
          if (
            orderTimeType === "advance" &&
            selectedOrderDate &&
            selectedOrderDeliveryTime
          ) {
            // Convert "12:30 PM" → "12:30" (24h) for the API
            const parsed = selectedOrderDate
              .hour(
                parseInt(selectedOrderDeliveryTime.split(":")[0]) +
                  (selectedOrderDeliveryTime.includes("PM") &&
                  !selectedOrderDeliveryTime.startsWith("12")
                    ? 12
                    : selectedOrderDeliveryTime.includes("AM") &&
                        selectedOrderDeliveryTime.startsWith("12")
                      ? -12
                      : 0),
              )
              .minute(parseInt(selectedOrderDeliveryTime.split(":")[1]));
            const scheduledDate = selectedOrderDate.format("YYYY-MM-DD");
            const scheduledTime = parsed.format("HH:mm");
            setAdvanceOrderSchedule(scheduledDate, scheduledTime);
          } else if (orderTimeType === "now") {
            clearAdvanceOrderSchedule();
          }
        }}
      />
    </div>
  );
}
