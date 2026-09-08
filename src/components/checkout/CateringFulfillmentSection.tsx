'use client';

/**
 * CateringFulfillmentSection - Delivery/Self Collect selection for catering orders
 *
 * Features:
 * - Delivery/Self Collect segmented button selector
 * - Conditional rendering: address selector for delivery, location details for pickup
 * - Validation indicators
 * - Responsive layout
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import { MapPin, Home, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserAddress, Location } from '@/types';

interface CateringFulfillmentSectionProps {
  fulfillmentType: 'delivery' | 'pickup';
  onFulfillmentChange: (type: 'delivery' | 'pickup') => void;
  selectedAddress: UserAddress | null;
  onAddressSelect: (address: UserAddress) => void;
  addresses: UserAddress[];
  location: Location | null;
  onAddAddress: () => void;
}

export function CateringFulfillmentSection({
  fulfillmentType,
  onFulfillmentChange,
  selectedAddress,
  onAddressSelect,
  addresses,
  location,
  onAddAddress,
}: CateringFulfillmentSectionProps) {
  return (
    <div className="space-y-6">
      {/* Fulfillment Type Selector */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-text-secondary">Select Fulfillment Method</Label>
        <div className="inline-flex rounded-lg bg-gray-100 p-1 w-full">
          <button
            type="button"
            onClick={() => onFulfillmentChange('delivery')}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-md text-sm font-semibold transition-all ${
              fulfillmentType === 'delivery'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <MapPin className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Delivery</div>
              <div className="text-xs font-normal">We'll deliver to your address</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onFulfillmentChange('pickup')}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-md text-sm font-semibold transition-all ${
              fulfillmentType === 'pickup'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Home className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Self Collect</div>
              <div className="text-xs font-normal">Pick up from our location</div>
            </div>
          </button>
        </div>
      </div>

      {/* Delivery Mode: Address Selector */}
      {fulfillmentType === 'delivery' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-text-primary">Delivery Address</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddAddress}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Address</span>
            </Button>
          </div>

          {addresses.length === 0 ? (
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-text-secondary mb-3">No saved addresses</p>
              <Button type="button" variant="outline" onClick={onAddAddress}>
                Add Your First Address
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => {
                const isSelected = selectedAddress?.id === address.id;
                return (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => onAddressSelect(address)}
                    className={cn(
                      'w-full p-4 rounded-lg border-2 text-left transition-all',
                      'hover:border-primary-500 hover:bg-primary-50',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                      isSelected
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 bg-white',
                      !selectedAddress && 'border-red-300'
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <MapPin
                        className={cn(
                          'h-5 w-5 mt-0.5',
                          isSelected ? 'text-primary-600' : 'text-gray-400'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-semibold text-text-primary">
                            {address.label === 'Other' && address.customLabel
                              ? address.customLabel
                              : address.label}
                          </p>
                          {address.isDefault && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary">
                          {address.fullAddress || address.addressLine1}
                        </p>
                        {address.unitNumber && (
                          <p className="text-sm text-text-secondary">Unit: {address.unitNumber}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!selectedAddress && addresses.length > 0 && (
            <p className="text-sm text-red-600">Please select a delivery address</p>
          )}
        </div>
      )}

      {/* Pickup Mode: Location Details */}
      {fulfillmentType === 'pickup' && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-text-primary">Self Collect Location</h3>

          {location ? (
            <div className="p-4 rounded-lg border-2 border-primary-600 bg-primary-50">
              <div className="flex items-start space-x-3">
                <Home className="h-5 w-5 text-primary-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary mb-1">{location.name}</p>
                  <p className="text-sm text-text-secondary mb-2">
                    {location.address}, {location.postalCode}
                  </p>
                  <p className="text-sm text-text-secondary">
                    <span className="font-medium">Phone:</span> {location.phone}
                  </p>
                  {location.openingTime && location.closingTime && (
                    <p className="text-sm text-text-secondary mt-1">
                      <span className="font-medium">Hours:</span> {location.openingTime} -{' '}
                      {location.closingTime}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 border-2 border-dashed border-red-300 rounded-lg text-center">
              <Home className="h-10 w-10 text-red-400 mx-auto mb-3" />
              <p className="text-red-600">No pickup location selected</p>
              <p className="text-sm text-text-secondary mt-2">
                Please select a location from the catering menu
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
