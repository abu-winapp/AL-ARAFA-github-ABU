
/**
 * Al-Arafa Restaurant - Menu Card Component
 */

'use client';

import { FC, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { MenuItem } from '@/types';
import { useCartStore } from '@/lib/store/useCartStore';
import {
  useAuthStore,
  isCustomerAuthenticated as isCustomerAuth,
} from '@/lib/store/useAuthStore';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
  Flame,
  ShoppingCart,
  Plus,
  Minus,
  Star,
} from 'lucide-react';

import * as cartService from '@/lib/api/cart.service';
import { MenuDetailDialog } from '@/components/menu/MenuDetailDialog';
import { CateringPackageDialog } from '@/components/menu/CateringPackageDialog';

import type { CartItemCustomization } from '@/types';
import type { CateringSelection } from '@/lib/api/catering.service';

import * as cateringService from '@/lib/api/catering.service';
import { toast } from 'sonner';

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

  const [showMenuTypeAlert, setShowMenuTypeAlert] =
    useState(false);

  const [showDetailDialog, setShowDetailDialog] =
    useState(false);

  const [showPackageDialog, setShowPackageDialog] =
    useState(false);

  const router = useRouter();

  const {
    addItem,
    updateItem,
    cart,
    fetchCart,
  } = useCartStore();

  const { user, isAuthenticated } = useAuthStore();

  // Only show cart for authenticated customer users
  const isCustomerAuthenticated = isCustomerAuth(
    user,
    isAuthenticated
  );

  // Find existing cart item
  const cartItem = isCustomerAuthenticated
    ? cart?.items.find(
        (ci) => ci.menuItemId === item.id
      )
    : null;

  const currentQuantity =
    cartItem?.quantity || 0;

  // Check if cart contains another menu type
  const hasConflictingMenuType = () => {
    if (
      !cart ||
      !cart.items ||
      cart.items.length === 0
    ) {
      return false;
    }

    const existingMenuType =
      cart.items[0].menuType ||
      cart.items[0].menuItem?.menuType;

    return (
      existingMenuType &&
      existingMenuType !== item.menuType
    );
  };

  
  // ADD TO CART
  

  const handleAdd = async () => {
    if (!item.available) return;

    // Authentication gate
    if (!isCustomerAuthenticated) {
      if (onLoginRequired) {
        if (typeof window !== 'undefined') {
          const listener = async () => {
            try {
              window.removeEventListener(
                'salem:loginSuccess',
                listener as EventListener
              );
            } catch (e) {}

            try {
              await addItem(
                item,
                1,
                locationId
              );

              setQuantity(
                (prev) => prev + 1
              );
            } catch (err) {
              // Ignore
            }
          };

          try {
            window.addEventListener(
              'salem:loginSuccess',
              listener as EventListener
            );

            setTimeout(() => {
              try {
                window.removeEventListener(
                  'salem:loginSuccess',
                  listener as EventListener
                );
              } catch (e) {}
            }, 30000);
          } catch (e) {}
        }

        onLoginRequired();
      } else {
        router.push(
          '/login?redirect=/menu'
        );
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
        await updateItem(
          cartItem.id,
          currentQuantity + 1
        );
      } else {
        await addItem(
          item,
          1,
          locationId
        );
      }

      setQuantity(
        currentQuantity + 1
      );

      lastAddedAt.current =
        Date.now();
    } catch (error) {
      if (
        (error as any)?.response
          ?.status === 401
      ) {
        router.push(
          '/login?redirect=/menu'
        );
      } else {
        console.error(
          'Failed to add item:',
          error
        );
      }
    } finally {
      setIsAdding(false);
    }
  };

  
  // CLEAR CART + ADD
  

  const handleConfirmClearCart =
    async () => {
      setShowMenuTypeAlert(false);
      setIsAdding(true);

      try {
        await cartService.clearCart();
        await fetchCart();

        await addItem(
          item,
          1,
          locationId
        );

        setQuantity(1);
      } catch (error) {
        console.error(
          'Failed to clear cart and add item:',
          error
        );
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
        if (typeof window !== 'undefined') {
          const listener = async () => {
            try {
              window.removeEventListener(
                'salem:loginSuccess',
                listener as EventListener
              );
            } catch (e) {}

            try {
              await updateItem(
                cartItem.id,
                currentQuantity + 1
              );
            } catch (err) {}
          };

          try {
            window.addEventListener(
              'salem:loginSuccess',
              listener as EventListener
            );

            setTimeout(() => {
              try {
                window.removeEventListener(
                  'salem:loginSuccess',
                  listener as EventListener
                );
              } catch (e) {}
            }, 30000);
          } catch (e) {}
        }

        onLoginRequired();
      } else {
        router.push(
          '/login?redirect=/menu'
        );
      }

      return;
    }

    setIsAdding(true);

    try {
      await updateItem(
        cartItem.id,
        currentQuantity + 1
      );
    } catch (error) {
      if (
        (error as any)?.response
          ?.status === 401
      ) {
        router.push(
          '/login?redirect=/menu'
        );
      } else {
        console.error(
          'Failed to update item:',
          error
        );
      }
    } finally {
      setIsAdding(false);
    }
  };

  
  // DECREASE
  

  const handleDecrease = async () => {
    if (
      !cartItem ||
      currentQuantity <= 0
    ) {
      return;
    }

    if (!isCustomerAuthenticated) {
      if (onLoginRequired) {
        if (typeof window !== 'undefined') {
          const listener = async () => {
            try {
              window.removeEventListener(
                'salem:loginSuccess',
                listener as EventListener
              );
            } catch (e) {}

            try {
              await updateItem(
                cartItem.id,
                currentQuantity - 1
              );
            } catch (err) {}
          };

          try {
            window.addEventListener(
              'salem:loginSuccess',
              listener as EventListener
            );

            setTimeout(() => {
              try {
                window.removeEventListener(
                  'salem:loginSuccess',
                  listener as EventListener
                );
              } catch (e) {}
            }, 30000);
          } catch (e) {}
        }

        onLoginRequired();
      } else {
        router.push(
          '/login?redirect=/menu'
        );
      }

      return;
    }

    setIsAdding(true);

    try {
      await updateItem(
        cartItem.id,
        currentQuantity - 1
      );
    } catch (error) {
      if (
        (error as any)?.response
          ?.status === 401
      ) {
        router.push(
          '/login?redirect=/menu'
        );
      } else {
        console.error(
          'Failed to update item:',
          error
        );
      }
    } finally {
      setIsAdding(false);
    }
  };

  
  // CARD CLICK
  

  const handleCardClick = (
    e: React.MouseEvent
  ) => {
    if (
      showDetailDialog ||
      showPackageDialog
    ) {
      return;
    }

    if (
      Date.now() -
        lastAddedAt.current <
      500
    ) {
      return;
    }

    const target =
      e.target as HTMLElement;

    if (
      target.closest('button') ||
      target.closest('[role="button"]')
    ) {
      return;
    }

    if (item.isCateringPackage) {
      setShowPackageDialog(true);
    } else {
      setShowDetailDialog(true);
    }
  };

  
  // CATERING CUSTOMIZATION
  

  const handleAddWithCustomizations =
    async (
      customizations: CartItemCustomization[]
    ) => {
      try {
        setIsAdding(true);

        const response =
          await cartService.addToCart({
            menuItemId: item.id,
            quantity: 1,
            locationId: locationId,
          });

        const addedCartItem =
          response.cart.items.find(
            (cartItem) =>
              cartItem.menuItemId ===
              item.id
          );

        if (!addedCartItem) {
          throw new Error(
            'Failed to find cart item in response'
          );
        }

        const selections: CateringSelection[] =
          customizations.map(
            (custom) => ({
              optionGroupId:
                (custom as any)
                  .option_id ||
                custom.optionId,

              selectedItemId:
                (custom as any)
                  .choice_id ||
                custom.choiceId,

              additionalPrice:
                (custom as any)
                  .price_modifier ||
                custom.priceModifier ||
                0,
            })
          );

        await cateringService.saveCartSelections(
          addedCartItem.id,
          selections
        );

        await fetchCart();

        if (
          response.suggestedItems
            ?.length > 0
        ) {
          useCartStore
            .getState()
            .setSuggestedItems(
              response.suggestedItems,
              item.id
            );
        }

        toast.success(
          `${item.name} added to cart with your selections`
        );
      } catch (error: any) {
        toast.error(
          error?.message ||
            'Failed to add to cart'
        );

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
          bg-[#fffaf2]
          shadow-[0_5px_18px_rgba(70,45,25,0.10)]
          border border-[#eadfD2]
          transition-all
          duration-300
          hover:shadow-[0_12px_30px_rgba(70,45,25,0.16)]
        "
      >
        {/* 
            IMAGE
        - */}

        <div className="relative p-3 pb-0">
          <div
            className="
              relative
              aspect-[1.65/1]
              overflow-hidden
              rounded-[12px]
              bg-[#eee4d7]
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
                    text-6xl
                    transition-transform
                    duration-500
                    group-hover:scale-110
                  "
                >
                  𓌉◯𓇋
                </span>
              </div>
            )}

            {/* 
                VEGETARIAN INDICATOR
            */}

            <div
              className="
                absolute
                left-2.5
                top-2.5
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-[#fffaf2]/95
                shadow-md
                backdrop-blur-sm
              "
            >
              <div
                className={`
                  flex
                  h-[17px]
                  w-[17px]
                  items-center
                  justify-center
                  rounded-[4px]
                  border-[1.5px]
                  ${
                    item.isVegetarian
                      ? 'border-green-600'
                      : 'border-red-600'
                  }
                `}
              >
                <div
                  className={`
                    h-[7px]
                    w-[7px]
                    rounded-full
                    ${
                      item.isVegetarian
                        ? 'bg-green-600'
                        : 'bg-red-600'
                    }
                  `}
                />
              </div>
            </div>

            {/* 
                SPICE LEVEL
            - */}

            {item.spiceLevel > 0 && (
              <div
                className="
                  absolute
                  right-2.5
                  top-2.5
                  flex
                  items-center
                  gap-0.5
                  rounded-full
                  bg-[#fffaf2]/95
                  px-2
                  py-1.5
                  shadow-md
                  backdrop-blur-sm
                "
              >
                {[
                  ...Array(
                    item.spiceLevel
                  ),
                ].map((_, i) => (
                  <Flame
                    key={i}
                    className="
                      h-3
                      w-3
                      fill-orange-600
                      text-orange-600
                    "
                  />
                ))}
              </div>
            )}

            {/* 
                POPULAR
            - */}

            {item.popular && (
              <div
                className="
                  absolute
                  bottom-2.5
                  left-2.5
                  flex
                  items-center
                  gap-1
                  rounded-full
                  bg-[#fffaf2]
                  px-2.5
                  py-1.5
                  text-[11px]
                  font-bold
                  tracking-wide
                  text-[#92251C]
                  shadow-md
                "
              >
                <Star
                  className="
                    h-3
                    w-3
                    fill-[#92251C]
                  "
                />

                Popular
              </div>
            )}

            {/* 
                UNAVAILABLE
            - */}

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
                    rounded-full
                    bg-white
                    px-3
                    py-1.5
                    text-xs
                    font-bold
                    tracking-wide
                    text-[#92251C]
                    shadow-lg
                  "
                >
                  Currently Unavailable
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 
            CONTENT
        - */}

        <div className="px-3.5 pb-4 pt-3">
          <h3
            className="
              line-clamp-1
              text-[18px]
              font-bold
              leading-6
              text-[#211a16]
            "
          >
            {item.name}
          </h3>

          {item.description ? (
            <p
              className="
                mt-1.5
                min-h-[42px]
                line-clamp-2
                text-[14px]
                leading-[1.45]
                text-[#5b514a]
              "
            >
              {item.description}
            </p>
          ) : (
            <div className="min-h-[42px]" />
          )}

          {/* --
              BOTTOM
          --- */}

          <div
            className="
              mt-4
              flex
              min-h-[38px]
              items-center
              justify-between
              gap-3
            "
          >
            {/* Price */}

            <span
              className="
                whitespace-nowrap
                text-[19px]
                font-bold
                tracking-tight
                text-[#92251C]
              "
            >
              S$ {item.price.toFixed(2)}
            </span>

            {/* 
                ADD TO CART
            - */}

            {currentQuantity === 0 ? (

<button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    handleAdd();
  }}
  disabled={!item.available || isAdding}
  data-tooltip={`Price: S$ ${item.price.toFixed(2)}`}
  className="
    group/cart
    relative
    h-9
    w-[115px]
    overflow-visible
    rounded-[7px]
    bg-[#92251C]
    text-white
    transition-colors
    duration-300
    hover:bg-[#7e1f18]
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
>
  {/* Tooltip */}
  <span
    className="
      pointer-events-none
      absolute
      bottom-[calc(100%+14px)]
      left-1/2
      z-20
      w-max
      -translate-x-1/2
      translate-y-2
      rounded-md
      bg-[#3b211d]
      px-3
      py-1.5
      text-xs
      font-medium
      text-white
      opacity-0
      invisible
      transition-all
      duration-300
      group-hover/cart:visible
      group-hover/cart:translate-y-0
      group-hover/cart:opacity-100
    "
  >
    Price: S$ {item.price.toFixed(2)}
  </span>

  {/* Tooltip arrow */}
  <span
    className="
      pointer-events-none
      absolute
      bottom-[calc(100%+6px)]
      left-1/2
      z-20
      h-0
      w-0
      -translate-x-1/2
      border-x-[7px]
      border-x-transparent
      border-t-[8px]
      border-t-[#3b211d]
      opacity-0
      invisible
      transition-all
      duration-300
      group-hover/cart:visible
      group-hover/cart:opacity-100
    "
  />

  {/* Button content */}
  <span className="absolute inset-0 overflow-hidden rounded-[7px]">
    {/* Text */}
    <span
      className="
        absolute
        inset-0
        flex
        items-center
        justify-center
        text-[13px]
        font-semibold
        transition-transform
        duration-500
        ease-in-out
        group-hover/cart:-translate-y-full
      "
    >
      {isAdding
        ? 'Adding...'
        : item.isCateringPackage
        ? 'Customize'
        : 'Add to Cart'}
    </span>

    {/* Cart icon */}
    {!isAdding && (
      <span
        className="
          absolute
          inset-0
          flex
          translate-y-full
          items-center
          justify-center
          transition-transform
          duration-500
          ease-in-out
          group-hover/cart:translate-y-0
        "
      >
        <ShoppingCart
          className="h-5 w-5"
          strokeWidth={2.2}
        />
      </span>
    )}
  </span>
</button>


            ) : (
              /* 
                 QUANTITY CONTROLS
              - */

              <div
                onClick={(e) =>
                  e.stopPropagation()
                }
                className="
                  flex
                  items-center
                  gap-1
                  rounded-full
                  bg-[#f0e7dc]
                  p-1
                "
              >
                <button
                  type="button"
                  onClick={
                    handleDecrease
                  }
                  disabled={isAdding}
                  aria-label="Decrease quantity"
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                    text-[#92251C]
                    shadow-sm
                    transition-all
                    hover:bg-[#92251C]
                    hover:text-white
                    disabled:opacity-50
                  "
                >
                  <Minus
                    className="h-3.5 w-3.5"
                    strokeWidth={2.2}
                  />
                </button>

                <span
                  className="
                    min-w-[24px]
                    text-center
                    text-sm
                    font-bold
                    text-[#211a16]
                  "
                >
                  {currentQuantity}
                </span>

                <button
                  type="button"
                  onClick={
                    handleIncrease
                  }
                  disabled={isAdding}
                  aria-label="Increase quantity"
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    bg-[#92251C]
                    text-white
                    shadow-sm
                    transition-all
                    hover:bg-[#711c16]
                    disabled:opacity-50
                  "
                >
                  <Plus
                    className="h-3.5 w-3.5"
                    strokeWidth={2.2}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --
          MENU TYPE CONFLICT
      --- */}

      <AlertDialog
        open={showMenuTypeAlert}
        onOpenChange={
          setShowMenuTypeAlert
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Clear Cart?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Your cart contains{' '}
              {cart?.items[0]
                ?.menuType || 'other'}{' '}
              items. You cannot mix{' '}
              {cart?.items[0]
                ?.menuType || 'regular'}{' '}
              and {item.menuType} items in
              the same order. Do you want
              to clear your cart and add
              this {item.menuType} item
              instead?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={
                handleCancelClearCart
              }
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={
                handleConfirmClearCart
              }
            >
              Clear Cart & Add Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --
          MENU DETAIL
      --- */}

      <MenuDetailDialog
        item={item}
        open={showDetailDialog}
        onOpenChange={
          setShowDetailDialog
        }
      />

      {/* --
          CATERING PACKAGE
      --- */}

      {showPackageDialog && (
        <CateringPackageDialog
          packageItem={item}
          open={showPackageDialog}
          onOpenChange={
            setShowPackageDialog
          }
          onAddToCart={
            handleAddWithCustomizations
          }
        />
      )}
    </>
  );
};

