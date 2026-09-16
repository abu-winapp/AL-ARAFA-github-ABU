'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { Location } from '@/types';

export interface LocationFormData {
  name: string;
  address: string;
  postalCode: string;
  phone: string;
  latitude: number;
  longitude: number;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
  acceptsDelivery: boolean;
  acceptsPickup: boolean;
}

interface LocationFormProps {
  location?: Location;
  onSubmit: (data: LocationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const locationSchema = yup.object({
  name: yup.string().required('Location name is required').max(100, 'Name must be at most 100 characters'),
  address: yup.string().required('Address is required').max(500, 'Address must be at most 500 characters'),
  postalCode: yup
    .string()
    .required('Postal code is required')
    .matches(/^\d{6}$/, 'Must be a valid 6-digit Singapore postal code'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^\+65\d{8}$/, 'Must be a valid Singapore number (+65XXXXXXXX)'),
  latitude: yup
    .number()
    .typeError('Latitude must be a number')
    .required('Latitude is required')
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: yup
    .number()
    .typeError('Longitude must be a number')
    .required('Longitude is required')
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  openingTime: yup.string().required('Opening time is required'),
  closingTime: yup
    .string()
    .required('Closing time is required')
    .test('is-after-opening', 'Closing time must be after opening time', function (value) {
      const { openingTime } = this.parent;
      return !openingTime || !value || value > openingTime;
    }),
  isActive: yup.boolean().default(true),
  acceptsDelivery: yup.boolean().default(true),
  acceptsPickup: yup.boolean().default(true),
});

// Helper function to convert "HH:mm:ss" to "HH:mm" for time input
function formatTimeForInput(time: string | undefined): string {
  if (!time) return '';
  return time.substring(0, 5); // Extract "HH:mm" from "HH:mm:ss"
}

// Helper function to convert "HH:mm" to "HH:mm:ss" for API
function formatTimeForAPI(time: string): string {
  if (!time) return '';
  return `${time}:00`; // Append ":00" for seconds
}

export default function LocationForm({ location, onSubmit, onCancel, isLoading = false }: LocationFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormData>({
    resolver: yupResolver(locationSchema),
    defaultValues: location
      ? {
          name: location.name,
          address: location.address,
          postalCode: location.postalCode,
          phone: location.phone,
          latitude: location.latitude,
          longitude: location.longitude,
          openingTime: formatTimeForInput(location.openingTime),
          closingTime: formatTimeForInput(location.closingTime),
          isActive: location.isActive,
          // Use correct field names, fallback to legacy names if needed
          acceptsDelivery: location.acceptsDelivery ?? location.isDeliveryAvailable ?? true,
          acceptsPickup: location.acceptsPickup ?? location.isPickupAvailable ?? true,
        }
      : {
          name: '',
          address: '',
          postalCode: '',
          phone: '+65',
          latitude: 1.3521, // Default to Singapore's approximate center
          longitude: 103.8198,
          openingTime: '11:00',
          closingTime: '22:00',
          isActive: true,
          acceptsDelivery: true,
          acceptsPickup: true,
        },
  });

  const isActive = watch('isActive');
  const acceptsDelivery = watch('acceptsDelivery');
  const acceptsPickup = watch('acceptsPickup');

  const handleFormSubmit = async (data: LocationFormData) => {
    // Convert time format from "HH:mm" to "HH:mm:ss" before submitting
    const formattedData = {
      ...data,
      openingTime: formatTimeForAPI(data.openingTime),
      closingTime: formatTimeForAPI(data.closingTime),
    };
    await onSubmit(formattedData);
  };

  const disabled = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>

        <div className="space-y-2">
          <Label htmlFor="name">Location Name *</Label>
          <Input id="name" {...register('name')} disabled={disabled} placeholder="Al-Arafa Restaurant - Marina Bay" />
          {errors.name && <p className="text-sm text-error">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            {...register('phone')}
            disabled={disabled}
            placeholder="Enter phone number"
            type="tel"
          />
          {errors.phone && <p className="text-sm text-error">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Textarea
            id="address"
            {...register('address')}
            disabled={disabled}
            placeholder="10 Bayfront Avenue, Marina Bay Sands"
            rows={3}
          />
          {errors.address && <p className="text-sm text-error">{errors.address.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code *</Label>
          <Input
            id="postalCode"
            {...register('postalCode')}
            disabled={disabled}
            placeholder="018956"
            maxLength={6}
          />
          {errors.postalCode && <p className="text-sm text-error">{errors.postalCode.message}</p>}
        </div>
      </div>

      {/* Location Coordinates Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Location Coordinates</h3>
          <p className="text-sm text-muted-foreground">Use Google Maps to find coordinates</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude *</Label>
            <Input
              id="latitude"
              {...register('latitude')}
              disabled={disabled}
              type="number"
              step="any"
              placeholder="1.3521"
            />
            {errors.latitude && <p className="text-sm text-error">{errors.latitude.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude *</Label>
            <Input
              id="longitude"
              {...register('longitude')}
              disabled={disabled}
              type="number"
              step="any"
              placeholder="103.8198"
            />
            {errors.longitude && <p className="text-sm text-error">{errors.longitude.message}</p>}
          </div>
        </div>
      </div>

      {/* Operating Hours Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Operating Hours</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="openingTime">Opening Time *</Label>
            <Input id="openingTime" {...register('openingTime')} disabled={disabled} type="time" />
            {errors.openingTime && <p className="text-sm text-error">{errors.openingTime.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="closingTime">Closing Time *</Label>
            <Input id="closingTime" {...register('closingTime')} disabled={disabled} type="time" />
            {errors.closingTime && <p className="text-sm text-error">{errors.closingTime.message}</p>}
          </div>
        </div>
      </div>

      {/* Service Options Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Service Options</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="isActive" className="text-base font-medium">
                Active Status
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable this location for customer orders
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="acceptsDelivery" className="text-base font-medium">
                Delivery Available
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to order delivery from this location
              </p>
            </div>
            <Switch
              id="acceptsDelivery"
              checked={acceptsDelivery}
              onCheckedChange={(checked) => setValue('acceptsDelivery', checked)}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="acceptsPickup" className="text-base font-medium">
                Self Collect Available
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to pick up orders from this location
              </p>
            </div>
            <Switch
              id="acceptsPickup"
              checked={acceptsPickup}
              onCheckedChange={(checked) => setValue('acceptsPickup', checked)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={disabled}>
          Cancel
        </Button>
        <Button type="submit" disabled={disabled}>
          {disabled ? 'Saving...' : location ? 'Save Changes' : 'Create Location'}
        </Button>
      </div>
    </form>
  );
}
