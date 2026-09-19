'use client';

import React from 'react';

interface SectionHeaderProps {
  number?: string | number;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  number,
  title,
  subtitle,
  action,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div className="flex items-start gap-3">
        {number && (
          <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#95221C]/10 text-[#95221C] text-xs sm:text-sm font-bold shrink-0 mt-0.5">
            {number}
          </div>
        )}
        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-[#1C1613]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#8E8279] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

