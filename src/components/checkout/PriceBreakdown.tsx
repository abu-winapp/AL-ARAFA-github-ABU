'use client';

import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

interface PriceBreakdownProps {
  subtotal: number;
  deliveryFee?: number;
  deliveryProviderName?: string;
  platformFee?: number;
  serviceCharge?: number;
  serviceChargeRate?: number;
  serviceChargeType?: 'percentage' | 'flat';
  pointsDiscount?: number;
  gstAmount: number;
  gstRate: number;
  gstEnabled: boolean;
  total: number;
  pointsEarned?: number;
  isDelivery?: boolean;
  showPointsEarned?: boolean;
}

export function PriceBreakdown({
  subtotal,
  deliveryFee = 0,
  deliveryProviderName,
  platformFee = 0,
  serviceCharge = 0,
  serviceChargeRate = 0,
  serviceChargeType = 'percentage',
  pointsDiscount = 0,
  gstAmount,
  gstRate,
  gstEnabled,
  total,
  pointsEarned = 0,
  isDelivery = true,
  showPointsEarned = true,
}: PriceBreakdownProps) {
  return (
    <div className="space-y-3 text-xs sm:text-sm">
      {/* Subtotal */}
      <div className="flex items-center justify-between text-[#5C524B]">
        <span>Item Subtotal</span>
        <span className="font-semibold text-[#1C1613]">
          S$ {subtotal.toFixed(2)}
        </span>
      </div>

      {/* Delivery Fee */}
      {isDelivery && (
        <div className="flex items-center justify-between text-[#5C524B]">
          <div className="flex flex-col">
            <span>Delivery Fee</span>
            {deliveryProviderName && (
              <span className="text-[11px] text-[#8E8279]">
                via {deliveryProviderName}
              </span>
            )}
          </div>
          <span className="font-semibold text-[#1C1613]">
            {deliveryFee === 0 ? (
              <span className="text-[#2D6A4F] font-bold">FREE</span>
            ) : (
              `S$ ${deliveryFee.toFixed(2)}`
            )}
          </span>
        </div>
      )}

      {/* Platform Fee */}
      {platformFee > 0 && (
        <div className="flex items-center justify-between text-[#5C524B]">
          <span>Platform Fee</span>
          <span className="font-semibold text-[#1C1613]">
            S$ {platformFee.toFixed(2)}
          </span>
        </div>
      )}

      {/* Service Charge */}
      {serviceCharge > 0 && (
        <div className="flex items-center justify-between text-[#5C524B]">
          <span>
            Service Charge{' '}
            {serviceChargeRate > 0 &&
              (serviceChargeType === 'percentage'
                ? `(${serviceChargeRate}%)`
                : '(Flat)')}
          </span>
          <span className="font-semibold text-[#1C1613]">
            S$ {serviceCharge.toFixed(2)}
          </span>
        </div>
      )}

      {/* Points Discount */}
      {pointsDiscount > 0 && (
        <div className="flex items-center justify-between text-[#2D6A4F] font-medium">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Points Discount</span>
          </span>
          <span className="font-bold">
            - S$ {pointsDiscount.toFixed(2)}
          </span>
        </div>
      )}

      {/* GST */}
      <div className="flex items-center justify-between text-[#5C524B]">
        <span>GST {gstEnabled ? `(${gstRate}%)` : ''}</span>
        <span className="font-semibold text-[#1C1613]">
          S$ {gstEnabled ? gstAmount.toFixed(2) : '0.00'}
        </span>
      </div>

      {/* Total Separator */}
      <div className="border-t border-[#EAE2D5] pt-3.5 mt-2">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-sm sm:text-base font-bold text-[#1C1613] block">
              Total Amount
            </span>
            <span className="text-[11px] text-[#8E8279]">
              Inclusive of all taxes & fees
            </span>
          </div>

          <div className="text-right">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#95221C]">
              S$ {total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Loyalty Points to Earn */}
      {showPointsEarned && pointsEarned > 0 && (
        <div className="mt-3 p-2.5 rounded-xl bg-[#FAF3E0] border border-[#F0DFBE] flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5 text-[#7A5B14] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#B88E34]" />
            <span>Loyalty Reward</span>
          </span>
          <span className="font-bold text-[#573F0A]">
            +{pointsEarned} Points
          </span>
        </div>
      )}
    </div>
  );
}

