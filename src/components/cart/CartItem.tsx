/**
 * Al-Arafa Restaurant - Cart Item Component
 */

'use client';

import { FC, useState, useEffect } from 'react';
import type { CartItem as CartItemType } from '@/types';
import { useCartStore } from '@/lib/store/useCartStore';
import * as cateringService from '@/lib/api/catering.service';
import type { CateringSelectionWithDetails } from '@/lib/api/catering.service';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: FC<CartItemProps> = ({ item }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selections, setSelections] = useState<CateringSelectionWithDetails[]>([]);
  const [loadingSelections, setLoadingSelections] = useState(false);
  const { updateItem, removeItem } = useCartStore();

  // Support both new API structure (flat fields) and old structure (nested menuItem)
  const itemName = item.itemName || item.menuItem?.name || 'Unknown Item';
  const itemImage = item.imageUrl || item.menuItem?.imageUrl;
  const itemSubtotal = item.lineTotal || item.subtotal || item.unitPrice * item.quantity;

  // Check if this is a catering package (menuType === 'catering' is not enough, we need to check if it has the package flag)
  // For now, we'll fetch selections for all catering items and see if they have any
  const isCateringItem = item.menuType === 'catering';

  // Fetch selections for catering packages
  useEffect(() => {
    const fetchSelections = async () => {
      if (!isCateringItem) return;

      try {
        setLoadingSelections(true);
        const selectionsData = await cateringService.getCartSelections(item.id);
        console.log('Cart selections response:', selectionsData); // Debug log
        setSelections(selectionsData || []);
      } catch (error) {
        console.error('Failed to load selections:', error);
        // Silent fail - selections are optional
        setSelections([]);
      } finally {
        setLoadingSelections(false);
      }
    };

    fetchSelections();
  }, [item.id, isCateringItem]);

  const handleIncrease = async () => {
    setIsUpdating(true);
    try {
      await updateItem(item.id, item.quantity + 1);
    } catch (error) {
      console.error('Failed to update item:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrease = async () => {
    setIsUpdating(true);
    try {
      if (item.quantity > 1) {
        await updateItem(item.id, item.quantity - 1);
      } else {
        await removeItem(item.id);
      }
    } catch (error) {
      console.error('Failed to update item:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await removeItem(item.id);
    } catch (error) {
      console.error('Failed to remove item:', error);
      setIsUpdating(false);
    }
  };

  return (
<div className="group relative flex items-center gap-3 rounded-xl border border-border-light bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md sm:gap-4 sm:p-3.5">
  {/* Image */}
  <div className="h-[76px] w-[76px] flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-secondary/20 sm:h-[84px] sm:w-[84px]">
    {itemImage ? (
      <img loading="lazy" decoding="async"
        src={itemImage}
        alt={itemName}
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center">
        <img loading="lazy" decoding="async"
          src="/images/food-icon.svg"
          alt="Food"
          className="h-9 w-9 object-contain opacity-75"
        />
      </div>
    )}
  </div>

  {/* Details */}
  <div className="min-w-0 flex-1 self-stretch">
    <div className="flex h-full min-w-0 flex-col justify-between">
      {/* Top section */}
      <div className="min-w-0 pr-7">
        <h3 className="truncate text-[15px] font-semibold leading-[1.25] text-text-primary sm:text-[16px]">
          {itemName}
        </h3>

        {/* Catering Package Selections */}
        {isCateringItem && selections.length > 0 && (
          <div className="mt-1.5 min-w-0">
            <div className="mb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
              Selections
            </div>

            <div className="max-h-[54px] space-y-0.5 overflow-hidden">
              {selections.map((selection, index) => {
                // Backend returns groupName (internal ID) and itemName
                const groupName =
                  (selection as any).groupName ||
                  (selection as any).optionGroupLabel ||
                  "";

                const itemName =
                  (selection as any).itemName ||
                  (selection as any).selectedItemName ||
                  "";

                const additionalPrice =
                  selection.additionalPrice ||
                  (selection as any).additional_price ||
                  0;

                // Convert groupName from kebab-case to Title Case for display
                // e.g., "veg-starters" → "Veg Starters"
                const formatGroupName = (name: string) => {
                  return name
                    .split("-")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                    )
                    .join(" ");
                };

                const displayLabel = groupName
                  ? formatGroupName(groupName)
                  : "Option";

                return (
                  <div
                    key={selection.id || index}
                    className="flex min-w-0 items-center gap-1 text-[11px] leading-[1.3]"
                  >
                    <span className="flex-shrink-0 text-text-tertiary">
                      •
                    </span>

                    <span className="flex-shrink-0 text-text-tertiary">
                      {displayLabel}:
                    </span>

                    <span className="min-w-0 flex-1 truncate font-medium text-text-primary">
                      {itemName}
                    </span>

                    {additionalPrice > 0 && (
                      <span className="flex-shrink-0 whitespace-nowrap text-[10px] font-semibold text-green-600">
                        +S$ {additionalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading selections indicator */}
        {isCateringItem && loadingSelections && (
          <div className="mt-1 text-[11px] italic leading-tight text-text-tertiary">
            Loading selections...
          </div>
        )}

        {/* Customizations Display (for backward compatibility) */}
        {item.customizations && item.customizations.length > 0 && (
          <div className="mt-1.5 max-h-[40px] space-y-0.5 overflow-hidden">
            {item.customizations.map((custom, index) => (
              <div
                key={index}
                className="flex min-w-0 items-center gap-1 text-[11px] leading-[1.3] text-text-secondary"
              >
                <span className="flex-shrink-0 font-medium">
                  {custom.optionName}:
                </span>

                <span className="min-w-0 truncate">
                  {custom.choiceName}
                </span>

                {custom.priceModifier > 0 && (
                  <span className="flex-shrink-0 whitespace-nowrap text-green-600">
                    +${custom.priceModifier.toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {item.specialInstructions && (
          <p className="mt-1 max-w-full truncate text-[11px] italic leading-[1.3] text-text-tertiary">
            Note: {item.specialInstructions}
          </p>
        )}
      </div>

      {/* Bottom section */}
      <div className="mt-2 flex min-w-0 items-end justify-between gap-2">
        {/* Price */}
        <div className="min-w-0">
          <div className="truncate text-[16px] font-bold leading-none text-primary sm:text-[17px]">
            S$ {itemSubtotal.toFixed(2)}
          </div>

          {/* Unit Price */}
          <div className="mt-1 text-[10px] leading-none text-text-tertiary">
            S$ {item.unitPrice.toFixed(2)} each
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex flex-shrink-0 items-center gap-0.5 rounded-lg bg-background-gray p-0.5">
          <button
            onClick={handleDecrease}
            disabled={isUpdating}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
          >
            {item.quantity === 1 ? (
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            ) : (
              <span className="text-[16px] leading-none">−</span>
            )}
          </button>

          <span className="min-w-[24px] text-center text-[13px] font-semibold leading-none text-text-primary">
            {item.quantity}
          </span>

          <button
            onClick={handleIncrease}
            disabled={isUpdating}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-[16px] font-semibold leading-none text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* Remove Button */}
  <button
    onClick={handleRemove}
    disabled={isUpdating}
    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-error/10 hover:text-error disabled:opacity-50"
    title="Remove item"
  >
    <svg
      className="h-3.5 w-3.5"
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
  </button>
</div>
  );
};
