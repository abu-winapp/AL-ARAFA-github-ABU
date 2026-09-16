/**
 * Al-Arafa Restaurant - Fulfillment Selector Component (Redesigned)
 * Shows delivery/pickup switch and location/address selector
 */

"use client";

// import OrderTimeDialog from "@/components/ui/OrderTimeDialog";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { FC, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import { AddAddressDialog } from "@/components/checkout/AddAddressDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Location, UserAddress } from "@/types";
import * as locationService from "@/lib/api/location.service";
import * as addressService from "@/lib/api/address.service";
import * as cartService from "@/lib/api/cart.service";
import { useCartStore } from "@/lib/store/useCartStore";

import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
} from "@mui/material";

/**
 * Format address for display in dropdown (single line)
 */
const formatAddressDisplay = (address: UserAddress): string => {
  const parts: string[] = [];

  // Add unit number if available
  if (address.unitNumber) {
    parts.push(`#${address.unitNumber}`);
  }

  // Add building name if available
  if (address.buildingName) {
    parts.push(address.buildingName);
  }

  // Add address line 1 if available
  if (address.addressLine1) {
    parts.push(address.addressLine1);
  }

  // Add address line 2 if available
  if (address.addressLine2) {
    parts.push(address.addressLine2);
  }

  // Add postal code
  parts.push(`Singapore ${address.postalCode}`);

  // Join all parts with commas
  return parts.join(", ");
};

/**
 * Format location for display in dropdown (single line)
 */
const formatLocationDisplay = (location: Location): string => {
  const parts: string[] = [];

  // Add address
  parts.push(location.address);

  // Add phone if available
  if (location.phone) {
    parts.push(location.phone);
  }

  // Join all parts with commas
  return parts.join(", ");
};

// upating fulfillment selector to impliment home del and self collect disable or enable
interface FulfillmentSelectorProps {
  menuType: "regular" | "catering";
  onLocationChange?: (locationId: string) => void;
  homeDeliveryAvailable: boolean;
  pickFromStoreAvailable: boolean;
}

