"use client";

import { ChevronRight } from "lucide-react";
import { Frown } from "lucide-react";
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

  console.log("Fulfillment availability:", {
    homeDeliveryAvailable,
    pickFromStoreAvailable,
    noFulfillmentAvailable,
  });

  return (
    <div className="flex flex-col px-4 py-8">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            How would you like to get your order?
          </h2>
          <p className="text-gray-600">
            Choose your preferred order fulfillment method
          </p>
        </div>

        {/* No fulfillment methods available */}
        {noFulfillmentAvailable ? (
          <div className="rounded-2xl border-2 border-gray-200 bg-gray-50 p-8 text-center">
            <div className="mb-4 flex justify-center">
              <Frown className="h-10 w-10 text-text-tertiary" />
            </div>

            <h3 className="text-lg font-bold text-gray-900">
              No ordering methods are currently available.
            </h3>

            <p className="text-sm text-gray-600 mt-2">
              Please try again later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Home Delivery */}
            {homeDeliveryAvailable ? (
              <button
                type="button"
                onClick={onSelectDelivery}
                className="w-full group relative flex items-start gap-4 p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-primary hover:shadow-lg transition-all duration-200 text-left"
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-red-50 flex items-center justify-center text-4xl">
                  🏠
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Home Delivery
                  </h3>

                  <p className="text-gray-600 mb-3">
                    Get your food delivered to your doorstep
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      Track your order in real-time
                    </li>

                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      Contactless delivery available
                    </li>

                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      Delivery fee applies
                    </li>
                  </ul>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0">
                  <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </button>
            ) : (
              /* Home Delivery Unavailable */
              <div className="w-full flex items-start gap-4 p-6 bg-gray-50 border-2 border-gray-200 rounded-2xl opacity-70">
                {/* Icon */}
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-4xl grayscale">
                  🏠
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-gray-500">
                      Home Delivery
                    </h3>

                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-500">
                      Not Available
                    </span>
                  </div>

                  <p className="text-gray-500">
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
                className="w-full group relative flex items-start gap-4 p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-primary hover:shadow-lg transition-all duration-200 text-left"
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center text-4xl">
                  🏪
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Store Self Collect
                  </h3>

                  <p className="text-gray-600 mb-3">
                    Pick up your order from our store
                  </p>

                  {/* Benefits */}
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      Ready in 15-20 minutes
                    </li>

                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      No delivery fee
                    </li>

                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      Fresh and hot
                    </li>
                  </ul>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0">
                  <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </button>
            ) : (
              /* Store Self Collect Unavailable */
              <div className="w-full flex items-start gap-4 p-6 bg-gray-50 border-2 border-gray-200 rounded-2xl opacity-70">
                {/* Icon */}
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-4xl grayscale">
                  🏪
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-gray-500">
                      Store Self Collect
                    </h3>

                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-500">
                      Not Available
                    </span>
                  </div>

                  <p className="text-gray-500">
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
