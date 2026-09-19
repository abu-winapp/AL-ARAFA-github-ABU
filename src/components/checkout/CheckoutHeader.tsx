'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

interface CheckoutHeaderProps {
  title?: string;
  subtitle?: string;
  backHref?: string;
  onBack?: () => void;
  backLabel?: string;
  children?: React.ReactNode;
}

export function CheckoutHeader({
  title = 'Checkout',
  subtitle,
  backHref,
  onBack,
  backLabel = 'Back',
  children,
}: CheckoutHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#FBF8F4]/90 backdrop-blur-md border-b border-[#EAE2D5] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: Back navigation */}
          <div className="flex items-center gap-3 min-w-[120px]">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#5C524B] hover:text-[#95221C] transition-colors py-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-[#EAE2D5]/60 group-hover:bg-[#95221C]/10 flex items-center justify-center transition-colors">
                  <ArrowLeft className="w-4 h-4 text-[#1C1613] group-hover:text-[#95221C] transition-transform group-hover:-translate-x-0.5" />
                </div>
                <span className="hidden sm:inline">{backLabel}</span>
              </button>
            ) : backHref ? (
              <Link
                href={backHref}
                className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#5C524B] hover:text-[#95221C] transition-colors py-2"
              >
                <div className="w-8 h-8 rounded-full bg-[#EAE2D5]/60 group-hover:bg-[#95221C]/10 flex items-center justify-center transition-colors">
                  <ArrowLeft className="w-4 h-4 text-[#1C1613] group-hover:text-[#95221C] transition-transform group-hover:-translate-x-0.5" />
                </div>
                <span className="hidden sm:inline">{backLabel}</span>
              </Link>
            ) : null}
          </div>

          {/* Center: Brand / Title */}
          <div className="flex flex-col items-center justify-center text-center">
            <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#1C1613]">
                Salem RR Briyani
              </span>
            </Link>
            {subtitle && (
              <span className="text-[11px] sm:text-xs text-[#8E8279] tracking-wide">
                {subtitle}
              </span>
            )}
          </div>

          {/* Right: Security Badge */}
          <div className="flex items-center justify-end min-w-[120px]">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#2D6A4F] bg-[#E8F5EE] px-2.5 py-1 rounded-full font-medium border border-[#C5E8D4]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secure Checkout</span>
            </div>
            <div className="sm:hidden flex items-center text-[#2D6A4F]" title="100% Secure Checkout">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Optional Sub-bar (e.g. CheckoutProgress) */}
        {children && <div className="pb-3 pt-1 sm:pb-4">{children}</div>}
      </div>
    </header>
  );
}

