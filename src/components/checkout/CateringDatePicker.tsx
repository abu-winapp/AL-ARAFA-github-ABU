'use client';

/**
 * CateringDatePicker - Date selection component for catering orders
 *
 * Features:
 * - Minimum lead time validation (configurable, default 48 hours)
 * - Disables dates before minimum lead time
 * - Shows selected date prominently
 * - Responsive layout
 */

import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { addHours, startOfDay, format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface CateringDatePickerProps {
  minLeadHours?: number;
  selectedDate: string | null; // ISO date string (YYYY-MM-DD)
  onDateSelect: (date: string) => void;
}

export function CateringDatePicker({
  minLeadHours = 48,
  selectedDate,
  onDateSelect,
}: CateringDatePickerProps) {
  // Calculate minimum selectable date
  const now = new Date();
  const minDateTime = addHours(now, minLeadHours);
  const minDate = startOfDay(minDateTime);

  // Convert selectedDate string to Date object
  const selectedDateObj = selectedDate ? parseISO(selectedDate) : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Convert to ISO date string (YYYY-MM-DD)
      const isoDate = format(date, 'yyyy-MM-dd');
      onDateSelect(isoDate);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Date Display */}
      {selectedDate && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <p className="text-sm text-text-secondary mb-1">Selected Date</p>
          <p className="text-lg font-semibold text-text-primary">
            {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      )}

      {/* Minimum Lead Time Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Catering orders require at least {minLeadHours} hours advance notice.
          Earliest available date: <strong>{format(minDate, 'MMM d, yyyy')}</strong>
        </p>
      </div>

      {/* Calendar */}
      <div className="flex justify-center w-full">
        <div className="w-full max-w-md rounded-lg border shadow-sm bg-white p-4">
          <Calendar
            mode="single"
            selected={selectedDateObj}
            onSelect={handleDateSelect}
            disabled={{ before: minDate }}
            classNames={{
              month: "flex w-full flex-col gap-4",
              table: "w-full border-collapse",
              week: "flex w-full",
            }}
          />
        </div>
      </div>
    </div>
  );
}
