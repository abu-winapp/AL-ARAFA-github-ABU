'use client';

import React from 'react';
import { MapPin, Store, Plus, ChevronRight, Phone, Clock } from 'lucide-react';
import type { UserAddress, Location } from '@/types';

interface AddressSummaryProps {
  fulfillmentType: 'delivery' | 'pickup';
  selectedAddress: UserAddress | null;
  pickupLocation: Location | null;
  onOpenAddressSelector: () => void;
  onAddNewAddress: () => void;
  isLoading?: boolean;
}

export function AddressSummary({
  fulfillmentType,
  selectedAddress,
  pickupLocation,
  onOpenAddressSelector,
  onAddNewAddress,
  isLoading = false,
}: AddressSummaryProps) {
  if (fulfillmentType === 'delivery') {
    if (isLoading) {
      return (
        <div className="p-5 rounded-2xl border border-[#EAE2D5] bg-[#FFFFFF] animate-pulse">
          <div className="h-4 bg-[#EAE2D5] rounded w-1/4 mb-3" />
          <div className="h-5 bg-[#EAE2D5] rounded w-3/4 mb-2" />
          <div className="h-4 bg-[#EAE2D5] rounded w-1/2" />
        </div>
      );
    }

    if (!selectedAddress) {
      return (
        <div className="p-6 rounded-2xl border-2 border-dashed border-[#E5DDD0] bg-[#FAF7F2] text-center">
          <div className="w-12 h-12 rounded-full bg-[#EAE2D5]/60 flex items-center justify-center mx-auto mb-3 text-[#5C524B]">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#1C1613] mb-1">
            No delivery address selected
          </h3>
          <p className="text-xs sm:text-sm text-[#8E8279] max-w-sm mx-auto mb-4">
            Select a saved address or add a new delivery location in Singapore.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenAddressSelector}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#FFFFFF] border border-[#D0C6B8] hover:border-[#95221C] text-[#1C1613] transition-colors"
            >
              Choose Saved Address
            </button>
            <button
              type="button"
              onClick={onAddNewAddress}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#95221C] text-white hover:bg-[#7D1B16] transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>
        </div>
      );
    }

    const fullAddress = [
      selectedAddress.unitNumber ? `#${selectedAddress.unitNumber}` : null,
      selectedAddress.buildingName || null,
      selectedAddress.addressLine1 || null,
      selectedAddress.addressLine2 || null,
      `Singapore ${selectedAddress.postalCode}`,
    ]
      .filter(Boolean)
      .join(', ');

    return (
      <div className="p-4 sm:p-5 rounded-2xl border border-[#EAE2D5] bg-[#FFFFFF] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#95221C]/10 text-[#95221C] flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm sm:text-base text-[#1C1613]">
                {selectedAddress.customLabel || selectedAddress.label || 'Delivery Address'}
              </span>
              {selectedAddress.isDefault && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FAF3E0] text-[#B88E34] px-2 py-0.5 rounded-md border border-[#F0DFBE]">
                  Default
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#5C524B] leading-relaxed break-words">
              {fullAddress}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F0EBE3] w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onOpenAddressSelector}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#D0C6B8] hover:border-[#95221C] text-[#1C1613] hover:text-[#95221C] transition-colors"
          >
            Change
          </button>
          <button
            type="button"
            onClick={onAddNewAddress}
            className="p-1.5 text-[#5C524B] hover:text-[#95221C] rounded-lg hover:bg-[#FAF7F2] transition-colors"
            title="Add another address"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Pickup Location
  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-[#EAE2D5] bg-[#FFFFFF] shadow-sm">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#95221C]/10 text-[#95221C] flex items-center justify-center shrink-0 mt-0.5">
          <Store className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm sm:text-base text-[#1C1613]">
            {pickupLocation?.name || 'Salem RR Briyani Restaurant'}
          </h3>
          <p className="text-xs sm:text-sm text-[#5C524B] mt-0.5 leading-relaxed">
            {pickupLocation?.address || 'Authentic South Indian Dining'}
            {pickupLocation?.postalCode ? `, Singapore ${pickupLocation.postalCode}` : ''}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#8E8279]">
            {pickupLocation?.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#5C524B]" />
                <span>{pickupLocation.phone}</span>
              </span>
            )}
            {pickupLocation?.openingTime && pickupLocation?.closingTime && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#5C524B]" />
                <span>{pickupLocation.openingTime} - {pickupLocation.closingTime}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

