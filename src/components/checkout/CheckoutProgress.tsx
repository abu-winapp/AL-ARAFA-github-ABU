'use client';

import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

export type CheckoutStep = 'cart' | 'options' | 'review';

interface CheckoutProgressProps {
  currentStep: CheckoutStep;
  onStepClick?: (step: CheckoutStep) => void;
}

interface StepItem {
  id: CheckoutStep;
  number: string;
  label: string;
  href?: string;
}

const STEPS: StepItem[] = [
  { id: 'cart', number: '01', label: 'Cart', href: '/cart' },
  { id: 'options', number: '02', label: 'Options' },
  { id: 'review', number: '03', label: 'Review' },
];

export function CheckoutProgress({ currentStep, onStepClick }: CheckoutProgressProps) {
  const getStepIndex = (step: CheckoutStep) => {
    switch (step) {
      case 'cart':
        return 0;
      case 'options':
        return 1;
      case 'review':
        return 2;
    }
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <nav aria-label="Checkout Progress" className="w-full">
      {/* Mobile Compact Progress (< 640px) */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-[#95221C] tracking-wide uppercase font-bold text-[11px]">
            Step {currentIndex + 1} of 3
          </span>
          <span className="text-[#1C1613] font-medium text-[13px]">
            {STEPS[currentIndex].label}
          </span>
        </div>
        {/* Progress bar track */}
        <div className="h-1 w-full bg-[#EAE2D5] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#95221C] transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop & Tablet Progress (>= 640px) */}
      <ol className="hidden sm:flex items-center justify-center gap-2 md:gap-4">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          const isClickable = isCompleted || (idx === 0 && currentStep !== 'cart');

          const content = (
            <div
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 text-xs md:text-sm font-medium
                ${
                  isCurrent
                    ? 'bg-[#95221C] text-white shadow-sm font-semibold'
                    : isCompleted
                      ? 'bg-[#95221C]/10 text-[#95221C] hover:bg-[#95221C]/15 cursor-pointer'
                      : 'text-[#8E8279] opacity-60'
                }
              `}
            >
              <span
                className={`
                  flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold
                  ${
                    isCurrent
                      ? 'bg-white/20 text-white'
                      : isCompleted
                        ? 'bg-[#95221C] text-white'
                        : 'bg-[#EAE2D5] text-[#8E8279]'
                  }
                `}
              >
                {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : step.number}
              </span>
              <span>{step.label}</span>
            </div>
          );

          return (
            <React.Fragment key={step.id}>
              <li aria-current={isCurrent ? 'step' : undefined}>
                {isClickable ? (
                  step.href ? (
                    <Link href={step.href}>{content}</Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onStepClick?.(step.id)}
                      className="focus:outline-none"
                    >
                      {content}
                    </button>
                  )
                ) : (
                  content
                )}
              </li>
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-6 md:w-10 h-[2px] rounded-full transition-colors ${
                    idx < currentIndex ? 'bg-[#95221C]' : 'bg-[#EAE2D5]'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

