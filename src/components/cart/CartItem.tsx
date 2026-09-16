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
    <div className="bg-white rounded-xl p-4 shadow-md border border-border-light flex gap-4 items-center">
      {/* Image */}
      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-secondary/30 flex items-center justify-center">
        {itemImage ? (
          <img
            src={itemImage}
            alt={itemName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl">🍛</span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-text-primary text-lg mb-1 truncate">
          {itemName}
        </h3>

        {/* Catering Package Selections */}
        {isCateringItem && selections.length > 0 && (
          <div className="mt-3 mb-2">
            <div className="text-xs font-medium text-text-tertiary mb-2">
              Selections
            </div>
            <div className="space-y-1.5">
              {selections.map((selection, index) => {
                // Backend returns groupName (internal ID) and itemName
                const groupName = (selection as any).groupName || (selection as any).optionGroupLabel || '';
                const itemName = (selection as any).itemName || (selection as any).selectedItemName || '';
                const additionalPrice = selection.additionalPrice || (selection as any).additional_price || 0;

                // Convert groupName from kebab-case to Title Case for display
                // e.g., "veg-starters" → "Veg Starters"
                const formatGroupName = (name: string) => {
                  return name
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                };

                const displayLabel = groupName ? formatGroupName(groupName) : 'Option';

                return (
                  <div key={selection.id || index} className="text-sm flex items-baseline gap-1.5">
                    <span className="text-text-tertiary text-xs">•</span>
                    <span className="text-text-tertiary">{displayLabel}:</span>
                    <span className="text-text-primary font-medium flex-1">{itemName}</span>
                    {additionalPrice > 0 && (
                      <span className="text-green-600 text-xs font-semibold whitespace-nowrap">
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
          <div className="mt-2 mb-3 text-xs text-text-tertiary italic">
            Loading selections...
          </div>
        )}

        {/* Customizations Display (for backward compatibility) */}
        {item.customizations && item.customizations.length > 0 && (
          <div className="mt-2 space-y-1">
            {item.customizations.map((custom, index) => (
              <div key={index} className="text-sm text-text-secondary flex items-start gap-2">
                <span className="font-medium">{custom.optionName}:</span>
                <span>{custom.choiceName}</span>
                {custom.priceModifier > 0 && (
                  <span className="text-green-600">+${custom.priceModifier.toFixed(2)}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {item.specialInstructions && (
          <p className="text-sm text-text-tertiary mb-2 italic">
            Note: {item.specialInstructions}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-primary">
            S$ {itemSubtotal.toFixed(2)}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-3 bg-background-gray rounded-lg p-1">
            <button
              onClick={handleDecrease}
              disabled={isUpdating}
              className="w-8 h-8 rounded-lg bg-white hover:bg-primary hover:text-white transition-colors flex items-center justify-center font-bold text-primary disabled:opacity-50"
            >
              {item.quantity === 1 ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              ) : (
                '−'
              )}
            </button>
            <span className="font-bold text-text-primary min-w-[24px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={isUpdating}
              className="w-8 h-8 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors flex items-center justify-center font-bold disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>

        {/* Unit Price */}
        <div className="text-xs text-text-tertiary mt-2">
          S$ {item.unitPrice.toFixed(2)} each
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={handleRemove}
        disabled={isUpdating}
        className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors disabled:opacity-50"
        title="Remove item"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
