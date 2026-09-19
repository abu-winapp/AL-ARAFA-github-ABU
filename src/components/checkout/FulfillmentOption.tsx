'use client';

import React from 'react';
import { Truck, Store, Check } from 'lucide-react';

export type FulfillmentType = 'delivery' | 'pickup';

interface FulfillmentOptionProps {
  selectedType: FulfillmentType;
  onChange: (type: FulfillmentType) => void;
  homeDeliveryAvailable: boolean;
  pickFromStoreAvailable: boolean;
  disabled?: boolean;
}

export function FulfillmentOption({
  selectedType,
  onChange,
  homeDeliveryAvailable,
  pickFromStoreAvailable,
  disabled = false,
}: FulfillmentOptionProps) {
  const options = [
    {
      id: 'delivery' as FulfillmentType,
      title: 'Home Delivery',
      description: 'Delivered fresh to your address',
      icon: <Truck className="w-5 h-5 sm:w-6 sm:h-6" />,
      available: homeDeliveryAvailable,
      unavailableNote: 'Delivery currently unavailable',
    },
    {
      id: 'pickup' as FulfillmentType,
      title: 'Self Collect',
      description: 'Pick up directly from our kitchen',
      icon: <Store className="w-5 h-5 sm:w-6 sm:h-6" />,
      available: pickFromStoreAvailable,
      unavailableNote: 'Pickup currently unavailable',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {options.map((opt) => {
        const isSelected = selectedType === opt.id;
        const isAvailable = opt.available;
        const isDisabled = disabled || !isAvailable;

        return (
          <button
            key={opt.id}
            type="button"
            disabled={isDisabled}
            onClick={() => isAvailable && onChange(opt.id)}
            className={`
              group relative flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200
              ${
                isDisabled
                  ? 'opacity-50 cursor-not-allowed bg-[#F3EFE9] border-[#E5DDD0]'
                  : isSelected
                    ? 'border-[#95221C] bg-[#FFFDF9] shadow-[0_4px_20px_rgba(149,34,28,0.08)] ring-1 ring-[#95221C]'
                    : 'border-[#EAE2D5] bg-[#FFFFFF] hover:border-[#95221C]/40 hover:bg-[#FDFBF7] shadow-sm'
              }
            `}
          >
            {/* Selection Checkmark / Indicator */}
            <div
              className={`
                absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200
                ${
                  isSelected
                    ? 'bg-[#95221C] text-white'
                    : 'border border-[#D0C6B8] bg-transparent text-transparent'
                }
              `}
            >
              <Check className="w-3 h-3 stroke-[3]" />
            </div>

            {/* Icon */}
            <div
              className={`
                w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors
                ${
                  isSelected
                    ? 'bg-[#95221C] text-white shadow-sm'
                    : 'bg-[#F4ECE1] text-[#95221C] group-hover:bg-[#EAE2D5]'
                }
              `}
            >
              {opt.icon}
            </div>

            {/* Text */}
            <div className="flex-1 pr-6 min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-[#1C1613]">
                {opt.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#8E8279] mt-0.5 leading-relaxed">
                {isAvailable ? opt.description : opt.unavailableNote}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

