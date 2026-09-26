
"use client";

import { ChevronRight, Frown, Home, Store } from "lucide-react";

interface FulfillmentTypeScreenProps {
  onSelectDelivery: () => void;
  onSelectPickup: () => void;
  homeDeliveryAvailable: boolean;
  pickFromStoreAvailable: boolean;
}

export function FulfillmentTypeScreen({
  onSelectDelivery,
  onSelectPickup,
  homeDeliveryAvailable,
  pickFromStoreAvailable,
}: FulfillmentTypeScreenProps) {
  const noFulfillmentAvailable =
    !homeDeliveryAvailable && !pickFromStoreAvailable;

  return (
    <div className="w-full px-3 py-5 sm:px-4 sm:py-8">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="mb-5 space-y-1 sm:mb-8 sm:space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            How would you like to get your order?
          </h2>

          <p className="text-sm text-gray-500 sm:text-base sm:text-gray-600">
            Choose your preferred order fulfillment method
          </p>
        </div>

        {/* No fulfillment methods */}
        {noFulfillmentAvailable ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-8 text-center sm:rounded-2xl sm:border-2 sm:p-8">
            <div className="mb-3 flex justify-center sm:mb-4">
              <Frown className="h-9 w-9 text-gray-400 sm:h-10 sm:w-10" />
            </div>

            <h3 className="text-base font-bold text-gray-900 sm:text-lg">
              No ordering methods are currently available.
            </h3>

            <p className="mt-1.5 text-sm text-gray-500 sm:mt-2 sm:text-gray-600">
              Please try again later.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Home Delivery */}
            {homeDeliveryAvailable ? (
              <button
                type="button"
                onClick={onSelectDelivery}
                className="
                  group flex w-full items-center gap-3 rounded-xl
                  border border-gray-200 bg-white p-4 text-left
                  shadow-sm transition-all
                  hover:border-primary hover:shadow-md
                  active:scale-[0.99]
                  sm:items-start sm:gap-4 sm:rounded-2xl
                  sm:border-2 sm:p-6 sm:shadow-none
                  sm:hover:shadow-lg
                "
              >
                {/* Icon */}
                <div
                  className="
                    flex h-12 w-12 shrink-0 items-center justify-center
                    rounded-xl bg-red-50 text-red-600
                    sm:h-16 sm:w-16 sm:text-4xl
                  "
                >
                  <Home className="h-6 w-6 sm:hidden" />
                  <span className="hidden sm:block">🏠</span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-gray-900 sm:mb-1 sm:text-xl">
                    Home Delivery
                  </h3>

                  <p className="mt-0.5 text-sm leading-5 text-gray-500 sm:mb-3 sm:mt-0 sm:text-gray-600">
                    Get your food delivered to your doorstep
                  </p>

                  {/* Desktop benefits */}
                  <ul className="mt-2 hidden space-y-1 sm:block">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="h-1 w-1 rounded-full bg-gray-400" />
                      Track your order in real-time
                    </li>

                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="h-1 w-1 rounded-full bg-gray-400" />
                      Contactless delivery available
                    </li>

                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="h-1 w-1 rounded-full bg-gray-400" />
                      Delivery fee applies
                    </li>
                  </ul>

                  {/* Mobile short info */}
                  <span className="mt-1.5 block text-xs font-medium text-gray-400 sm:hidden">
                    Delivery fee applies
                  </span>
                </div>

                {/* Arrow */}
                <ChevronRight
                  className="
                    h-5 w-5 shrink-0 text-gray-400
                    transition-transform
                    group-hover:translate-x-0.5
                    group-hover:text-primary
                    sm:h-6 sm:w-6
                  "
                />
              </button>
            ) : (
              <div
                className="
                  flex w-full items-center gap-3 rounded-xl
                  border border-gray-200 bg-gray-50 p-4 opacity-70
                  sm:items-start sm:gap-4 sm:rounded-2xl
                  sm:border-2 sm:p-6
                "
              >
                <div
                  className="
                    flex h-12 w-12 shrink-0 items-center justify-center
                    rounded-xl bg-gray-200 text-gray-400
                    sm:h-16 sm:w-16 sm:text-4xl
                  "
                >
                  <Home className="h-6 w-6 sm:hidden" />
                  <span className="hidden grayscale sm:block">🏠</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-gray-500 sm:text-xl">
                      Home Delivery
                    </h3>

                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-500 sm:px-2.5 sm:py-1 sm:text-xs">
                      Not Available
                    </span>
                  </div>

                  <p className="mt-1 text-xs leading-4 text-gray-500 sm:text-sm">
                    Home delivery is currently unavailable.
                  </p>
                </div>
              </div>
            )}

            {/* Store Self Collect */}
            {pickFromStoreAvailable ? (
              <button
                type="button"
                onClick={onSelectPickup}
                className="
                  group flex w-full items-center gap-3 rounded-xl
                  border border-gray-200 bg-white p-4 text-left
                  shadow-sm transition-all
                  hover:border-primary hover:shadow-md
                  active:scale-[0.99]
                  sm:items-start sm:gap-4 sm:rounded-2xl
                  sm:border-2 sm:p-6 sm:shadow-none
                  sm:hover:shadow-lg
                "
              >
                {/* Icon */}
                <div
                  className="
                    flex h-12 w-12 shrink-0 items-center justify-center
                    rounded-xl bg-green-50 text-green-600
                    sm:h-16 sm:w-16 sm:text-4xl
                  "
                >
                  <Store className="h-6 w-6 sm:hidden" />
                  <span className="hidden sm:block">🏪</span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-gray-900 sm:mb-1 sm:text-xl">
                    Store Self Collect
                  </h3>

                  <p className="mt-0.5 text-sm leading-5 text-gray-500 sm:mb-3 sm:mt-0 sm:text-gray-600">
                    Pick up your order from our store
                  </p>

                  {/* Desktop benefits */}
                  <ul className="mt-2 hidden space-y-1 sm:block">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="h-1 w-1 rounded-full bg-gray-400" />
                      Ready in 15–20 minutes
                    </li>

                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="h-1 w-1 rounded-full bg-gray-400" />
                      No delivery fee
                    </li>

                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="h-1 w-1 rounded-full bg-gray-400" />
                      Fresh and hot
                    </li>
                  </ul>

                  {/* Mobile short info */}
                  <span className="mt-1.5 block text-xs font-medium text-gray-400 sm:hidden">
                    No delivery fee
                  </span>
                </div>

                {/* Arrow */}
                <ChevronRight
                  className="
                    h-5 w-5 shrink-0 text-gray-400
                    transition-transform
                    group-hover:translate-x-0.5
                    group-hover:text-primary
                    sm:h-6 sm:w-6
                  "
                />
              </button>
            ) : (
              <div
                className="
                  flex w-full items-center gap-3 rounded-xl
                  border border-gray-200 bg-gray-50 p-4 opacity-70
                  sm:items-start sm:gap-4 sm:rounded-2xl
                  sm:border-2 sm:p-6
                "
              >
                <div
                  className="
                    flex h-12 w-12 shrink-0 items-center justify-center
                    rounded-xl bg-gray-200 text-gray-400
                    sm:h-16 sm:w-16 sm:text-4xl
                  "
                >
                  <Store className="h-6 w-6 sm:hidden" />
                  <span className="hidden grayscale sm:block">🏪</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-gray-500 sm:text-xl">
                      Store Self Collect
                    </h3>

                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-500 sm:px-2.5 sm:py-1 sm:text-xs">
                      Not Available
                    </span>
                  </div>

                  <p className="mt-1 text-xs leading-4 text-gray-500 sm:text-sm">
                    Store self collect is currently unavailable.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

