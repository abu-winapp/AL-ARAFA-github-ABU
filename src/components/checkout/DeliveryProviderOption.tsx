'use client';

import React from 'react';
import { Truck, Loader2, AlertCircle, RefreshCw, Check } from 'lucide-react';
import type { DeliveryQuoteOption } from '@/types';

interface DeliveryProviderOptionProps {
  quotes: DeliveryQuoteOption[];
  selectedQuote: DeliveryQuoteOption | null;
  onSelect: (quote: DeliveryQuoteOption) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function DeliveryProviderOption({
  quotes,
  selectedQuote,
  onSelect,
  isLoading = false,
  error = null,
  onRetry,
}: DeliveryProviderOptionProps) {
  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl border border-[#EAE2D5] bg-[#FFFFFF] flex items-center justify-center gap-3 py-8">
        <Loader2 className="w-5 h-5 animate-spin text-[#95221C]" />
        <span className="text-xs sm:text-sm font-medium text-[#5C524B]">
          Finding best delivery options...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl border border-[#F5C2C7] bg-[#F8D7DA]/40 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#842029] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-[#842029]">
            Unable to calculate live delivery quotes
          </p>
          <p className="text-xs text-[#5C524B] mt-0.5">{error}</p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="p-1.5 text-xs font-semibold text-[#842029] hover:bg-[#842029]/10 rounded-lg transition-colors inline-flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        )}
      </div>
    );
  }

  if (quotes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-[#8E8279] mb-1">
        Select Delivery Partner
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quotes.map((quote) => {
          const isSelected = selectedQuote?.quotationId === quote.quotationId;
          const isAvailable = quote.available;

          return (
            <button
              key={quote.quotationId}
              type="button"
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelect(quote)}
              className={`
                group relative flex items-center justify-between p-3.5 sm:p-4 rounded-xl border text-left transition-all duration-200
                ${
                  !isAvailable
                    ? 'opacity-50 cursor-not-allowed bg-[#F3EFE9] border-[#E5DDD0]'
                    : isSelected
                      ? 'border-[#95221C] bg-[#FFFDF9] ring-1 ring-[#95221C] shadow-sm'
                      : 'border-[#EAE2D5] bg-[#FFFFFF] hover:border-[#95221C]/40 hover:bg-[#FDFBF7]'
                }
              `}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Provider Logo or Fallback */}
                <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#EAE2D5] flex items-center justify-center shrink-0 overflow-hidden">
                  {quote.providerLogo ? (
                    <img
                      src={quote.providerLogo}
                      alt={quote.providerName}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Truck className="w-5 h-5 text-[#95221C]" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-[#1C1613] truncate">
                      {quote.providerName}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8E8279] block mt-0.5">
                    Est. {quote.estimatedTime || `${quote.estimatedMinutes} mins`}
                  </span>
                </div>
              </div>

              {/* Price & Selection */}
              <div className="flex items-center gap-3 shrink-0 text-right">
                <div>
                  <span className="font-bold text-xs sm:text-sm text-[#95221C]">
                    {quote.fee === 0 ? (
                      <span className="text-[#2D6A4F]">FREE</span>
                    ) : (
                      `S$ ${quote.fee.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div
                  className={`
                    w-4 h-4 rounded-full flex items-center justify-center transition-all
                    ${
                      isSelected
                        ? 'bg-[#95221C] text-white'
                        : 'border border-[#D0C6B8] bg-transparent text-transparent'
                    }
                  `}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

