/**
 * Al-Arafa Restaurant - Menu Card Component
 */

"use client";

import { FC, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { MenuItem } from "@/types";
import { useCartStore } from "@/lib/store/useCartStore";
import {
  useAuthStore,
  isCustomerAuthenticated as isCustomerAuth,
} from "@/lib/store/useAuthStore";

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

import { Flame, ShoppingCart, Plus, Minus, Star } from "lucide-react";

import * as cartService from "@/lib/api/cart.service";
import { MenuDetailDialog } from "@/components/menu/MenuDetailDialog";
import { CateringPackageDialog } from "@/components/menu/CateringPackageDialog";

import type { CartItemCustomization } from "@/types";
import type { CateringSelection } from "@/lib/api/catering.service";

import * as cateringService from "@/lib/api/catering.service";
import { toast } from "sonner";

interface MenuCardProps {
  item: MenuItem;
  locationId: string;
  onLoginRequired?: () => void;
}

export const MenuCard: FC<MenuCardProps> = ({
  item,
  locationId,
  onLoginRequired,
}) => {
  const [quantity, setQuantity] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const lastAddedAt = useRef<number>(0);

  const [showMenuTypeAlert, setShowMenuTypeAlert] = useState(false);

  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const [showPackageDialog, setShowPackageDialog] = useState(false);

  const router = useRouter();

  const { addItem, updateItem, cart, fetchCart } = useCartStore();

  const { user, isAuthenticated } = useAuthStore();

  // Only show cart for authenticated customer users
  const isCustomerAuthenticated = isCustomerAuth(user, isAuthenticated);

  // Find existing cart item
  const cartItem = isCustomerAuthenticated
    ? cart?.items.find((ci) => ci.menuItemId === item.id)
    : null;

  const currentQuantity = cartItem?.quantity || 0;

  // Check if cart contains another menu type
  const hasConflictingMenuType = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      return false;
    }

    const existingMenuType =
      cart.items[0].menuType || cart.items[0].menuItem?.menuType;

    return existingMenuType && existingMenuType !== item.menuType;
  };

  // ADD TO CART

  const handleAdd = async () => {
    if (!item.available) return;

    // Authentication gate
    if (!isCustomerAuthenticated) {
      if (onLoginRequired) {
        if (typeof window !== "undefined") {
          const listener = async () => {
            try {
              window.removeEventListener(
                "alarafa:loginSuccess",
                listener as EventListener,
              );
            } catch (e) {}

            try {
              await addItem(item, 1, locationId);

              setQuantity((prev) => prev + 1);
            } catch (err) {
              // Ignore
            }
          };

          try {
            window.addEventListener(
              "alarafa:loginSuccess",
              listener as EventListener,
            );

            setTimeout(() => {
              try {
                window.removeEventListener(
                  "alarafa:loginSuccess",
                  listener as EventListener,
                );
              } catch (e) {}
            }, 30000);
          } catch (e) {}
        }

        onLoginRequired();
      } else {
        router.push("/login?redirect=/menu");
      }

      return;
    }

    // Menu type conflict
    if (hasConflictingMenuType()) {
      setShowMenuTypeAlert(true);
      return;
    }

    // Catering package
    if (item.isCateringPackage) {
      setShowPackageDialog(true);
      return;
    }

    setIsAdding(true);

    try {
      if (cartItem) {
        await updateItem(cartItem.id, currentQuantity + 1);
      } else {
        await addItem(item, 1, locationId);
      }

      setQuantity(currentQuantity + 1);

      lastAddedAt.current = Date.now();
    } catch (error) {
      if ((error as any)?.response?.status === 401) {
        router.push("/login?redirect=/menu");
      } else {
        console.error("Failed to add item:", error);
      }
    } finally {
      setIsAdding(false);
    }
  };

  // CLEAR CART + ADD

  const handleConfirmClearCart = async () => {
    setShowMenuTypeAlert(false);
    setIsAdding(true);

    try {
      await cartService.clearCart();
      await fetchCart();

      await addItem(item, 1, locationId);

      setQuantity(1);
    } catch (error) {
      console.error("Failed to clear cart and add item:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCancelClearCart = () => {
    setShowMenuTypeAlert(false);
  };

  // INCREASE

  const handleIncrease = async () => {
    if (!cartItem) return;

    if (!isCustomerAuthenticated) {
      if (onLoginRequired) {
        if (typeof window !== "undefined") {
          const listener = async () => {
            try {
              window.removeEventListener(
                "alarafa:loginSuccess",
                listener as EventListener,
              );
            } catch (e) {}

            try {
              await updateItem(cartItem.id, currentQuantity + 1);
            } catch (err) {}
          };

          try {
            window.addEventListener(
              "alarafa:loginSuccess",
              listener as EventListener,
            );

            setTimeout(() => {
              try {
                window.removeEventListener(
                  "alarafa:loginSuccess",
                  listener as EventListener,
                );
              } catch (e) {}
            }, 30000);
          } catch (e) {}
        }

        onLoginRequired();
      } else {
        router.push("/login?redirect=/menu");
      }

      return;
    }

    setIsAdding(true);

    try {
      await updateItem(cartItem.id, currentQuantity + 1);
    } catch (error) {
      if ((error as any)?.response?.status === 401) {
        router.push("/login?redirect=/menu");
      } else {
        console.error("Failed to update item:", error);
      }
    } finally {
      setIsAdding(false);
    }
  };

  // DECREASE

  const handleDecrease = async () => {
    if (!cartItem || currentQuantity <= 0) {
      return;
    }

    if (!isCustomerAuthenticated) {
      if (onLoginRequired) {
        if (typeof window !== "undefined") {
          const listener = async () => {
            try {
              window.removeEventListener(
                "alarafa:loginSuccess",
                listener as EventListener,
              );
            } catch (e) {}

            try {
              await updateItem(cartItem.id, currentQuantity - 1);
            } catch (err) {}
          };

          try {
            window.addEventListener(
              "alarafa:loginSuccess",
              listener as EventListener,
            );

            setTimeout(() => {
              try {
                window.removeEventListener(
                  "alarafa:loginSuccess",
                  listener as EventListener,
                );
              } catch (e) {}
            }, 30000);
          } catch (e) {}
        }

        onLoginRequired();
      } else {
        router.push("/login?redirect=/menu");
      }

      return;
    }

    setIsAdding(true);

    try {
      await updateItem(cartItem.id, currentQuantity - 1);
    } catch (error) {
      if ((error as any)?.response?.status === 401) {
        router.push("/login?redirect=/menu");
      } else {
        console.error("Failed to update item:", error);
      }
    } finally {
      setIsAdding(false);
    }
  };

  // CARD CLICK

  const handleCardClick = (e: React.MouseEvent) => {
    if (showDetailDialog || showPackageDialog) {
      return;
    }

    if (Date.now() - lastAddedAt.current < 500) {
      return;
    }

    const target = e.target as HTMLElement;

    if (target.closest("button") || target.closest('[role="button"]')) {
      return;
    }

    if (item.isCateringPackage) {
      setShowPackageDialog(true);
    } else {
      setShowDetailDialog(true);
    }
  };

  // CATERING CUSTOMIZATION

  const handleAddWithCustomizations = async (
    customizations: CartItemCustomization[],
  ) => {
    try {
      setIsAdding(true);

      const response = await cartService.addToCart({
        menuItemId: item.id,
        quantity: 1,
        locationId: locationId,
      });

      const addedCartItem = response.cart.items.find(
        (cartItem) => cartItem.menuItemId === item.id,
      );

      if (!addedCartItem) {
        throw new Error("Failed to find cart item in response");
      }

      const selections: CateringSelection[] = customizations.map((custom) => ({
        optionGroupId: (custom as any).option_id || custom.optionId,

        selectedItemId: (custom as any).choice_id || custom.choiceId,

        additionalPrice:
          (custom as any).price_modifier || custom.priceModifier || 0,
      }));

      await cateringService.saveCartSelections(addedCartItem.id, selections);

      await fetchCart();

      if (response.suggestedItems?.length > 0) {
        useCartStore
          .getState()
          .setSuggestedItems(response.suggestedItems, item.id);
      }

      toast.success(`${item.name} added to cart with your selections`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to add to cart");

      throw error;
    } finally {
      setIsAdding(false);
    }
  };

  // CARD

  return (
    <>
      <div
        onClick={handleCardClick}
        className="
        group
        cursor-pointer
        overflow-hidden
        rounded-[17px]
        border
        border-[#eadfd2]
        bg-[#fffaf2]
        shadow-[0_5px_18px_rgba(70,45,25,0.10)]
        transition-all
        duration-300
        hover:shadow-[0_12px_30px_rgba(70,45,25,0.16)]

        /* MOBILE: compact horizontal card */
        flex
        min-h-[86px]
        items-center
        gap-3
        px-3
        py-2.5

        /* DESKTOP: restore normal card layout */
        sm:block
        sm:min-h-0
        sm:px-0
        sm:py-0
      "
      >
        {/* 
          IMAGE
       */}

        <div
          className="
          relative
          h-[68px]
          w-[68px]
          shrink-0

          sm:h-auto
          sm:w-auto
          sm:p-3
          sm:pb-0
        "
        >
          <div
            className="
            relative
            h-full
            w-full
            overflow-hidden
            rounded-[10px]
            bg-[#eee4d7]

            sm:aspect-[1.65/1]
            sm:h-auto
            sm:rounded-[12px]
          "
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-500
                ease-out
                group-hover:scale-[1.04]
              "
              />
            ) : (
              <div
                className="
                flex
                h-full
                w-full
                items-center
                justify-center
                bg-gradient-to-br
                from-[#f3e7d7]
                to-[#e8d5c0]
              "
              >
                <span
                  className="
                  text-2xl
                  transition-transform
                  duration-500
                  group-hover:scale-110

                  sm:text-6xl
                "
                >
                <img
                  src="/images/food-icon.svg"
                  alt="Food Icon"
                  className="h-10 w-10 sm:h-16 sm:w-16"
                />
                </span>
              </div>
            )}

            {/* VEG / NON-VEG PREMIUM BADGE */}
            <div
              className="
    absolute
    left-1.5
    top-1.5
    z-10

    flex
    items-center
    gap-1
    rounded-full
    border
    border-white/80
    bg-[#fffaf2]/95
    px-1.5
    py-1
    shadow-[0_2px_8px_rgba(0,0,0,0.12)]
    backdrop-blur-md

    sm:left-2.5
    sm:top-2.5
    sm:gap-1.5
    sm:px-2.5
    sm:py-1.5
  "
            >


              {/* TEXT */}
              <span
                className={`
      text-[8px]
      font-extrabold
      uppercase
      leading-none
      tracking-[0.08em]

      sm:text-[10px]
      sm:tracking-[0.1em]

      ${item.isVegetarian ? "text-green-700" : "text-red-700"}
    `}
              >
                {item.isVegetarian ? "VEG" : "NON-VEG"}
              </span>
            </div>

            {/* 
              SPICE LEVEL
           */}

            {item.spiceLevel > 0 && (
              <div
                className="
                absolute
                right-1
                top-1
                flex
                items-center
                gap-0.5
                rounded-full
                bg-[#fffaf2]/95
                px-1
                py-1
                shadow-sm

                sm:right-2.5
                sm:top-2.5
                sm:px-2
                sm:py-1.5
                sm:shadow-md
              "
              >
                {[...Array(item.spiceLevel)].map((_, i) => (
                  <Flame
                    key={i}
                    className="
                    h-2
                    w-2
                    fill-orange-600
                    text-orange-600

                    sm:h-3
                    sm:w-3
                  "
                  />
                ))}
              </div>
            )}

            {/* 
              POPULAR
           */}

            {item.popular && (
              <div
                className="
                absolute
                bottom-1
                left-1
                flex
                items-center
                gap-0.5
                rounded-full
                bg-[#fffaf2]
                px-1.5
                py-1
                text-[8px]
                font-bold
                tracking-wide
                text-[#92251C]
                shadow-sm

                sm:bottom-2.5
                sm:left-2.5
                sm:gap-1
                sm:px-2.5
                sm:py-1.5
                sm:text-[11px]
                sm:shadow-md
              "
              >
                <Star
                  className="
                  h-2
                  w-2
                  fill-[#92251C]

                  sm:h-3
                  sm:w-3
                "
                />

                <span className="hidden sm:inline">Popular</span>
              </div>
            )}

            {/* 
              UNAVAILABLE
           */}

            {!item.available && (
              <div
                className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                bg-black/35
              "
              >
                <span
                  className="
                  hidden
                  rounded-full
                  bg-white
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  tracking-wide
                  text-[#92251C]
                  shadow-lg

                  sm:block
                "
                >
                  Currently Unavailable
                </span>

                {/* Compact mobile indicator */}
                <span
                  className="
                  block
                  rounded-full
                  bg-white
                  px-1.5
                  py-1
                  text-[8px]
                  font-bold
                  text-[#92251C]

                  sm:hidden
                "
                >
                  Unavailable
                </span>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div
          className="
    relative
    min-w-0
    flex-1
    h-[68px]

    sm:static
    sm:h-auto
    sm:px-3.5
    sm:py-3
  "
        >
          {/* MOBILE: CENTERED TITLE + DESCRIPTION */}
          <div
            className="
      absolute
      left-3
      right-3
      top-1/2
      -translate-y-1/2

      sm:static
      sm:translate-y-0
    "
          >
            {/* NAME + PRICE */}
            <div
              className="
        flex
        w-full
        items-center
        justify-between
        gap-2

        sm:static
      "
            >
              <span
                className="
          min-w-0
          flex-1
          truncate
          text-[15px]
          font-bold
          leading-[18px]
          text-[#7a231d]

          sm:whitespace-normal
          sm:text-2xl
        "
              >
                {item.name}
              </span>

              {/* MOBILE PRICE */}
              <span
                className="
          shrink-0
          whitespace-nowrap
          text-[12px]
          font-bold
          leading-[18px]
          text-[#92251C]

          sm:hidden
        "
              >
                S$ {item.price.toFixed(2)}
              </span>
            </div>

            {/* DESCRIPTION */}
            {item.description && (
              <p
                className="
          mt-0.5
          line-clamp-1
          text-[11px]
          leading-[16px]
          text-[#6b625c]

          sm:mt-1.5
          sm:line-clamp-2
          sm:text-[14px]
          sm:leading-[1.45]
        "
              >
                {item.description}
              </p>
            )}
          </div>

          {/* BOTTOM / ADD BUTTON */}
          <div
            className="
      absolute
      bottom-0
      right-3

      sm:static
      sm:mt-4
      sm:flex
      sm:w-full
      sm:justify-between
    "
          >
            {/* DESKTOP PRICE */}
            <span
              className="
        hidden
        sm:block
        sm:text-[19px]
        sm:font-bold
        sm:text-[#92251C]
      "
            >
              S$ {item.price.toFixed(2)}
            </span>

            {/* ADD TO CART */}
            {currentQuantity === 0 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdd();
                }}
                disabled={!item.available || isAdding}
                className="
          flex
          h-7
          w-[68px]
          shrink-0
          items-center
          justify-center
          rounded-[6px]
          bg-[#92251C]
          text-[11px]
          font-bold
          text-white
          transition-colors
          hover:bg-[#7e1f18]
          disabled:cursor-not-allowed
          disabled:opacity-50

          sm:h-9
          sm:w-[115px]
          sm:rounded-[7px]
          sm:text-[13px]
        "
              >
                {isAdding ? (
                  "Adding..."
                ) : item.isCateringPackage ? (
                  "Customize"
                ) : (
                  <>
                    <Plus
                      className="mr-0.5 h-3 w-3 sm:hidden"
                      strokeWidth={3}
                    />

                    <span className="sm:hidden">Add</span>

                    <span className="hidden sm:inline">Add to Cart</span>
                  </>
                )}
              </button>
            ) : (
              <div
                onClick={(e) => e.stopPropagation()}
                className="
          flex
          items-center
          gap-1
          rounded-full
          bg-[#f0e7dc]
          p-0.5
        "
              >
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={isAdding}
                  aria-label="Decrease quantity"
                  className="
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded-full
            bg-white
            text-[#92251C]
            shadow-sm
          "
                >
                  <Minus className="h-3 w-3" strokeWidth={2.2} />
                </button>

                <span
                  className="
            min-w-[22px]
            text-center
            text-xs
            font-bold
            text-[#211a16]
          "
                >
                  {currentQuantity}
                </span>

                <button
                  type="button"
                  onClick={handleIncrease}
                  disabled={isAdding}
                  aria-label="Increase quantity"
                  className="
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded-full
            bg-[#92251C]
            text-white
            shadow-sm
          "
                >
                  <Plus className="h-3 w-3" strokeWidth={2.2} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 
        MENU TYPE CONFLICT
     */}

      <AlertDialog open={showMenuTypeAlert} onOpenChange={setShowMenuTypeAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Cart?</AlertDialogTitle>

            <AlertDialogDescription>
              Your cart contains {cart?.items[0]?.menuType || "other"} items.
              You cannot mix {cart?.items[0]?.menuType || "regular"} and{" "}
              {item.menuType} items in the same order. Do you want to clear your
              cart and add this {item.menuType} item instead?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClearCart}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction onClick={handleConfirmClearCart}>
              Clear Cart & Add Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 
        MENU DETAIL
     */}

      <MenuDetailDialog
        item={item}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />

      {/* 
        CATERING PACKAGE
     */}

      {showPackageDialog && (
        <CateringPackageDialog
          packageItem={item}
          open={showPackageDialog}
          onOpenChange={setShowPackageDialog}
          onAddToCart={handleAddWithCustomizations}
        />
      )}
    </>
  );
};
