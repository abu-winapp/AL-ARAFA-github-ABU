/**
 * Al-Arafa Restaurant - Address Form Component
 */

'use client';

import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import type { SaveAddressRequest } from '@/types';
import { usePostalCodeGeocoding } from '@/lib/hooks/usePostalCodeGeocoding';

interface AddressFormProps {
  onSubmit: (data: SaveAddressRequest) => Promise<void>;
  onCancel: () => void;
  initialData?: SaveAddressRequest;
  isLoading?: boolean;
}

export const AddressForm: FC<AddressFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SaveAddressRequest>({
    defaultValues: initialData,
  });

  const selectedLabel = watch('label');

  // Handle cancel with form reset
  const handleCancel = () => {
    reset();
    onCancel();
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Postal Code - FIRST FIELD */}
      <div className="space-y-2">
        <Label htmlFor="postalCode" className="flex items-center gap-2">
          Postal Code
          {isGeocoding && (
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          )}
        </Label>
        <Input
          id="postalCode"
          placeholder="e.g., 123456"
          maxLength={6}
          className={errors.postalCode ? 'border-destructive' : ''}
          {...register('postalCode', {
            required: 'Postal code is required',
            pattern: {
              value: /^\d{6}$/,
              message: 'Postal code must be 6 digits',
            },
            onChange: handlePostalCodeChange,
          })}
          onBlur={handlePostalCodeBlur}
          disabled={isLoading}
        />
        {errors.postalCode && (
          <p className="text-sm text-destructive">{errors.postalCode.message}</p>
        )}
        {geocodingError && (
          <p className="text-sm text-destructive">{geocodingError}</p>
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
          <p className="text-xs text-gray-500">Enter your postal code to auto-fill address details</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Building Name */}
        <div className="space-y-2">
          <Label htmlFor="buildingName">Building Name (Optional)</Label>
          <Input
            id="buildingName"
            placeholder="Block A"
            className={errors.buildingName ? 'border-destructive' : ''}
            {...register('buildingName')}
            disabled={isLoading}
          />
          {errors.buildingName && (
            <p className="text-sm text-destructive">{errors.buildingName.message}</p>
          )}
        </div>

        {/* Unit Number */}
        <div className="space-y-2">
          <Label htmlFor="unitNumber">Unit Number (Optional)</Label>
          <Input
            id="unitNumber"
            placeholder="#12-34"
            className={errors.unitNumber ? 'border-destructive' : ''}
            {...register('unitNumber')}
            disabled={isLoading}
          />
          {errors.unitNumber && (
            <p className="text-sm text-destructive">{errors.unitNumber.message}</p>
          )}
        </div>
      </div>

      {/* Address Line 1 */}
      <div className="space-y-2">
        <Label htmlFor="addressLine1">Address Line 1</Label>
        <Input
          id="addressLine1"
          placeholder="Street name and number"
          className={errors.addressLine1 ? 'border-destructive' : ''}
          {...register('addressLine1', {
            required: 'Address line 1 is required',
          })}
          disabled={isLoading}
        />
        {errors.addressLine1 && (
          <p className="text-sm text-destructive">{errors.addressLine1.message}</p>
        )}
      </div>

      {/* Address Line 2 (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
        <Input
          id="addressLine2"
          placeholder="Apartment, suite, etc."
          className={errors.addressLine2 ? 'border-destructive' : ''}
          {...register('addressLine2')}
          disabled={isLoading}
        />
        {errors.addressLine2 && (
          <p className="text-sm text-destructive">{errors.addressLine2.message}</p>
        )}
      </div>

      {/* Delivery Instructions */}
      <div className="space-y-2">
        <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
        <Input
          id="deliveryInstructions"
          placeholder="e.g., Ring the doorbell, leave at door"
          className={errors.deliveryInstructions ? 'border-destructive' : ''}
          {...register('deliveryInstructions')}
          disabled={isLoading}
        />
        {errors.deliveryInstructions && (
          <p className="text-sm text-destructive">{errors.deliveryInstructions.message}</p>
        )}
      </div>

      {/* Address Label & Custom Label (side by side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Label */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Label
          </label>
          <div className="flex gap-3">
            {['Home', 'Work', 'Other'].map((labelOption) => (
              <label
                key={labelOption}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  value={labelOption}
                  {...register('label')}
                  disabled={isLoading}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">{labelOption}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Label (only show when "Other" is selected) */}
        {selectedLabel === 'Other' && (
          <div className="space-y-2">
            <Label htmlFor="customLabel">Custom Label</Label>
            <Input
              id="customLabel"
              placeholder="e.g., Office, Friend's Place"
              className={errors.customLabel ? 'border-destructive' : ''}
              {...register('customLabel')}
              disabled={isLoading}
            />
            {errors.customLabel && (
              <p className="text-sm text-destructive">{errors.customLabel.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Default Address Checkbox */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          {...register('isDefault')}
          disabled={isLoading}
          className="w-4 h-4 text-primary rounded focus:ring-primary"
        />
        <span className="text-sm text-text-primary">Set as default delivery address</span>
      </label>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
          className="w-full"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || isGeocoding} className="w-full">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </div>
          ) : isGeocoding ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Loading address...</span>
            </div>
          ) : (
            'Save Address'
          )}
        </Button>
      </div>
    </form>
  );
};