export const FulfillmentSelector: FC<FulfillmentSelectorProps> = ({
  menuType,
  onLocationChange,
  homeDeliveryAvailable,
  pickFromStoreAvailable,
}) => {
  const router = useRouter();
  const [orderType, setOrderType] = useState<"now" | "advance">("now");
  const [pendingOrderType, setPendingOrderType] = useState<"now" | "advance">(
    "advance",
  );
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

  // Delivery slot and time selection for advance orders.
  const deliverySlots = [
    {
      id: "slot1",
      label: "12:00 PM - 03:00 PM",
      times: [
        "12:00 PM",
        "12:30 PM",
        "01:00 PM",
        "01:30 PM",
        "02:00 PM",
        "02:30 PM",
        "03:00 PM",
      ],
    },
    {
      id: "slot2",
      label: "03:00 PM - 05:00 PM",
      times: ["03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"],
    },

    {
      id: "slot3",
      label: "05:00 PM - 07:00 PM",
      times: ["05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM"],
    },
  ];

  //model dialog for order time selection

  const [openOrderTimeDialog, setOpenOrderTimeDialog] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState("");

  const [locations, setLocations] = useState<Location[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [showLocationChangeAlert, setShowLocationChangeAlert] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    type: "fulfillment" | "location";
    newIsDelivery?: boolean;
    newLocationId?: string;
  } | null>(null);

  const { fetchAllSettings, getOrderWindows } = useSettingsStore();

  const orderWindows = getOrderWindows();
  // reloading page to get the timing window and chache it for 5 minutes so it reduces unnecessary req
  useEffect(() => {
    fetchAllSettings();
  }, [fetchAllSettings]);

  // time formatting function to convert 24 hour time to 12 hour time with am/pm
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);

    return new Date(0, 0, 0, hour, minute).toLocaleTimeString("en-SG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const {
    cart,
    fetchCart,
    getFulfillmentType,
    setFulfillmentType,
    selectedAddressId,
    setSelectedAddressId,
  } = useCartStore();
  const fulfillmentType = getFulfillmentType(menuType);
  const isDelivery = fulfillmentType === "delivery";

  // Fetch locations and addresses on mount and when page becomes visible
  // Note: This component assumes user is authenticated
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [locationsData, addressesData] = await Promise.all([
          locationService.getActiveLocations(),
          addressService.getAddresses(),
        ]);

        if (!isMounted) return;

        setLocations(locationsData || []);
        setAddresses(addressesData || []);

        // Set default address if we have addresses
        if (addressesData && addressesData.length > 0) {
          // Use address from store if available, otherwise use default/first address
          // Ensure address id is a string to satisfy state typings
          const addressToSelect =
            selectedAddressId &&
            addressesData.find((a) => a.id === selectedAddressId)
              ? String(selectedAddressId)
              : String(
                  (addressesData.find((a) => a.isDefault) || addressesData[0])
                    .id,
                );

          setSelectedAddress(addressToSelect);
          setSelectedAddressId(addressToSelect);
        }
      } catch (err) {
        console.error("Failed to load fulfillment data:", err);
        if (isMounted) {
          setError("Failed to load data. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Refetch addresses when page becomes visible (e.g., returning from onboarding)
    const handleVisibilityChange = () => {
      if (!document.hidden && isMounted) {
        fetchData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Initialize location from cart data after locations are loaded
  useEffect(() => {
    if (cart && locations.length > 0) {
      // Set location from cart
      if (cart.locationId) {
        setSelectedLocation(cart.locationId);
      } else if (locations.length > 0) {
        setSelectedLocation(locations[0].id);
      }
    }
  }, [cart, locations]);

  // Check if cart has items and location is changing
  const shouldShowLocationChangeAlert = (newLocationId: string): boolean => {
    if (!cart || !cart.items || cart.items.length === 0) {
      return false; // No items, no need to alert
    }

    // Check if location is actually changing
    return cart.locationId !== newLocationId;
  };

  // Update cart location in backend (fulfillmentType is managed frontend-only)
  const updateCartLocation = async (locationId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await cartService.updateCartLocation(locationId);
      await fetchCart();

      // Notify parent about location change
      if (onLocationChange) {
        onLocationChange(locationId);
      }
    } catch (err) {
      console.error("Failed to update cart location:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update cart location",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle fulfillment type change (frontend-only, no backend update)
  const handleFulfillmentChange = async (checked: boolean) => {
    const newType: "delivery" | "pickup" = checked ? "delivery" : "pickup";

    // No-op if the type isn't actually changing
    if (newType === fulfillmentType) return;

    // If switching to delivery but no addresses (and not loading), show dialog
    if (checked && !isLoading && addresses.length === 0) {
      setShowAddressDialog(true);
      return;
    }

    // If the cart already has items, switching fulfillment type may make
    // them invalid (different location/serviceability) - confirm first.
    //disabling this featre for now

    // if (cart && cart.items && cart.items.length > 0) {
    //   setPendingChange({
    //     type: "fulfillment",
    //     newIsDelivery: checked,
    //   });
    //   setShowLocationChangeAlert(true);
    //   return;
    // }

    // No items in cart, safe to switch immediately
    setFulfillmentType(menuType, newType);
  };

  // Handle location change (for pickup)
  const handlePickupLocationChange = async (locationId: string) => {
    // Check if we need to show location change alert
    //diabling this feature for now under development of 404 clear cart api response

    // if (shouldShowLocationChangeAlert(locationId)) {
    //   setPendingChange({
    //     type: "location",
    //     newLocationId: locationId,
    //   });
    //   setShowLocationChangeAlert(true);
    //   return;
    // }

    // No alert needed, proceed with change
    setSelectedLocation(locationId);
    await updateCartLocation(locationId);
  };

  // Handle address change (for delivery)
  const handleAddressChange = async (addressId: string) => {
    setSelectedAddress(addressId);
    setSelectedAddressId(addressId); // Store in cart store for checkout
    // Address change doesn't affect cart location, no backend update needed
  };

  // Handle new address added
  const handleAddressAdded = async (newAddress: UserAddress) => {
    // Refresh addresses
    const addressesData = await addressService.getAddresses();
    setAddresses(addressesData || []);
    setSelectedAddress(newAddress.id);
    setSelectedAddressId(newAddress.id); // Store in cart store for checkout

    // Enable delivery mode (frontend-only, menu-type specific)
    setFulfillmentType(menuType, "delivery");
  };

  // Handle location change confirmation
  const handleConfirmLocationChange = async () => {
    setShowLocationChangeAlert(false);

    if (!pendingChange) return;

    try {
      setIsLoading(true);
      setError(null);

      // Clear the cart first
      await cartService.clearCart();

      if (
        pendingChange.type === "fulfillment" &&
        pendingChange.newIsDelivery !== undefined
      ) {
        // User confirmed fulfillment type change (frontend-only, menu-type specific)
        const checked = pendingChange.newIsDelivery;
        setFulfillmentType(menuType, checked ? "delivery" : "pickup");
        // Cart was cleared on the backend - refresh local state to match
        await fetchCart();
      } else if (
        pendingChange.type === "location" &&
        pendingChange.newLocationId
      ) {
        // User confirmed location change (update backend)
        setSelectedLocation(pendingChange.newLocationId);
        await updateCartLocation(pendingChange.newLocationId);
      }

      setPendingChange(null);
    } catch (err) {
      console.error("Failed to clear cart and update location:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update location",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle location change cancellation
  const handleCancelLocationChange = () => {
    setShowLocationChangeAlert(false);
    setPendingChange(null);
  };

return (
  <>
    {/* 
        COMPACT FULFILLMENT SELECTOR
     */}
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#ead7bd] bg-[#fffdf9] shadow-[0_10px_30px_rgba(91,35,20,0.12)]">

      <div className="p-3 sm:p-4">

        {/* 
            DELIVERY / SELF COLLECT
         */}
        <div className="grid grid-cols-2 gap-2.5">

          {/* Delivery */}
          <button
            type="button"
            onClick={() => {
              if (homeDeliveryAvailable) {
                handleFulfillmentChange(true);
              }
            }}
            disabled={isLoading || !homeDeliveryAvailable}
            className={`
              flex min-h-[52px] items-center justify-center gap-2
              rounded-xl border px-3
              text-sm font-bold
              transition-all duration-200
              select-none
              ${
                isDelivery && homeDeliveryAvailable
                  ? "border-[#a52c1d] bg-gradient-to-r from-[#b94732] to-[#991c12] text-white shadow-[0_4px_12px_rgba(153,28,18,0.20)]"
                  : !homeDeliveryAvailable
                    ? "cursor-not-allowed border-[#e8ded2] bg-[#f5f1eb] text-[#aaa29b]"
                    : "border-[#ead7bd] bg-[#fffdf9] text-[#8f1d14] hover:border-[#c58b6d] hover:bg-[#fff8ef]"
              }
              disabled:opacity-80
            `}
          >
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 17h2m10 0h2m-1-5h2l-2-5H9v10h2m4 0h2m-9-5h4m-8 5a2 2 0 104 0m8 0a2 2 0 104 0"
              />
            </svg>

            <span>Delivery</span>

            {!homeDeliveryAvailable && (
              <span className="hidden rounded-full bg-[#ead7d3] px-2 py-0.5 text-[10px] font-semibold text-[#a33b2e] sm:inline-flex">
                Unavailable
              </span>
            )}
          </button>

          {/* Self Collect */}
          <button
            type="button"
            onClick={() => {
              if (pickFromStoreAvailable) {
                handleFulfillmentChange(false);
              }
            }}
            disabled={isLoading || !pickFromStoreAvailable}
            className={`
              flex min-h-[52px] items-center justify-center gap-2
              rounded-xl border px-3
              text-sm font-bold
              transition-all duration-200
              select-none
              ${
                !isDelivery && pickFromStoreAvailable
                  ? "border-[#a52c1d] bg-gradient-to-r from-[#b94732] to-[#991c12] text-white shadow-[0_4px_12px_rgba(153,28,18,0.20)]"
                  : !pickFromStoreAvailable
                    ? "cursor-not-allowed border-[#e8ded2] bg-[#f5f1eb] text-[#aaa29b]"
                    : "border-[#ead7bd] bg-[#fffdf9] text-[#8f1d14] hover:border-[#c58b6d] hover:bg-[#fff8ef]"
              }
              disabled:opacity-80
            `}
          >
            <svg
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M5 10v10h14V10M4 10l1-6h14l1 6M8 14h3v6H8z"
              />
            </svg>

            <span>Self Collect</span>

            {!pickFromStoreAvailable && (
              <span className="hidden rounded-full bg-[#ead7d3] px-2 py-0.5 text-[10px] font-semibold text-[#a33b2e] sm:inline-flex">
                Unavailable
              </span>
            )}
          </button>
        </div>

        {/* 
            LOADING
         */}
        {isLoading && (
          <div className="flex justify-center py-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#92251C] border-t-transparent" />
          </div>
        )}

        {/* 
            ORDER HOURS
         */}
        <div className="mt-2.5 flex min-h-[42px] items-center gap-2.5 rounded-lg bg-[#fff8ef] px-3 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f9e6df] text-[#a51f16]">
            <svg
              className="h-4 w-4"
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

          <p className="min-w-0 truncate text-xs text-[#514943] sm:text-sm">
            <span className="font-bold text-[#29221e]">
              Order Hours:
            </span>{" "}
            {orderWindows.length > 0
              ? orderWindows
                  .map(
                    (window) =>
                      `${formatTime(window.start)} - ${formatTime(
                        window.end,
                      )}`,
                  )
                  .join(" • ")
              : "Not Available"}
          </p>
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-dashed border-[#e5d6c3]" />

        {/* 
            SELF COLLECT
         */}
        {!isDelivery && (
          <>
            {locations.length > 0 ? (
              <div className="space-y-2.5">

                {/* Heading */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f9e6df] text-[#a51f16]">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z"
                      />
                      <circle cx="12" cy="11" r="2.5" />
                    </svg>
                  </div>

                  <Label
                    htmlFor="location"
                    className="text-sm font-bold text-[#302722] sm:text-[15px]"
                  >
                    Select Self Collect Location
                  </Label>
                </div>

                {/* Location Select */}
                <Select
                  value={selectedLocation}
                  onValueChange={handlePickupLocationChange}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    id="location"
                    className="
                      h-[68px]
                      w-full
                      rounded-xl
                      border-[#ead7bd]
                      bg-white
                      px-3
                      shadow-sm
                      transition-all
                      hover:border-[#c58b6d]
                      hover:bg-[#fffaf3]
                      focus:ring-0
                      focus:ring-offset-0
                    "
                  >
                    <SelectValue placeholder="Choose a location">
                      {selectedLocation &&
                        (() => {
                          const loc = locations.find(
                            (l) => l.id === selectedLocation,
                          );

                          if (!loc) return null;

                          return (
                            <div className="flex w-full min-w-0 items-center gap-3 text-left">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f9e6df] text-[#a51f16]">
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h18M5 10v10h14V10M4 10l1-6h14l1 6"
                                  />
                                </svg>
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-[#302722]">
                                  {loc.name}
                                </p>

                                <p className="mt-0.5 truncate text-xs text-[#6e655f]">
                                  {loc.address}
                                </p>
                              </div>

                              <svg
                                className="h-4 w-4 shrink-0 text-[#a51f16]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          );
                        })()}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem
                        key={location.id}
                        value={location.id}
                        className="cursor-pointer py-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f9e6df] text-[#a51f16]">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h18M5 10v10h14V10M4 10l1-6h14l1 6"
                              />
                            </svg>
                          </div>

                          <div className="flex min-w-0 flex-col">
                            <span className="text-sm font-semibold">
                              {location.name}
                            </span>

                            <span className="truncate text-xs text-text-tertiary">
                              {formatLocationDisplay(location)}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="py-5 text-center text-text-secondary">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm">
                      Loading locations...
                    </span>
                  </div>
                ) : (
                  <p className="text-sm">
                    No pickup locations available
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* 
            DELIVERY
         */}
        {isDelivery && (
          <div className="space-y-3">

            {addresses.length > 0 ? (
              <div className="space-y-2.5">

                {/* Heading */}
                <div className="flex items-center justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f9e6df] text-[#a51f16]">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l9-9 9 9M5 10v10h14V10"
                        />
                      </svg>
                    </div>

                    <Label
                      htmlFor="address"
                      className="truncate text-sm font-bold text-[#302722] sm:text-[15px]"
                    >
                      Delivery Address
                    </Label>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddressDialog(true)}
                    className="
                      h-8
                      shrink-0
                      rounded-full
                      px-3
                      text-xs
                      font-semibold
                      text-[#a51f16]
                      hover:bg-[#f9e6df]
                      hover:text-[#8d180f]
                    "
                  >
                    + Add New
                  </Button>
                </div>

                {/* Address Select */}
                <Select
                  value={selectedAddress}
                  onValueChange={handleAddressChange}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    id="address"
                    className="
                      h-[68px]
                      w-full
                      rounded-xl
                      border-[#ead7bd]
                      bg-white
                      px-3
                      shadow-sm
                      transition-all
                      hover:border-[#c58b6d]
                      hover:bg-[#fffaf3]
                      focus:ring-0
                      focus:ring-offset-0
                    "
                  >
                    <SelectValue placeholder="Choose an address">
                      {selectedAddress &&
                        (() => {
                          const addr = addresses.find(
                            (a) => a.id === selectedAddress,
                          );

                          if (!addr) return null;

                          const label =
                            addr.label === "Other"
                              ? addr.customLabel
                              : addr.label;

                          return (
                            <div className="flex w-full min-w-0 items-center gap-3 text-left">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f9e6df] text-[#a51f16]">
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 12l9-9 9 9M5 10v10h14V10"
                                  />
                                </svg>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex min-w-0 items-center gap-2">
                                  <span className="truncate text-sm font-bold text-[#302722]">
                                    {label}
                                  </span>

                                  {addr.isDefault && (
                                    <span className="shrink-0 rounded-full bg-[#a51f16] px-1.5 py-0.5 text-[9px] font-semibold text-white">
                                      Default
                                    </span>
                                  )}
                                </div>

                                <p className="mt-0.5 truncate text-xs text-[#6e655f]">
                                  {formatAddressDisplay(addr)}
                                </p>
                              </div>

                              <svg
                                className="h-4 w-4 shrink-0 text-[#a51f16]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          );
                        })()}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {addresses.map((address) => (
                      <SelectItem
                        key={address.id}
                        value={address.id}
                        className="cursor-pointer py-2.5"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <svg
                              className="h-4 w-4 text-[#a51f16]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l9-9 9 9M5 10v10h14V10"
                              />
                            </svg>

                            <span className="text-sm font-semibold">
                              {address.label === "Other"
                                ? address.customLabel
                                : address.label}
                            </span>

                            {address.isDefault && (
                              <span className="rounded-full bg-[#a51f16] px-2 py-0.5 text-[9px] font-medium text-white">
                                Default
                              </span>
                            )}
                          </div>

                          <span className="pl-6 text-xs text-text-tertiary">
                            {formatAddressDisplay(address)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#d9b99d] bg-[#fff8ef] px-4 py-5 text-center">

                <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#f9e6df] text-[#a51f16]">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l9-9 9 9M5 10v10h14V10"
                    />
                  </svg>
                </div>

                <p className="text-sm font-bold text-[#302722]">
                  No delivery address found
                </p>

                <p className="mt-0.5 text-xs text-[#766d66]">
                  Add an address to enable delivery
                </p>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowAddressDialog(true)}
                  className="
                    mt-3
                    h-9
                    rounded-full
                    bg-[#a51f16]
                    px-4
                    text-xs
                    shadow-sm
                    hover:bg-[#8d180f]
                  "
                >
                  <svg
                    className="mr-1.5 h-3.5 w-3.5"
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
                  Add Address
                </Button>
              </div>
            )}

            {/* Serving Location */}
            {selectedLocation && (
              <div className="flex items-center gap-2 rounded-lg bg-[#f7f2eb] px-3 py-2 text-[11px] text-[#766d66] sm:text-xs">
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-[#a51f16]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                <span className="truncate">
                  Serving from{" "}
                  <span className="font-semibold text-[#4b423d]">
                    {locations.find(
                      (l) => l.id === selectedLocation,
                    )?.name || "Default Location"}
                  </span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* 
            ERROR
         */}
        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
            <svg
              className="h-4 w-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>

            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Add Address Dialog */}
      <AddAddressDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        onAddressAdded={handleAddressAdded}
      />

      {/* Location Change Alert Dialog */}
      <AlertDialog
        open={showLocationChangeAlert}
        onOpenChange={setShowLocationChangeAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Change Location?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Changing the{" "}
              {pendingChange?.type === "fulfillment"
                ? "fulfillment type"
                : "pickup location"}{" "}
              will clear your cart because items may not be available
              at the new location. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelLocationChange}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleConfirmLocationChange}
            >
              Clear Cart & Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </>
);

};
