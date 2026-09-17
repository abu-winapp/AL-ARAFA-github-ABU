"use client";

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

  const {
  getFulfillmentType,
  setFulfillmentType,
  hasFulfillmentTypeSelected,
} = useCartStore();

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

const hasUserSelected = hasFulfillmentTypeSelected(menuType);

const selectedOption: FulfillmentType | null = hasUserSelected
  ? currentFulfillment
  : orderOptions[0]?.id ?? null;

  const handleOptionSelect = (type: FulfillmentType) => {
    setFulfillmentType(menuType, type);
  };

  const handleContinue = () => {
    if (!selectedOption) return;

    router.push("/menu");
  };


return (
  <section
    className="
      flex w-full items-center
      bg-[#FFFFFF]
      px-4 py-10
      min-h-[100svh]

      sm:px-6 sm:py-12

      lg:min-h-[70svh]
      lg:py-16
    "
  >
    <div
      className="
        mx-auto flex w-full max-w-5xl
        flex-col justify-center
      "
    >
      {/* Heading */}
      <div className="mb-8 text-center sm:mb-10">
        {/* Eyebrow */}
        <div className="mb-3 flex items-center justify-center gap-3">

          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.24em]
              text-[#95221C]
              sm:text-[11px]
            "
          >
            Order Your Way
          </p>

        </div>

        <h2
          className="
            font-serif
            text-[27px]
            font-bold
            leading-[1.1]
            tracking-[-0.02em]
            text-[#0F0F0F]
            sm:text-[36px]
            lg:text-[42px]
          "
        >
          How would you like to
          <span className="block text-[#95221C]">
            get your order?
          </span>
        </h2>

        <p
          className="
            mx-auto
            mt-3
            max-w-xl
            text-xs
            leading-5
            text-[#0F0F0F]/55
            sm:mt-4
            sm:text-sm
            sm:leading-6
          "
        >
          Choose the option that works best for you.
          We&apos;ll take care of the rest.
        </p>
      </div>

      {/* No fulfillment methods */}
      {orderOptions.length === 0 ? (
        <div
          className="
            mx-auto
            w-full
            max-w-md
            rounded-2xl
            border
            border-[#0F0F0F]/10
            bg-[#FFFFFF]
            p-7
            text-center
            shadow-[0_12px_40px_rgba(15,15,15,0.08)]
          "
        >
          <div
            className="
              mx-auto
              mb-4
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-[#95221C]/10
              text-[#95221C]
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
            >
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

          <h3
            className="
              text-base
              font-bold
              text-[#0F0F0F]
              sm:text-lg
            "
          >
            Ordering is currently unavailable
          </h3>

          <p
            className="
              mt-1.5
              text-xs
              leading-5
              text-[#0F0F0F]/55
            "
          >
            No fulfillment options are currently available.
          </p>
        </div>
      ) : (
        <>
          {/* Fulfillment Options */}
          <div
            className={`grid w-full gap-3.5 sm:gap-5 ${
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
                    group
                    relative
                    w-full
                    overflow-hidden
                    rounded-[22px]
                    border
                    p-4
                    text-left
                    transition-all
                    duration-300
                    active:scale-[0.985]
                    sm:rounded-2xl
                    sm:p-6

                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#95221C]
                    focus-visible:ring-offset-2

                    ${
                      isSelected
                        ? `
                          border-[#95221C]
                          bg-[#FFFFFF]
                          shadow-[0_12px_32px_rgba(185,9,11,0.12)]
                        `
                        : `
                          border-[#0F0F0F]/10
                          bg-[#FFFFFF]
                          shadow-[0_6px_24px_rgba(15,15,15,0.05)]
                          hover:border-[#95221C]/40
                          hover:shadow-[0_12px_30px_rgba(15,15,15,0.10)]
                        `
                    }
                  `}
                >


           
                          <div className={`
                      absolute
                      right-4
                      top-4
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      transition-all
                      duration-200

                      ${
                        isSelected
                          ? "bg-[#95221C] text-[#FFFFFF]"
                          : `
                            border
                            border-[#0F0F0F]/15
                            bg-[#FFFFFF]
                            text-transparent
                            group-hover:border-[#95221C]/50
                          `
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
                      mb-4
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-xl
                      transition-all
                      duration-300
                      sm:mb-5
                      sm:h-14
                      sm:w-14
                      sm:rounded-2xl

                      ${
                        isSelected
                          ? `
                            bg-[#95221C]
                            text-[#FFFFFF]
                          `
                          : `
                            bg-[#0F0F0F]/[0.05]
                            text-[#95221C]
                            group-hover:bg-[#95221C]
                            group-hover:text-[#FFFFFF]
                          `
                      }
                    `}
                  >
                    {option.icon}
                  </div>

                  {/* Content */}
                  <h3
                    className="
                      pr-10
                      text-[16px]
                      font-bold
                      leading-tight
                      text-[#0F0F0F]
                      sm:text-[19px]
                    "
                  >
                    {option.title}
                  </h3>

                  <p
                    className="
                      mt-1.5
                      max-w-sm
                      pr-8
                      text-xs
                      leading-5
                      text-[#0F0F0F]/55
                      sm:text-sm
                      sm:leading-6
                    "
                  >
                    {option.description}
                  </p>

                  {/* Selected */}
                  <div
                    className={`
                      mt-4
                      flex
                      items-center
                      gap-2
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-[#95221C]
                      transition-all
                      duration-300
                      ${
                        isSelected
                          ? "translate-y-0 opacity-100"
                          : "translate-y-1 opacity-0"
                      }
                    `}
                  >

                  </div>
                </button>
              );
            })}
          </div>

          {/* Continue */}
          <div className="mt-8 flex justify-center sm:mt-10">
            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedOption}
              className="
                group
                flex
                items-center
                gap-3
                rounded-full
                bg-[#95221C]
                px-7
                py-3
                text-sm
                font-semibold
                text-[#FFFFFF]
                shadow-[0_8px_22px_rgba(185,9,11,0.18)]
                transition-all
                duration-200

                hover:bg-[#0F0F0F]
                hover:shadow-[0_10px_25px_rgba(15,15,15,0.18)]

                disabled:cursor-not-allowed
                disabled:opacity-40
                disabled:shadow-none

                sm:px-8
                sm:py-3.5
              "
            >
              Continue

              <span
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-[#FFFFFF]
                  text-[#95221C]
                  transition-transform
                  duration-200
                  group-hover:translate-x-0.5
                "
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-4 w-4"
                >
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
