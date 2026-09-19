'use client';

import React from 'react';
import type { CartItem, CateringSelectionWithDetails } from '@/types';

interface OrderItemProps {
  item: CartItem;
  selections?: CateringSelectionWithDetails[];
  compact?: boolean;
}

export function OrderItem({ item, selections = [], compact = false }: OrderItemProps) {
  const itemName = item.itemName || item.menuItem?.name || 'Menu Item';
  const itemImage = item.imageUrl || item.menuItem?.imageUrl;
  const itemSubtotal = item.lineTotal || item.subtotal || item.unitPrice * item.quantity;
  const isCatering = item.menuType === 'catering';

  return (
    <div className={`flex items-start gap-3 py-3 border-b border-[#F0EBE3] last:border-b-0 ${compact ? 'text-xs' : 'text-sm'}`}>
      {/* Thumbnail */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#FAF7F2] border border-[#EAE2D5] overflow-hidden shrink-0 flex items-center justify-center">
        {itemImage ? (
          <img
            src={itemImage}
            alt={itemName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="text-xl">🍛</span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-bold text-[#1C1613] text-xs sm:text-sm leading-snug">
              <span className="text-[#95221C] font-extrabold mr-1.5">{item.quantity}×</span>
              {itemName}
            </h4>
            <div className="text-[11px] text-[#8E8279] mt-0.5">
              S$ {item.unitPrice.toFixed(2)} each
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="font-bold text-xs sm:text-sm text-[#1C1613]">
              S$ {itemSubtotal.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Customizations */}
        {item.customizations && item.customizations.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {item.customizations.map((cust, idx) => (
              <div key={idx} className="text-[11px] text-[#5C524B] flex items-center gap-1">
                <span className="text-[#8E8279]">•</span>
                <span>{cust.optionName}:</span>
                <span className="font-medium text-[#1C1613]">{cust.choiceName}</span>
                {cust.priceModifier > 0 && (
                  <span className="text-[#2D6A4F] font-semibold">
                    (+S$ {cust.priceModifier.toFixed(2)})
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Catering selections */}
        {isCatering && selections.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {selections.map((sel: any, idx: number) => {
              const name = sel.itemName || sel.selectedItemName || '';
              const group = sel.groupName || sel.optionGroupLabel || 'Option';
              return (
                <div key={idx} className="text-[11px] text-[#5C524B] flex items-center gap-1">
                  <span className="text-[#8E8279]">•</span>
                  <span className="capitalize">{group}:</span>
                  <span className="font-medium text-[#1C1613]">{name}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Special instructions */}
        {item.specialInstructions && (
          <p className="mt-1 text-[11px] text-[#8E8279] italic">
            Note: {item.specialInstructions}
          </p>
        )}
      </div>
    </div>
  );
}

