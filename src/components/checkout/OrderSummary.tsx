'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ChevronRight, Utensils } from 'lucide-react';
import { PriceBreakdown } from './PriceBreakdown';
import { OrderItem } from './OrderItem';
import type { Cart, DeliveryQuoteOption } from '@/types';

interface OrderSummaryProps {
  cart: Cart | null;
  fulfillmentType: 'delivery' | 'pickup';
  selectedDeliveryQuote: DeliveryQuoteOption | null;
  serviceChargeValue?: number;
  serviceChargeType?: 'percentage' | 'flat';
  serviceCharge?: number;
  gstRate: number;
  gstEnabled: boolean;
  calculatedGST: number;
  pointsDiscount?: number;
  pointsEarned?: number;
  total: number;
  menuType?: 'regular' | 'catering';
  ctaText?: string;
  onCtaClick?: () => void;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
  showCta?: boolean;
  compactItems?: boolean;
  showEditCart?: boolean;
  footerNote?: string;
}

export function OrderSummary({
  cart,
  fulfillmentType,
  selectedDeliveryQuote,
  serviceChargeValue = 0,
  serviceChargeType = 'percentage',
  serviceCharge = 0,
  gstRate,
  gstEnabled,
  calculatedGST,
  pointsDiscount = 0,
  pointsEarned = 0,
  total,
  menuType = 'regular',
  ctaText,
  onCtaClick,
  ctaDisabled = false,
  ctaLoading = false,
  showCta = true,
  compactItems = true,
  showEditCart = true,
  footerNote,
}: OrderSummaryProps) {
  const items = cart?.items || [];
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const isDelivery = fulfillmentType === 'delivery';
  const deliveryFee = isDelivery && selectedDeliveryQuote ? selectedDeliveryQuote.fee : (cart?.deliveryFee || 0);

  return (
    <div className="bg-[#FFFFFF] border border-[#EAE2D5] rounded-2xl p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0EBE3]">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-base sm:text-lg text-[#1C1613]">
            Order Summary
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EAE2D5] text-[#5C524B]">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {showEditCart && (
          <Link
            href="/cart"
            className="text-xs font-semibold text-[#95221C] hover:underline"
          >
            Edit Cart
          </Link>
        )}
      </div>

      {/* Items Preview */}
      <div className="space-y-1 mb-5 max-h-56 overflow-y-auto pr-1">
        {items.map((item) => (
          <OrderItem key={item.id} item={item} compact={compactItems} />
        ))}
      </div>

      {/* Price Breakdown */}
      <PriceBreakdown
        subtotal={cart?.subtotal || 0}
        isDelivery={isDelivery}
        deliveryFee={deliveryFee}
        deliveryProviderName={selectedDeliveryQuote?.providerName}
        platformFee={cart?.platformFee || 0}
        serviceCharge={serviceCharge}
        serviceChargeRate={serviceChargeValue}
        serviceChargeType={serviceChargeType}
        pointsDiscount={pointsDiscount}
        gstAmount={calculatedGST}
        gstRate={gstRate}
        gstEnabled={gstEnabled}
        total={total}
        pointsEarned={pointsEarned}
      />

      {/* Desktop Primary CTA */}
      {showCta && ctaText && onCtaClick && (
        <div className="hidden md:block mt-6 pt-2">
          <button
            type="button"
            disabled={ctaDisabled || ctaLoading}
            onClick={onCtaClick}
            className={`
              w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-white shadow-md transition-all duration-200 flex items-center justify-center gap-2
              ${
                ctaDisabled || ctaLoading
                  ? 'bg-[#B0A79E] opacity-60 cursor-not-allowed shadow-none'
                  : 'bg-[#95221C] hover:bg-[#7D1B16] shadow-[0_4px_16px_rgba(149,34,28,0.22)]'
              }
            `}
          >
            {ctaLoading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>{ctaText}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Footer Notes */}
      {footerNote && (
        <p className="text-[11px] text-[#8E8279] text-center mt-3 leading-relaxed">
          {footerNote}
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-[#F0EBE3] flex items-center justify-center gap-2 text-xs text-[#2D6A4F]">
        <ShieldCheck className="w-4 h-4" />
        <span className="font-medium">100% Authentic South Indian Kitchen</span>
      </div>
    </div>
  );
}

