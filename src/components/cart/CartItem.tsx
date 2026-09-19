/**
 * Al-Arafa Restaurant - Cart Item Component
 */

'use client';

import { FC, useState, useEffect } from 'react';
import type { CartItem as CartItemType } from '@/types';
import { useCartStore } from '@/lib/store/useCartStore';
import * as cateringService from '@/lib/api/catering.service';
import type { CateringSelectionWithDetails } from '@/lib/api/catering.service';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: FC<CartItemProps> = ({ item }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selections, setSelections] = useState<CateringSelectionWithDetails[]>([]);
  const [loadingSelections, setLoadingSelections] = useState(false);
  const { updateItem, removeItem } = useCartStore();

  const itemName = item.itemName || item.menuItem?.name || 'Unknown Item';
  const itemImage = item.imageUrl || item.menuItem?.imageUrl;
  const itemSubtotal = item.lineTotal || item.subtotal || item.unitPrice * item.quantity;
  const isCateringItem = item.menuType === 'catering';

  useEffect(() => {
    const fetchSelections = async () => {
      if (!isCateringItem) return;

      try {
        setLoadingSelections(true);
        const selectionsData = await cateringService.getCartSelections(item.id);
        setSelections(selectionsData || []);
      } catch (error) {
        console.error('Failed to load selections:', error);
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
    <div className="group relative flex items-start gap-3.5 sm:gap-4 rounded-2xl border border-[#EAE2D5] bg-[#FFFFFF] p-3.5 sm:p-4 shadow-sm hover:border-[#95221C]/30 hover:shadow-md transition-all duration-200">
      {/* Item Image */}
      <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-[#FAF7F2] border border-[#EAE2D5] flex items-center justify-center">
        {itemImage ? (
          <img
            src={itemImage}
            alt={itemName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="text-3xl">🍛</span>
        )}
      </div>

      {/* Item Info */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex flex-col h-full justify-between">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#1C1613] leading-snug truncate">
              {itemName}
            </h3>

            {/* Price line */}
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-bold text-sm sm:text-base text-[#95221C]">
                S$ {itemSubtotal.toFixed(2)}
              </span>
              <span className="text-[11px] text-[#8E8279]">
                S$ {item.unitPrice.toFixed(2)} each
              </span>
            </div>

            {/* Catering Package Selections */}
            {isCateringItem && selections.length > 0 && (
              <div className="mt-2 space-y-1 bg-[#FAF7F2] rounded-lg p-2 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E8279]">
                  Package Selections:
                </div>
                {selections.map((selection, index) => {
                  const groupName =
                    (selection as any).groupName ||
                    (selection as any).optionGroupLabel ||
                    '';
                  const selItemName =
                    (selection as any).itemName ||
                    (selection as any).selectedItemName ||
                    '';
                  const additionalPrice =
                    selection.additionalPrice ||
                    (selection as any).additional_price ||
                    0;

                  const formatGroupName = (name: string) =>
                    name
                      .split('-')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');

                  return (
                    <div key={index} className="flex items-center gap-1.5 text-[11px] text-[#5C524B]">
                      <span className="text-[#95221C]">•</span>
                      <span className="text-[#8E8279]">{formatGroupName(groupName)}:</span>
                      <span className="font-medium text-[#1C1613] truncate">{selItemName}</span>
                      {additionalPrice > 0 && (
                        <span className="text-[#2D6A4F] font-semibold">
                          (+S$ {additionalPrice.toFixed(2)})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Customizations */}
            {item.customizations && item.customizations.length > 0 && (
              <div className="mt-1.5 space-y-0.5 text-xs text-[#5C524B]">
                {item.customizations.map((custom, index) => (
                  <div key={index} className="flex items-center gap-1 text-[11px]">
                    <span className="text-[#8E8279]">•</span>
                    <span>{custom.optionName}:</span>
                    <span className="font-medium text-[#1C1613]">{custom.choiceName}</span>
                    {custom.priceModifier > 0 && (
                      <span className="text-[#2D6A4F] font-semibold">
                        (+S$ {custom.priceModifier.toFixed(2)})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Special instructions */}
            {item.specialInstructions && (
              <p className="mt-1.5 text-[11px] text-[#8E8279] italic truncate">
                Note: {item.specialInstructions}
              </p>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="mt-3 flex items-center justify-between">
            <div className="inline-flex items-center rounded-xl bg-[#FAF7F2] border border-[#EAE2D5] p-0.5">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={isUpdating}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#1C1613] shadow-xs hover:bg-[#95221C] hover:text-white transition-colors disabled:opacity-50"
                title={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
              >
                {item.quantity === 1 ? (
                  <Trash2 className="w-3.5 h-3.5 text-[#B3261E] hover:text-white" />
                ) : (
                  <Minus className="w-3.5 h-3.5" />
                )}
              </button>

              <span className="min-w-[28px] text-center text-xs font-bold text-[#1C1613]">
                {item.quantity}
              </span>

              <button
                type="button"
                onClick={handleIncrease}
                disabled={isUpdating}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#95221C] text-white shadow-xs hover:bg-[#7D1B16] transition-colors disabled:opacity-50"
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Delete button */}
      <button
        type="button"
        onClick={handleRemove}
        disabled={isUpdating}
        className="absolute right-3 top-3 p-1 rounded-full text-[#8E8279] hover:text-[#B3261E] hover:bg-[#B3261E]/10 transition-colors disabled:opacity-50"
        title="Remove item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
