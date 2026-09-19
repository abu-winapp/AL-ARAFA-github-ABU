'use client';

import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

interface StickyCheckoutBarProps {
  total: number;
  ctaText: string;
  onCtaClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  itemCount?: number;
  hintText?: string;
  errorText?: string;
}

export function StickyCheckoutBar({
  total,
  ctaText,
  onCtaClick,
  disabled = false,
  isLoading = false,
  itemCount,
  hintText,
  errorText,
}: StickyCheckoutBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 block md:hidden bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#EAE2D5] shadow-[0_-8px_24px_rgba(28,22,19,0.08)] px-4 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] transition-all">
      {/* Error / Hint Notification */}
      {errorText && (
        <div className="text-[11px] text-center font-semibold text-[#B3261E] pb-2 truncate">
          {errorText}
        </div>
      )}

      <div className="flex items-center justify-between gap-3.5">
        {/* Price column */}
        <div className="flex flex-col min-w-0">
          <div className="text-[11px] font-medium text-[#8E8279] uppercase tracking-wider">
            {hintText || (itemCount ? `${itemCount} items` : 'Total Payable')}
          </div>
          <div className="text-xl font-bold tracking-tight text-[#95221C] truncate">
            S$ {total.toFixed(2)}
          </div>
        </div>

        {/* Primary CTA button */}
        <button
          type="button"
          disabled={disabled || isLoading}
          onClick={onCtaClick}
          className={`
            group relative flex-1 max-w-[220px] flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-md transition-all duration-200 active:scale-[0.98]
            ${
              disabled || isLoading
                ? 'bg-[#B0A79E] opacity-60 cursor-not-allowed shadow-none'
                : 'bg-[#95221C] hover:bg-[#7D1B16] shadow-[0_4px_16px_rgba(149,34,28,0.25)]'
            }
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span className="truncate">{ctaText}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

