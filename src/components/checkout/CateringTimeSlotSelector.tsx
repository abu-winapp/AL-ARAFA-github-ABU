'use client';

/**
 * CateringTimeSlotSelector - Time slot selection component for catering orders
 *
 * Features:
 * - Predefined 1-hour time slots from 8 AM to 8 PM
 * - Grid layout (responsive: 1 col mobile, 2 cols tablet, 3 cols desktop)
 * - Visual selection state
 * - Disabled state when no date selected
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface CateringTimeSlotSelectorProps {
  selectedDate: string | null;
  selectedTimeRange: string | null;
  onTimeRangeSelect: (timeRange: string) => void;
  disabled?: boolean;
}

// Predefined time slots (8 AM - 8 PM, 1-hour intervals)
const TIME_SLOTS = [
  { label: '8:00 AM - 9:00 AM', value: '08:00-09:00' },
  { label: '9:00 AM - 10:00 AM', value: '09:00-10:00' },
  { label: '10:00 AM - 11:00 AM', value: '10:00-11:00' },
  { label: '11:00 AM - 12:00 PM', value: '11:00-12:00' },
  { label: '12:00 PM - 1:00 PM', value: '12:00-13:00' },
  { label: '1:00 PM - 2:00 PM', value: '13:00-14:00' },
  { label: '2:00 PM - 3:00 PM', value: '14:00-15:00' },
  { label: '3:00 PM - 4:00 PM', value: '15:00-16:00' },
  { label: '4:00 PM - 5:00 PM', value: '16:00-17:00' },
  { label: '5:00 PM - 6:00 PM', value: '17:00-18:00' },
  { label: '6:00 PM - 7:00 PM', value: '18:00-19:00' },
  { label: '7:00 PM - 8:00 PM', value: '19:00-20:00' },
];

export function CateringTimeSlotSelector({
  selectedDate,
  selectedTimeRange,
  onTimeRangeSelect,
  disabled = false,
}: CateringTimeSlotSelectorProps) {
  const isDisabled = disabled || !selectedDate;

  return (
    <div className="space-y-4">
      {/* Selected Time Range Display */}
      {selectedTimeRange && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <p className="text-sm text-text-secondary mb-1">Selected Time Slot</p>
          <p className="text-lg font-semibold text-text-primary">
            {TIME_SLOTS.find((slot) => slot.value === selectedTimeRange)?.label || selectedTimeRange}
          </p>
        </div>
      )}

      {/* Instruction Text */}
      {isDisabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Please select a date first before choosing a time slot.
          </p>
        </div>
      )}

      {/* Time Slot Grid */}
      <div
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3',
          isDisabled && 'opacity-50 pointer-events-none'
        )}
      >
        {TIME_SLOTS.map((slot) => {
          const isSelected = selectedTimeRange === slot.value;

          return (
            <button
              key={slot.value}
              type="button"
              onClick={() => onTimeRangeSelect(slot.value)}
              disabled={isDisabled}
              className={cn(
                'p-4 rounded-lg border-2 text-center transition-all',
                'hover:border-primary-500 hover:bg-primary-50',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                isSelected
                  ? 'border-primary-600 bg-primary-100 text-primary-900 font-semibold shadow-md'
                  : 'border-gray-200 bg-white text-text-primary',
                isDisabled && 'cursor-not-allowed'
              )}
            >
              <span className="text-sm md:text-base">{slot.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
