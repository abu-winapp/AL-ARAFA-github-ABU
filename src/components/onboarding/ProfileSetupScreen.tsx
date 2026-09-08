'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { User } from 'lucide-react';
import * as profileService from '@/lib/api/profile.service';

interface ProfileFormData {
  name?: string;
  phoneNumber?: string;
}

interface ProfileSetupScreenProps {
  onNext: () => void;
}

export function ProfileSetupScreen({ onNext }: ProfileSetupScreenProps) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      phoneNumber: '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      // Format phone number with +65 prefix if provided
      const phone = data.phoneNumber?.trim()
        ? `+65${data.phoneNumber.trim()}`
        : undefined;

      // Call API to update profile
      const updatedUser = await profileService.updateProfile({
        name: data.name?.trim() || undefined,
        phone,
      });

      // Update auth store with new user data
      setUser(updatedUser);

      // Proceed to next step
      onNext();
    } catch (error) {
      console.error('Failed to update profile:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="text-gray-600">
            Help us personalize your experience (optional)
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* API Error */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm">{apiError}</p>
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold">
              Your Name (Optional)
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              className={`text-base ${errors.name ? 'border-destructive' : ''}`}
              {...register('name', {
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              })}
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Phone Number Field */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-base font-semibold">
              Phone Number (Optional)
            </Label>
            <div className="flex gap-2">
              {/* Country Code */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-700 font-medium">+65</span>
              </div>

              {/* Phone Input */}
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="8 digit number"
                maxLength={8}
                className={`flex-1 text-base ${errors.phoneNumber ? 'border-destructive' : ''}`}
                {...register('phoneNumber', {
                  pattern: {
                    value: /^[0-9]{8}$/,
                    message: 'Must be 8 digits',
                  },
                })}
              />
            </div>
            <p className="text-sm text-gray-500">
              Required for placing orders and delivery updates
            </p>
            {errors.phoneNumber && (
              <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Continue Button */}
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full mt-8"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </form>

        {/* Signing in as */}
        {user?.email && (
          <div className="text-center pt-4">
            <p className="text-sm text-gray-500">Signing in as</p>
            <p className="text-sm font-semibold text-gray-900">{user.email}</p>
          </div>
        )}
      </div>
    </div>
  );
}
