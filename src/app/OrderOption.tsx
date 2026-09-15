"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/useCartStore";

interface OrderOptionProps {
  menuType: "regular" | "catering";
  homeDeliveryAvailable: boolean;
  pickFromStoreAvailable: boolean;
}

type FulfillmentType = "delivery" | "pickup";

export default function OrderOption({
  menuType,
  homeDeliveryAvailable,
  pickFromStoreAvailable,
}: OrderOptionProps) {
  const router = useRouter();

  const { getFulfillmentType, setFulfillmentType } = useCartStore();

  const currentFulfillment = getFulfillmentType(menuType);

  // Build options dynamically from API availability
  const orderOptions = [
    homeDeliveryAvailable
      ? {
          id: "delivery" as FulfillmentType,
          title: "Delivery",
          description: "Fresh food delivered to your door",
          icon: (
            <svg
              viewBox="0 0 48 48"
              fill="none"
              className="h-7 w-7 sm:h-8 sm:w-8"
            >
              <path
                d="M6 12H29V34H6V12Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M29 20H36L42 27V34H29V20Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <circle
                cx="14"
                cy="35"
                r="4"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              <circle
                cx="35"
                cy="35"
                r="4"
                stroke="currentColor"
                strokeWidth="2.5"
              />
            </svg>
          ),
        }
      : null,

    pickFromStoreAvailable
      ? {
          id: "pickup" as FulfillmentType,
          title: "Self Collect",
          description: "Order ahead and pick it up",
          icon: (
            <svg
              viewBox="0 0 48 48"
              fill="none"
              className="h-7 w-7 sm:h-8 sm:w-8"
            >
              <path
                d="M8 17H40L37 40H11L8 17Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M17 18C17 12 19.7 8 24 8C28.3 8 31 12 31 18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M18 25H30"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          ),
        }
      : null,
  ].filter(Boolean) as {
    id: FulfillmentType;
    title: string;
    description: string;
    icon: React.ReactNode;
  }[];

  // Use the store selection if it is available.
  // Otherwise select the first option that API allows.
  const getInitialSelection = (): FulfillmentType | null => {
    const currentIsAvailable =
      currentFulfillment === "delivery"
        ? homeDeliveryAvailable
        : pickFromStoreAvailable;

    if (currentIsAvailable) {
      return currentFulfillment;
    }

    return orderOptions[0]?.id ?? null;
  };

  const [selectedOption, setSelectedOption] = useState<FulfillmentType | null>(
    getInitialSelection,
  );

  // Keep this section synchronized with the fulfillment store
  useEffect(() => {
    const availableCurrent =
      currentFulfillment === "delivery"
        ? homeDeliveryAvailable
        : pickFromStoreAvailable;

    if (availableCurrent) {
      setSelectedOption(currentFulfillment);
      return;
    }

    if (orderOptions.length > 0) {
      const firstAvailable = orderOptions[0].id;

      setSelectedOption(firstAvailable);
      setFulfillmentType(menuType, firstAvailable);
    }
  }, [
    currentFulfillment,
    homeDeliveryAvailable,
    pickFromStoreAvailable,
    menuType,
    setFulfillmentType,
  ]);

  const handleOptionSelect = (type: FulfillmentType) => {
    setSelectedOption(type);

    // Save directly to the same store used by FulfillmentSelector
    setFulfillmentType(menuType, type);
  };

  const handleContinue = () => {
    if (!selectedOption) return;

    // Make absolutely sure store has the selected value
    setFulfillmentType(menuType, selectedOption);

    router.push("/menu");
  };

  return (
    <section
      className="
    flex w-full items-center
    bg-[#063326]
    px-4 py-8
    min-h-[100svh]

    sm:px-6 sm:py-10

    lg:min-h-[70svh]
  "
    >
      <div
        className="
        mx-auto flex w-full max-w-4xl
        flex-col justify-center
      "
      >
        {/* Heading */}
        <div className="mb-7 text-center sm:mb-9">
          <p
            className="
            mb-2
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.2em]
            text-[#D8B86A]
            sm:text-[11px]
          "
          >
            Order Your Way
          </p>

          <h2
            className="
            font-serif
            text-[26px]
            font-bold
            leading-[1.12]
            text-[#FFF9F0]
            sm:text-[36px]
            lg:text-[38px]
          "
          >
            How would you like to get your order?
          </h2>

          <p
            className="
            mx-auto
            mt-2.5
            max-w-lg
            text-xs
            leading-5
            text-[#E8DED2]
            sm:mt-3
            sm:text-sm
            sm:leading-6
          "
          >
            Choose what works best for you. We&apos;ll take care of the rest.
          </p>
        </div>

        {/* No fulfillment methods */}
        {orderOptions.length === 0 ? (
          <div className="mx-auto w-full max-w-md rounded-2xl border border-[#ead7bd] bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f9e6df] text-[#92251c]">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path
                  d="M12 9V13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 17H12.01"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <h3 className="text-base font-bold text-[#221a16]">
              Ordering is currently unavailable
            </h3>

            <p className="mt-1 text-xs text-[#6b6058]">
              No fulfillment options are currently available.
            </p>
          </div>
        ) : (
          <>
            {/* Fulfillment Options */}
            <div
              className={`grid w-full gap-4 lg:gap-5 ${
                orderOptions.length === 1
                  ? "mx-auto max-w-md"
                  : "grid-cols-1 sm:grid-cols-2"
              }`}
            >
              {orderOptions.map((option) => {
                const isSelected = selectedOption === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleOptionSelect(option.id)}
                    className={`
                    group relative w-full
                    rounded-[20px]
                    border
                    p-5
                    text-left
                    transition-all duration-200
                    sm:p-6
                    ${
                      isSelected
                        ? `
                          border-[#92251c]
                          bg-[#fffaf7]
                          shadow-[0_10px_30px_rgba(146,37,28,0.14)]
                        `
                        : `
                          border-[#e7dcc9]
                          bg-white
                          hover:border-[#cfa79c]
                          hover:shadow-[0_8px_25px_rgba(91,61,20,0.08)]
                        `
                    }
                  `}
                  >
                    {/* Check */}
                    <div
                      className={`
                      absolute right-4 top-4
                      flex h-6 w-6
                      items-center justify-center
                      rounded-full
                      transition-all
                      ${
                        isSelected
                          ? "bg-[#92251c] text-white"
                          : "border border-[#e7dcc9] bg-white text-transparent"
                      }
                    `}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          d="M4 10L8 14L16 6"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    {/* Icon */}
                    <div
                      className={`
                      mb-5
                      flex h-12 w-12
                      items-center justify-center
                      rounded-xl
                      transition-colors
                      sm:h-14 sm:w-14
                      sm:rounded-2xl
                      ${
                        isSelected
                          ? "bg-[#f9e0dc] text-[#92251c]"
                          : "bg-[#fff8f5] text-[#92251c] group-hover:bg-[#f9e0dc]"
                      }
                    `}
                    >
                      {option.icon}
                    </div>

                    {/* Content */}
                    <h3
                      className="
                      pr-8
                      text-[17px]
                      font-bold
                      text-[#221a16]
                      sm:text-[19px]
                    "
                    >
                      {option.title}
                    </h3>

                    <p
                      className="
                      mt-1.5
                      pr-8
                      text-xs
                      leading-5
                      text-[#6b6058]
                      sm:text-sm
                    "
                    >
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Continue */}
            <div className="mt-7 flex justify-center sm:mt-8">
              <button
                type="button"
                onClick={handleContinue}
                disabled={!selectedOption}
                className="
                flex items-center gap-3
                rounded-full
                bg-[#D8B86A]
                px-7 py-3
                text-sm
                font-semibold
                text-black
                shadow-sm
                transition-all
                hover:bg-[#B58F1F]
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:px-8 sm:py-3.5
              "
              >
                Continue
                <span
                  className="
                  flex h-7 w-7
                  items-center justify-center
                  rounded-full
                  bg-[#92251c]
                  text-white
                "
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                    <path
                      d="M4 10H15M11 6L15 10L11 14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
