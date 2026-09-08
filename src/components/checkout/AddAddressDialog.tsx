/**
 * Al-Arafa Restaurant - Add Address Dialog Component
 */

'use client';

import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SaveAddressRequest, UserAddress } from '@/types';
import * as addressService from '@/lib/api/address.service';
import { usePostalCodeGeocoding } from '@/lib/hooks/usePostalCodeGeocoding';

interface AddAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddressAdded?: (address: UserAddress) => void;
}

export const AddAddressDialog: FC<AddAddressDialogProps> = ({
  open,
  onOpenChange,
  onAddressAdded,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SaveAddressRequest>({
    defaultValues: {
      label: 'Home',
      isDefault: false,
    },
  });

  const selectedLabel = watch('label');

  // Reset form when dialog closes
  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      clearGeocodingError();
    }
    onOpenChange(isOpen);
  };

  // Postal code geocoding hook
  const {
    geocodePostalCode,
    isLoading: isGeocoding,
    error: geocodingError,
    clearError: clearGeocodingError,
  } = usePostalCodeGeocoding({
    onAddressFound: (data) => {
      // Always update fields when new address is found
      if (data.addressLine1) {
        setValue('addressLine1', data.addressLine1);
      }
      if (data.buildingName) {
        setValue('buildingName', data.buildingName);
      }

      if(data.latitude) {
        setValue('latitude', data.latitude);
      }

      if(data.longitude) {
        setValue('longitude', data.longitude);
      }
    },
  });

  // Handle postal code change to clear errors
  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear geocoding error when user types
    clearGeocodingError();
  };

  // Handle postal code blur event
  const handlePostalCodeBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d{6}$/.test(value)) {
      await geocodePostalCode(value);
    }
  };

  const onSubmit = async (data: SaveAddressRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const newAddress = await addressService.addAddress(data);

      // Reset form and close dialog
      reset();
      clearGeocodingError();
      onOpenChange(false);

      // Notify parent component
      if (onAddressAdded) {
        onAddressAdded(newAddress);
      }
    } catch (err) {
      console.error('Failed to add address:', err);
      setError(err instanceof Error ? err.message : 'Failed to add address');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Delivery Address</DialogTitle>
          <DialogDescription>
            Add a new address for delivery orders.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Row 1: Postal Code (full width) */}
          <div className="space-y-2">
            <Label htmlFor="postalCode" className="flex items-center gap-2">
              Postal Code *
              {isGeocoding && (
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              )}
            </Label>
            <Input
              id="postalCode"
              placeholder="e.g., 123456"
              maxLength={6}
              {...register('postalCode', {
                required: 'Postal code is required',
                pattern: {
                  value: /^\d{6}$/,
                  message: 'Must be 6 digits',
                },
                onChange: handlePostalCodeChange,
              })}
              onBlur={handlePostalCodeBlur}
            />
            {errors.postalCode && (
              <p className="text-xs text-error">{errors.postalCode.message}</p>
            )}
            {geocodingError && (
              <p className="text-xs text-error">{geocodingError}</p>
            )}
            {isGeocoding ? (
              <p className="text-xs text-primary font-medium flex items-center gap-2">
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Fetching address details...
              </p>
            ) : (
              <p className="text-xs text-gray-500">Auto-fills address details</p>
            )}
          </div>

          {/* Row 2: Building Name & Unit Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="buildingName">Building</Label>
              <Input
                id="buildingName"
                placeholder="e.g., Block A"
                {...register('buildingName')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitNumber">Unit No.</Label>
              <Input
                id="unitNumber"
                placeholder="e.g., #12-34"
                {...register('unitNumber')}
              />
            </div>
          </div>

          {/* Row 3: Address Line 1 (full width) */}
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1 *</Label>
            <Input
              id="addressLine1"
              placeholder="e.g., Main Street"
              {...register('addressLine1', { required: 'Address line 1 is required' })}
            />
            {errors.addressLine1 && (
              <p className="text-xs text-error">{errors.addressLine1.message}</p>
            )}
          </div>

          {/* Row 4: Address Line 2 & Delivery Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                placeholder="e.g., Near MRT"
                {...register('addressLine2')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryInstructions">Delivery Notes</Label>
              <Input
                id="deliveryInstructions"
                placeholder="e.g., Leave at door"
                {...register('deliveryInstructions')}
              />
            </div>
          </div>

          {/* Row 5: Address Label & Custom Label (side by side) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="label">Address Label</Label>
              <Select
                value={selectedLabel}
                onValueChange={(value) => setValue('label', value)}
              >
                <SelectTrigger id="label">
                  <SelectValue placeholder="Select label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Home
                    </div>
                  </SelectItem>
                  <SelectItem value="Work">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                      Work
                    </div>
                  </SelectItem>
                  <SelectItem value="Other">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Other
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Label - only show when Other is selected */}
            {selectedLabel === 'Other' && (
              <div className="space-y-2">
                <Label htmlFor="customLabel">Custom Label</Label>
                <Input
                  id="customLabel"
                  placeholder="e.g., Friend's Place"
                  {...register('customLabel')}
                />
              </div>
            )}
          </div>

          {/* Set as Default Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDefault"
              {...register('isDefault')}
              className="w-4 h-4 text-primary border-border-medium rounded focus:ring-primary"
            />
            <Label htmlFor="isDefault" className="cursor-pointer">
              Set as default address
            </Label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-error bg-error/10 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Footer Buttons */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isGeocoding}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </div>
              ) : isGeocoding ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading address...</span>
                </div>
              ) : (
                'Add Address'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
