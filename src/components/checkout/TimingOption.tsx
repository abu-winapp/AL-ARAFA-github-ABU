'use client';

import React from 'react';
import { Zap, CalendarClock, Clock, Check, Calendar } from 'lucide-react';
import dayjs from 'dayjs';

export type OrderTimingType = 'instant' | 'scheduled';

interface TimingOptionProps {
  orderTiming: OrderTimingType;
  onChange: (timing: OrderTimingType) => void;
  advanceSchedule: {
    scheduledDate: string | null;
    scheduledTime: string | null;
  } | null;
  onOpenScheduleModal: () => void;
  disabled?: boolean;
}

export function TimingOption({
  orderTiming,
  onChange,
  advanceSchedule,
  onOpenScheduleModal,
  disabled = false,
}: TimingOptionProps) {
  const isScheduled = orderTiming === 'scheduled';
  const hasSchedule = Boolean(advanceSchedule?.scheduledDate && advanceSchedule?.scheduledTime);

  const formattedSchedule = hasSchedule
    ? `${dayjs(advanceSchedule!.scheduledDate).format('ddd, D MMM')} at ${advanceSchedule!.scheduledTime}`
    : 'Choose delivery date & time';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Order Now */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange('instant')}
          className={`
            group relative flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200
            ${
              disabled
                ? 'opacity-50 cursor-not-allowed bg-[#F3EFE9] border-[#E5DDD0]'
                : !isScheduled
                  ? 'border-[#95221C] bg-[#FFFDF9] shadow-[0_4px_20px_rgba(149,34,28,0.08)] ring-1 ring-[#95221C]'
                  : 'border-[#EAE2D5] bg-[#FFFFFF] hover:border-[#95221C]/40 hover:bg-[#FDFBF7] shadow-sm'
            }
          `}
        >
          <div
            className={`
              absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200
              ${
                !isScheduled
                  ? 'bg-[#95221C] text-white'
                  : 'border border-[#D0C6B8] bg-transparent text-transparent'
              }
            `}
          >
            <Check className="w-3 h-3 stroke-[3]" />
          </div>

          <div
            className={`
              w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors
              ${
                !isScheduled
                  ? 'bg-[#95221C] text-white shadow-sm'
                  : 'bg-[#F4ECE1] text-[#95221C] group-hover:bg-[#EAE2D5]'
              }
            `}
          >
            <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="flex-1 pr-6 min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-[#1C1613]">
              Order Now
            </h3>
            <p className="text-xs sm:text-sm text-[#8E8279] mt-0.5 leading-relaxed">
              Prepared immediately • ASAP delivery
            </p>
          </div>
        </button>

        {/* Schedule for Later */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            onChange('scheduled');
            if (!hasSchedule) {
              onOpenScheduleModal();
            }
          }}
          className={`
            group relative flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200
            ${
              disabled
                ? 'opacity-50 cursor-not-allowed bg-[#F3EFE9] border-[#E5DDD0]'
                : isScheduled
                  ? 'border-[#95221C] bg-[#FFFDF9] shadow-[0_4px_20px_rgba(149,34,28,0.08)] ring-1 ring-[#95221C]'
                  : 'border-[#EAE2D5] bg-[#FFFFFF] hover:border-[#95221C]/40 hover:bg-[#FDFBF7] shadow-sm'
            }
          `}
        >
          <div
            className={`
              absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200
              ${
                isScheduled
                  ? 'bg-[#95221C] text-white'
                  : 'border border-[#D0C6B8] bg-transparent text-transparent'
              }
            `}
          >
            <Check className="w-3 h-3 stroke-[3]" />
          </div>

          <div
            className={`
              w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors
              ${
                isScheduled
                  ? 'bg-[#95221C] text-white shadow-sm'
                  : 'bg-[#F4ECE1] text-[#95221C] group-hover:bg-[#EAE2D5]'
              }
            `}
          >
            <CalendarClock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="flex-1 pr-6 min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-[#1C1613]">
              Schedule for Later
            </h3>
            <p className="text-xs sm:text-sm text-[#8E8279] mt-0.5 leading-relaxed truncate">
              {hasSchedule ? formattedSchedule : 'Pick a future date & time slot'}
            </p>
          </div>
        </button>
      </div>

      {/* Reveal schedule banner if scheduled is selected */}
      {isScheduled && (
        <div className="flex items-center justify-between p-3.5 bg-[#FFF9ED] border border-[#F2DEB5] rounded-xl text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 text-[#855B14]">
            <Clock className="w-4 h-4 shrink-0 text-[#B88E34]" />
            <span className="font-medium">
              {hasSchedule ? (
                <>Scheduled for: <strong className="font-bold text-[#634208]">{formattedSchedule}</strong></>
              ) : (
                <span className="text-[#A04000] font-semibold">Please select your preferred date & time</span>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenScheduleModal}
            className="text-xs font-bold text-[#95221C] hover:underline shrink-0 ml-2"
          >
            {hasSchedule ? 'Change Time' : 'Select Time'}
          </button>
        </div>
      )}
    </div>
  );
}

