/**
 * Al-Arafa Restaurant - Sticky Cart Bar Component
 */

"use client";

import { FC, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";

import { useCartStore } from "@/lib/store/useCartStore";
import {
  useAuthStore,
  isCustomerAuthenticated as isCustomerAuth,
} from "@/lib/store/useAuthStore";
import { useSettingsStore } from "@/lib/store/useSettingsStore";

export const CartBar: FC = () => {
  const { cart, getItemCount } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { fetchAllSettings, isGSTEnabled } = useSettingsStore();

  // Fetch settings
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllSettings();
    }
  }, [isAuthenticated, fetchAllSettings]);

  // Only customers
  const isCustomerAuthenticated = isCustomerAuth(user, isAuthenticated);

  const itemCount = getItemCount();
  const gstEnabled = isGSTEnabled();

  // Cart totals
  const subtotal = cart?.subtotal || 0;
  const deliveryFee = cart?.deliveryFee || 0;
  const platformFee = cart?.platformFee || 0;
  const gstAmount = gstEnabled ? cart?.gstAmount || 0 : 0;

  const total = cart?.total || subtotal + deliveryFee + platformFee + gstAmount;

  // Don't show when empty / logged out
  if (!isCustomerAuthenticated || itemCount === 0) {
    return null;
  }

  return (
    <>
      {/* 
          MOBILE CART BAR
          Floating just above the bottom tab bar
          (tab bar = 66px tall, sits bottom-[calc(0.75rem+safe-area)],
          so this bar's bottom clears that plus a small gap)
       */}

      <div
        className="
    fixed
    left-3
    right-3
    bottom-[calc(1.5rem+66px+env(safe-area-inset-bottom))]
    z-[60]
    sm:hidden
  "
      >
        <div
          className="
            flex
            h-[58px]
            items-center
            gap-2
            rounded-[18px]
            border
            border-[#0b3b27]
            bg-[#92251C]
            px-2
            shadow-[0_8px_28px_rgba(0,0,0,0.22)]
          "
        >
          {/* 
              CART ICON
          = */}

          <Link
            href="/cart"
            aria-label="View cart"
            className="
              relative
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              text-white
              transition
              active:scale-95
            "
          >
            <ShoppingCart className="h-[22px] w-[22px]" strokeWidth={2} />

            {/* Item badge */}
            <span
              className="
                absolute
                -right-0.5
                -top-0.5
                flex
                h-[18px]
                min-w-[18px]
                items-center
                justify-center
                rounded-full
                bg-[white]
                px-1
                text-[10px]
                font-extrabold
                leading-none
                text-[#17351f]
                shadow-sm
              "
            >
              {itemCount}
            </span>
          </Link>

          {/* 
              CART INFORMATION
          = */}

          <Link
            href="/cart"
            className="
              min-w-0
              flex-1
              leading-none
            "
          >
            <div
              className="
                text-[12px]
                font-bold
                leading-4
                text-white
              "
            >
              View Cart
            </div>

            <div
              className="
                mt-0.5
                truncate
                text-[9px]
                font-medium
                tracking-wide
                text-white/65
              "
            >
              {itemCount} {itemCount === 1 ? "item" : "items"}
              <span className="mx-1">•</span>
              S$ {total.toFixed(2)}
            </div>
          </Link>

          {/* 
              PROCEED BUTTON
          = */}

          <Link
            href="/cart"
            className="
              flex
              h-9
              shrink-0
              items-center
              gap-1
              rounded-full
              bg-[white]
              px-4
              text-[11px]
              font-extrabold
              text-[#92251C]
              shadow-sm
              transition-all
              duration-200
            
              active:scale-[0.96]
            "
          >
            <span>Proceed</span>

            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.8} />
          </Link>
        </div>
      </div>

      {/* 
          DESKTOP CART BAR
          Bottom sticky
       */}

      <div
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-[50]
          hidden
          border-t
          border-[#e7ddd2]
          bg-[#fffaf2]/95
          shadow-[0_-8px_30px_rgba(40,25,15,0.10)]
          backdrop-blur-xl

          sm:block
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-[1400px]
            items-center
            justify-between
            px-6
            py-4
            lg:px-10
          "
        >
          {/* Cart summary */}

          <Link
            href="/cart"
            className="
              flex
              items-center
              gap-4
              transition-opacity
              hover:opacity-80
            "
          >
            {/* Icon */}

            <div
              className="
                relative
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-[#92251C]
                text-white
              "
            >
              <ShoppingCart className="h-6 w-6" strokeWidth={2} />

              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  flex
                  h-5
                  min-w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-[#f4b400]
                  px-1
                  text-[10px]
                  font-bold
                  text-[#17351f]
                "
              >
                {itemCount}
              </span>
            </div>

            {/* Text */}

            <div>
              <div
                className="
                  text-sm
                  font-semibold
                  text-[#211a16]
                "
              >
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </div>

              <div
                className="
                  mt-0.5
                  text-xl
                  font-extrabold
                  tracking-tight
                  text-[#92251C]
                "
              >
                S$ {total.toFixed(2)}
              </div>
            </div>
          </Link>

          {/* Desktop button */}

          <Link
            href="/cart"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-[#92251C]
              px-8
              py-3
              font-bold
              text-white
              shadow-lg
              transition-all
              duration-200
             hover:text-[white]
              hover:shadow-xl
              active:scale-[0.98]
            "
          >
            <span>View Cart</span>

            <ArrowRight
              className="
                h-5
                w-5
                transition-transform
                duration-200
                group-hover:translate-x-1
              "
              strokeWidth={2.3}
            />
          </Link>
        </div>
      </div>
    </>
  );
};
